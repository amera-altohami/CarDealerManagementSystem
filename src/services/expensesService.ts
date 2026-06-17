import type {
  ExpenseType,
  PaymentMethod,
} from '@/data/dealerOperationsMockData'
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
import { db } from '@/lib/firebase'

const COLLECTION_NAME = 'expenses'
const DELETE_BLOCKED_MESSAGE =
  'This expense cannot be deleted because related records exist.'
const DELETE_NOT_FOUND_MESSAGE = 'Expense was not found.'

type FirestoreDate = Timestamp | Date | string | null

export interface ExpenseDocument {
  id: string
  car_id: string
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
  carId: string
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
  carId: string
  expenseType: ExpenseType
  amount: number
  paidBy: string
  paymentMethod: PaymentMethod
  date: string
  notes?: string
  invoiceName?: string
  invoiceUrl?: string
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
  car_id: string
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

export class ExpenseDeleteBlockedError extends Error {
  references: ExpenseReferences

  constructor(references: ExpenseReferences) {
    super(DELETE_BLOCKED_MESSAGE)
    this.name = 'ExpenseDeleteBlockedError'
    this.references = references
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
    carId: data.car_id,
    carName: normalizeOptionalText(data.car_name) || data.car_id,
    expenseType: data.expense_type,
    paidBy: data.paid_by,
    paymentMethod: data.payment_method,
    invoiceName: data.invoice_name ?? null,
    invoiceUrl: data.invoice_url ?? null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function toCreateDocumentData(
  data: CreateExpenseData
): ExpenseCreateDocumentData {
  return {
    car_id: data.carId.trim(),
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
  data: UpdateExpenseData
): ExpenseUpdateDocumentData {
  const documentData: ExpenseUpdateDocumentData = {
    updated_at: serverTimestamp(),
  }

  if (data.carId !== undefined) {
    documentData.car_id = data.carId.trim()
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
  const docRef = await addDoc(
    collection(db, COLLECTION_NAME),
    toCreateDocumentData(data)
  )

  await updateDoc(docRef, { id: docRef.id })

  const created = await getExpenseById(docRef.id)

  if (!created) {
    throw new Error('Failed to save expense.')
  }

  return created
}

export async function updateExpense(
  id: string,
  data: UpdateExpenseData
): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, id), toUpdateDocumentData(data))
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

export { createExpense as create }
export { deleteExpense as delete }
export { getExpenses as getAll }
export { getExpenseById as getById }
export { updateExpense as update }
