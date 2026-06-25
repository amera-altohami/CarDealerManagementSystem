import { FirebaseError } from 'firebase/app'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type FieldValue,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore'
import { z } from 'zod'
import { db } from '@/lib/firebase'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import type { ExpenseType, PaymentMethod } from '@/types/dealer'

const COLLECTION_NAME = 'expenses'
const CAR_COLLECTION_NAME = 'cars'
const expenseTypeValues = [
  'Purchase',
  'Shipping',
  'Repair',
  'Parts',
  'Labor',
  'Inspection',
  'Fees',
  'Other',
] as const
const expensePaymentMethods = ['Zelle', 'Cash', 'Card'] as const
const DELETE_BLOCKED_MESSAGE =
  'This expense cannot be deleted because related records exist.'
const DELETE_NOT_FOUND_MESSAGE = 'Expense was not found.'

type FirestoreDate = Timestamp | Date | string | null

export interface ExpenseDocument {
  id: string
  car_id?: string | null
  car_name?: string | null
  expense_type: ExpenseType
  amount: number
  paid_by: string
  payment_method: PaymentMethod
  date: string
  notes?: string | null
  invoice_name?: string | null
  invoice_url?: string | null
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export interface Expense extends ExpenseDocument {
  carId: string | null
  carName: string
  expenseType: ExpenseType
  paidBy: string
  paymentMethod: PaymentMethod
  invoiceName?: string | null
  invoiceUrl?: string | null
  createdAt?: FirestoreDate
  updatedAt?: FirestoreDate
}

export type CreateExpenseData = {
  carId?: string | null
  expenseType: ExpenseType
  amount: number
  paidBy: string
  paymentMethod: PaymentMethod
  date: string
  notes?: string | null
  invoiceName?: string | null
  invoiceUrl?: string | null
}

export type UpdateExpenseData = Partial<CreateExpenseData>

export interface ExpenseReferences {
  parts: number
  activityLogs: number
  notifications: number
}

export interface ExpenseDeleteCheck {
  canDelete: boolean
  exists: boolean
  references: ExpenseReferences
}

type ExpenseWriteDocumentData = {
  car_id?: string | null
  car_name?: string | null
  expense_type: ExpenseType
  amount: number
  paid_by: string
  payment_method: PaymentMethod
  date: string
  notes: string | null
  invoice_name: string | null
  invoice_url: string | null
}

type ExpenseCreateDocumentData = ExpenseWriteDocumentData & {
  created_at: FieldValue
  updated_at: FieldValue
}

type ExpenseUpdateDocumentData = Partial<ExpenseWriteDocumentData> & {
  updated_at: FieldValue
}

const expenseInputSchema = z.object({
  carId: z.string().trim().optional().nullable(),
  expenseType: z.enum(expenseTypeValues),
  amount: z.number().finite().min(0, 'Please enter a valid amount.'),
  paidBy: z.string().trim().min(2, 'Please select who paid this expense.'),
  paymentMethod: z.enum(expensePaymentMethods),
  date: z
    .string()
    .trim()
    .min(1, 'Please select a date.')
    .refine((value) => isValidDate(value), {
      message: 'Please select a valid date.',
    }),
  notes: z.string().trim().optional().nullable(),
  invoiceName: z.string().trim().optional().nullable(),
  invoiceUrl: z.string().trim().optional().nullable(),
})

const expenseUpdateSchema = expenseInputSchema.partial().superRefine(
  (data, ctx) => {
    if (
      data.date !== undefined &&
      typeof data.date === 'string' &&
      !isValidDate(data.date)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a valid date.',
        path: ['date'],
      })
    }
  }
)

export class ExpenseDeleteBlockedError extends Error {
  references: ExpenseReferences

  constructor(references: ExpenseReferences) {
    super(DELETE_BLOCKED_MESSAGE)
    this.name = 'ExpenseDeleteBlockedError'
    this.references = references
  }
}

export class ExpenseValidationError extends Error {
  issues: string[]

  constructor(issues: string[]) {
    super(issues[0] ?? 'Expense data is invalid.')
    this.name = 'ExpenseValidationError'
    this.issues = issues
  }
}

export class ExpenseNotFoundError extends Error {
  constructor() {
    super(DELETE_NOT_FOUND_MESSAGE)
    this.name = 'ExpenseNotFoundError'
  }
}

function normalizeText(value?: string | null) {
  if (value === undefined) return undefined
  if (value === null) return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeOptionalText(value?: string | null) {
  return normalizeText(value) ?? ''
}

function normalizeNullableText(value?: string | null) {
  return normalizeText(value) ?? null
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime())
}

function sortByDateDesc(expenses: Expense[]) {
  return [...expenses].sort((first, second) =>
    second.date.localeCompare(first.date)
  )
}

function mapExpenseSnapshot(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): Expense {
  const data = {
    id: snapshot.id,
    ...(snapshot.data() as Omit<ExpenseDocument, 'id'>),
  } as ExpenseDocument

  return {
    ...data,
    carId: normalizeNullableText(data.car_id),
    carName: normalizeOptionalText(data.car_name) || data.car_id || '',
    expenseType: data.expense_type,
    paidBy: data.paid_by,
    paymentMethod: data.payment_method,
    invoiceName: data.invoice_name ?? null,
    invoiceUrl: data.invoice_url ?? null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function createValidationError(error: z.ZodError) {
  return new ExpenseValidationError(
    error.issues.map((issue) => issue.message).filter(Boolean)
  )
}

async function resolveCarName(carId?: string | null) {
  const normalizedCarId = normalizeNullableText(carId)

  if (!normalizedCarId) {
    return null
  }

  const snapshot = await getDoc(doc(db, CAR_COLLECTION_NAME, normalizedCarId))

  if (!snapshot.exists()) {
    throw new ExpenseValidationError(['Selected car was not found.'])
  }

  const car = snapshot.data() as {
    brand?: string
    model?: string
    year?: number
  }

  const brand = car.brand?.trim() || ''
  const model = car.model?.trim() || ''
  const year = car.year ? String(car.year) : ''

  return [brand, model, year].filter(Boolean).join(' ').trim() || normalizedCarId
}

async function prepareCreateData(data: CreateExpenseData) {
  const parsed = expenseInputSchema.safeParse(data)

  if (!parsed.success) {
    throw createValidationError(parsed.error)
  }

  const carName = await resolveCarName(parsed.data.carId)

  return {
    data: parsed.data,
    carName,
  }
}

async function prepareUpdateData(data: UpdateExpenseData) {
  const parsed = expenseUpdateSchema.safeParse(data)

  if (!parsed.success) {
    throw createValidationError(parsed.error)
  }

  const carName =
    parsed.data.carId !== undefined
      ? await resolveCarName(parsed.data.carId)
      : undefined

  return {
    data: parsed.data,
    carName,
  }
}

function toCreateDocumentData(
  data: CreateExpenseData,
  carName: string | null
): ExpenseCreateDocumentData {
  return {
    car_id: normalizeNullableText(data.carId),
    car_name: carName,
    expense_type: data.expenseType,
    amount: Number(data.amount),
    paid_by: data.paidBy.trim(),
    payment_method: data.paymentMethod,
    date: data.date,
    notes: normalizeText(data.notes) ?? null,
    invoice_name: normalizeText(data.invoiceName) ?? null,
    invoice_url: normalizeText(data.invoiceUrl) ?? null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }
}

function toUpdateDocumentData(
  data: UpdateExpenseData,
  carName?: string | null
): ExpenseUpdateDocumentData {
  const documentData: ExpenseUpdateDocumentData = {
    updated_at: serverTimestamp(),
  }

  if (data.carId !== undefined) {
    documentData.car_id = normalizeNullableText(data.carId)
    if (carName !== undefined) {
      documentData.car_name = carName
    }
  }

  if (data.expenseType !== undefined) {
    documentData.expense_type = data.expenseType
  }

  if (data.amount !== undefined) {
    documentData.amount = Number(data.amount)
  }

  if (data.paidBy !== undefined) {
    documentData.paid_by = data.paidBy.trim()
  }

  if (data.paymentMethod !== undefined) {
    documentData.payment_method = data.paymentMethod
  }

  if (data.date !== undefined) {
    documentData.date = data.date
  }

  if (data.notes !== undefined) {
    documentData.notes = normalizeText(data.notes) ?? null
  }

  if (data.invoiceName !== undefined) {
    documentData.invoice_name = normalizeText(data.invoiceName) ?? null
  }

  if (data.invoiceUrl !== undefined) {
    documentData.invoice_url = normalizeText(data.invoiceUrl) ?? null
  }

  return documentData
}

async function getReferenceCount(
  collectionName: string,
  constraints: QueryConstraint[]
) {
  const snapshot = await getDocs(
    query(collection(db, collectionName), ...constraints)
  )

  return snapshot.size
}

export async function getExpenses(): Promise<Expense[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'))
  )

  return snapshot.docs.map(mapExpenseSnapshot)
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))

  return snapshot.exists() ? mapExpenseSnapshot(snapshot) : null
}

export async function getExpensesByCarId(carId: string): Promise<Expense[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), where('car_id', '==', carId))
  )

  return sortByDateDesc(snapshot.docs.map(mapExpenseSnapshot))
}

export async function createExpense(data: CreateExpenseData): Promise<Expense> {
  try {
    const prepared = await prepareCreateData(data)
    const docRef = await addDoc(
      collection(db, COLLECTION_NAME),
      toCreateDocumentData(prepared.data, prepared.carName)
    )

    await updateDoc(docRef, { id: docRef.id })

    const created = await getExpenseById(docRef.id)

    if (!created) {
      throw new Error('Failed to save expense.')
    }

    return created
  } catch (error) {
    return rethrowExpenseError(error)
  }
}

export async function updateExpense(
  id: string,
  data: UpdateExpenseData
): Promise<void> {
  try {
    const prepared = await prepareUpdateData(data)
    await updateDoc(
      doc(db, COLLECTION_NAME, id),
      toUpdateDocumentData(prepared.data, prepared.carName)
    )
  } catch (error) {
    rethrowExpenseError(error)
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const deleteCheck = await canDeleteExpense(id)

  if (!deleteCheck.exists) {
    throw new ExpenseNotFoundError()
  }

  if (!deleteCheck.canDelete) {
    throw new ExpenseDeleteBlockedError(deleteCheck.references)
  }

  await deleteDoc(doc(db, COLLECTION_NAME, id))
}

export async function canDeleteExpense(
  id: string
): Promise<ExpenseDeleteCheck> {
  const expenseSnapshot = await getDoc(doc(db, COLLECTION_NAME, id))
  const emptyReferences: ExpenseReferences = {
    parts: 0,
    activityLogs: 0,
    notifications: 0,
  }

  if (!expenseSnapshot.exists()) {
    return {
      canDelete: false,
      exists: false,
      references: emptyReferences,
    }
  }

  const [parts, activityLogs, notifications] = await Promise.all([
    getReferenceCount('parts', [where('expense_id', '==', id)]),
    getReferenceCount('activity_logs', [
      where('entity_type', '==', 'expense'),
      where('entity_id', '==', id),
    ]),
    getReferenceCount('notifications', [where('related_expense_id', '==', id)]),
  ])

  const references = {
    parts,
    activityLogs,
    notifications,
  }

  return {
    canDelete: Object.values(references).every((count) => count === 0),
    exists: true,
    references,
  }
}

export async function getTotalExpensesByCarId(carId: string): Promise<number> {
  const expenses = await getExpensesByCarId(carId)

  return expenses.reduce((sum, expense) => sum + expense.amount, 0)
}

function rethrowExpenseError(error: unknown): never {
  if (
    error instanceof ExpenseValidationError ||
    error instanceof ExpenseDeleteBlockedError ||
    error instanceof ExpenseNotFoundError
  ) {
    throw error
  }

  if (error instanceof FirebaseError) {
    throw new Error(getFirestoreErrorMessage(error))
  }

  if (error instanceof Error) {
    throw error
  }

  throw new Error(getFirestoreErrorMessage(error))
}

export { createExpense as create }
export { deleteExpense as delete }
export { getExpenses as getAll }
export { getExpenseById as getById }
export { updateExpense as update }
