import { FirebaseError } from 'firebase/app'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
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

const COLLECTION_NAME = 'parts'
const SUPPLIER_COLLECTION_NAME = 'companies'
const CAR_COLLECTION_NAME = 'cars'
const DELETE_BLOCKED_MESSAGE =
  'This part cannot be deleted because it is currently in use.'
const NOT_FOUND_MESSAGE = 'Part was not found.'

type FirestoreDate = Timestamp | Date | string | null

export interface PartDocument {
  id: string
  part_name: string
  price: number
  supplier_id?: string | null
  supplier_name: string
  purchase_date: string
  installed: boolean
  related_car_id?: string | null
  related_car_name?: string | null
  invoice_name?: string | null
  invoice_url?: string | null
  notes?: string | null
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export interface Part {
  id: string
  partName: string
  price: number
  supplierId?: string | null
  supplierName: string
  purchaseDate: string
  installed: boolean
  relatedCarId?: string | null
  relatedCarName?: string | null
  invoiceName?: string | null
  invoiceUrl?: string | null
  notes?: string | null
  createdAt?: FirestoreDate
  updatedAt?: FirestoreDate
}

export interface PartReferences {
  orders: number
  inventory: number
  transactions: number
  invoices: number
  expenses: number
  notifications: number
}

export interface PartDeleteCheck {
  canDelete: boolean
  references: PartReferences
}

export interface PartPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PartPageResult {
  items: Part[]
  pagination: PartPagination
}

export interface PartFilters {
  search?: string
  supplierId?: string
  carId?: string
  installed?: boolean
  page?: number
  pageSize?: number
}

export type CreatePartData = {
  partName: string
  price: number
  supplierId: string
  purchaseDate: string
  installed: boolean
  relatedCarId?: string | null
  invoiceName?: string | null
  invoiceUrl?: string | null
  notes?: string | null
}

export type UpdatePartData = Partial<CreatePartData>

type PartCreateDocumentData = Omit<
  PartDocument,
  'id' | 'created_at' | 'updated_at'
> & {
  created_at: FieldValue
  updated_at: FieldValue
}

type PartUpdateDocumentData = Partial<
  Omit<PartDocument, 'id' | 'created_at' | 'updated_at'>
> & {
  updated_at: FieldValue
}

const partInputSchema = z.object({
  partName: z.string().trim().min(2, 'Please enter a part name.'),
  price: z.number().finite().min(0, 'Please enter a valid price.'),
  supplierId: z.string().trim().min(1, 'Please select a supplier.'),
  purchaseDate: z
    .string()
    .trim()
    .min(1, 'Please select a purchase date.')
    .refine((value) => isValidDate(value), {
      message: 'Please select a valid purchase date.',
    }),
  installed: z.boolean(),
  relatedCarId: z.string().trim().optional().nullable(),
  invoiceName: z.string().trim().optional().nullable(),
  invoiceUrl: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
})

const partUpdateSchema = partInputSchema.partial().superRefine((data, ctx) => {
  if (
    data.purchaseDate !== undefined &&
    typeof data.purchaseDate === 'string' &&
    !isValidDate(data.purchaseDate)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please select a valid purchase date.',
      path: ['purchaseDate'],
    })
  }
})

export class PartValidationError extends Error {
  issues: string[]

  constructor(issues: string[]) {
    super(issues[0] ?? 'Part data is invalid.')
    this.name = 'PartValidationError'
    this.issues = issues
  }
}

export class PartDeleteBlockedError extends Error {
  references: PartReferences

  constructor(references: PartReferences) {
    super(DELETE_BLOCKED_MESSAGE)
    this.name = 'PartDeleteBlockedError'
    this.references = references
  }
}

export class PartNotFoundError extends Error {
  constructor() {
    super(NOT_FOUND_MESSAGE)
    this.name = 'PartNotFoundError'
  }
}

function normalizeText(value?: string | null) {
  if (value === undefined) return undefined
  if (value === null) return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime())
}

function normalizeNullableString(value?: string | null) {
  const normalized = normalizeText(value)
  return normalized === undefined ? undefined : normalized
}

function mapPartSnapshot(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): Part {
  const data = {
    id: snapshot.id,
    ...(snapshot.data() as Omit<PartDocument, 'id'>),
  } as PartDocument

  return {
    id: data.id,
    partName: data.part_name,
    price: data.price ?? 0,
    supplierId: data.supplier_id ?? null,
    supplierName: data.supplier_name ?? data.supplier_id ?? '',
    purchaseDate: data.purchase_date,
    installed: data.installed ?? false,
    relatedCarId: data.related_car_id ?? null,
    relatedCarName: data.related_car_name ?? null,
    invoiceName: data.invoice_name ?? null,
    invoiceUrl: data.invoice_url ?? null,
    notes: data.notes ?? null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function createValidationError(error: z.ZodError) {
  return new PartValidationError(
    error.issues.map((issue) => issue.message).filter(Boolean)
  )
}

function toCreateDocumentData(
  data: CreatePartData,
  supplierName: string,
  relatedCarName: string | null
): PartCreateDocumentData {
  return {
    part_name: data.partName.trim(),
    price: Number(data.price),
    supplier_id: data.supplierId.trim(),
    supplier_name: supplierName,
    purchase_date: data.purchaseDate,
    installed: data.installed,
    related_car_id: normalizeNullableString(data.relatedCarId) ?? null,
    related_car_name: relatedCarName,
    invoice_name: normalizeNullableString(data.invoiceName) ?? null,
    invoice_url: normalizeNullableString(data.invoiceUrl) ?? null,
    notes: normalizeNullableString(data.notes) ?? null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }
}

function toUpdateDocumentData(
  data: UpdatePartData,
  supplierName?: string,
  relatedCarName?: string | null
): PartUpdateDocumentData {
  const documentData: PartUpdateDocumentData = {
    updated_at: serverTimestamp(),
  }

  if (data.partName !== undefined) {
    documentData.part_name = data.partName.trim()
  }

  if (data.price !== undefined) {
    documentData.price = Number(data.price)
  }

  if (data.supplierId !== undefined) {
    documentData.supplier_id = data.supplierId.trim()
    if (supplierName !== undefined) {
      documentData.supplier_name = supplierName
    }
  }

  if (data.purchaseDate !== undefined) {
    documentData.purchase_date = data.purchaseDate
  }

  if (data.installed !== undefined) {
    documentData.installed = data.installed
  }

  if (data.relatedCarId !== undefined) {
    documentData.related_car_id =
      normalizeNullableString(data.relatedCarId) ?? null
    if (relatedCarName !== undefined) {
      documentData.related_car_name = relatedCarName
    }
  }

  if (data.invoiceName !== undefined) {
    documentData.invoice_name = normalizeNullableString(data.invoiceName) ?? null
  }

  if (data.invoiceUrl !== undefined) {
    documentData.invoice_url = normalizeNullableString(data.invoiceUrl) ?? null
  }

  if (data.notes !== undefined) {
    documentData.notes = normalizeNullableString(data.notes) ?? null
  }

  return documentData
}

async function getExistingPartSnapshot(id: string) {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))

  if (!snapshot.exists()) {
    throw new PartNotFoundError()
  }

  return snapshot
}

async function getReferenceCount(
  collectionName: string,
  fieldName: string,
  partId: string
) {
  const snapshot = await getCountFromServer(
    query(collection(db, collectionName), where(fieldName, '==', partId))
  )

  return snapshot.data().count
}

async function getPartReferences(id: string): Promise<PartReferences> {
  const [orders, inventory, transactions, invoices, expenses, notifications] =
    await Promise.all([
      getReferenceCount('orders', 'part_id', id),
      getReferenceCount('inventory', 'part_id', id),
      getReferenceCount('transactions', 'part_id', id),
      getReferenceCount('invoices', 'part_id', id),
      getReferenceCount('expenses', 'part_id', id),
      getReferenceCount('notifications', 'related_part_id', id),
    ])

  return {
    orders,
    inventory,
    transactions,
    invoices,
    expenses,
    notifications,
  }
}

function applySearchFilter(parts: Part[], searchTerm?: string) {
  const search = searchTerm?.trim().toLowerCase()

  if (!search) {
    return parts
  }

  return parts.filter((part) =>
    [
      part.partName,
      part.supplierName,
      part.relatedCarName ?? '',
      part.invoiceName ?? '',
      part.notes ?? '',
    ]
      .join(' ')
      .toLowerCase()
      .includes(search)
  )
}

function sortPartsByPurchaseDateDesc(parts: Part[]) {
  return [...parts].sort((first, second) =>
    second.purchaseDate.localeCompare(first.purchaseDate)
  )
}

function applyFilters(parts: Part[], filters: PartFilters = {}) {
  let filtered = parts

  if (filters.supplierId) {
    filtered = filtered.filter((part) => part.supplierId === filters.supplierId)
  }

  if (filters.carId) {
    filtered = filtered.filter((part) => {
      if (filters.carId === 'standalone') {
        return !part.relatedCarId
      }

      return part.relatedCarId === filters.carId
    })
  }

  if (typeof filters.installed === 'boolean') {
    filtered = filtered.filter((part) => part.installed === filters.installed)
  }

  return applySearchFilter(filtered, filters.search)
}

function paginateParts(parts: Part[], page = 1, pageSize = 10): PartPageResult {
  const safePageSize = Math.max(1, Math.floor(pageSize))
  const safePage = Math.max(1, Math.floor(page))
  const total = parts.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / safePageSize)
  const startIndex = (safePage - 1) * safePageSize
  const items = parts.slice(startIndex, startIndex + safePageSize)

  return {
    items,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1 && totalPages > 0,
    },
  }
}

async function resolveSupplierName(supplierId: string) {
  const snapshot = await getDoc(doc(db, SUPPLIER_COLLECTION_NAME, supplierId))

  if (!snapshot.exists()) {
    throw new PartValidationError(['Selected supplier was not found.'])
  }

  const supplier = snapshot.data() as { name?: string }
  return supplier.name?.trim() || supplierId
}

async function resolveRelatedCarName(carId?: string | null) {
  const normalizedCarId = normalizeNullableString(carId)
  if (!normalizedCarId) {
    return null
  }

  const snapshot = await getDoc(doc(db, CAR_COLLECTION_NAME, normalizedCarId))

  if (!snapshot.exists()) {
    throw new PartValidationError(['Selected car was not found.'])
  }

  const car = snapshot.data() as {
    brand?: string
    model?: string
    year?: number
  }

  const brand = car.brand?.trim() || ''
  const model = car.model?.trim() || ''
  const year = car.year ? String(car.year) : ''
  return [brand, model, year].filter(Boolean).join(' ').trim()
}

async function prepareCreateData(data: CreatePartData) {
  const parsed = partInputSchema.safeParse(data)
  if (!parsed.success) {
    throw createValidationError(parsed.error)
  }

  const [supplierName, relatedCarName] = await Promise.all([
    resolveSupplierName(parsed.data.supplierId),
    resolveRelatedCarName(parsed.data.relatedCarId),
  ])

  return {
    data: parsed.data,
    supplierName,
    relatedCarName,
  }
}

async function prepareUpdateData(data: UpdatePartData) {
  const parsed = partUpdateSchema.safeParse(data)
  if (!parsed.success) {
    throw createValidationError(parsed.error)
  }

  const supplierName =
    parsed.data.supplierId !== undefined
      ? await resolveSupplierName(parsed.data.supplierId)
      : undefined
  const relatedCarName =
    parsed.data.relatedCarId !== undefined
      ? await resolveRelatedCarName(parsed.data.relatedCarId)
      : undefined

  return {
    data: parsed.data,
    supplierName,
    relatedCarName,
  }
}

function rethrowPartError(error: unknown): never {
  if (
    error instanceof PartValidationError ||
    error instanceof PartDeleteBlockedError ||
    error instanceof PartNotFoundError
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

export async function getParts(filters: PartFilters = {}): Promise<Part[]> {
  try {
    const constraints: QueryConstraint[] = []

    if (filters.supplierId) {
      constraints.unshift(where('supplier_id', '==', filters.supplierId))
    }

    if (filters.carId) {
      if (filters.carId === 'standalone') {
        constraints.unshift(where('related_car_id', '==', null))
      } else {
        constraints.unshift(where('related_car_id', '==', filters.carId))
      }
    }

    if (typeof filters.installed === 'boolean') {
      constraints.unshift(where('installed', '==', filters.installed))
    }

    const snapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), ...constraints)
    )
    const parts = snapshot.docs.map(mapPartSnapshot)
    return sortPartsByPurchaseDateDesc(applyFilters(parts, filters))
  } catch (error) {
    return rethrowPartError(error)
  }
}

export async function getPartsPage(
  filters: PartFilters = {}
): Promise<PartPageResult> {
  const parts = await getParts(filters)
  return paginateParts(parts, filters.page, filters.pageSize)
}

export async function getPartById(id: string): Promise<Part | null> {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))
    return snapshot.exists() ? mapPartSnapshot(snapshot) : null
  } catch (error) {
    return rethrowPartError(error)
  }
}

export async function createPart(data: CreatePartData): Promise<Part> {
  try {
    const prepared = await prepareCreateData(data)
    const docRef = await addDoc(
      collection(db, COLLECTION_NAME),
      toCreateDocumentData(
        prepared.data,
        prepared.supplierName,
        prepared.relatedCarName
      )
    )

    await updateDoc(docRef, { id: docRef.id })

    const created = await getPartById(docRef.id)
    if (!created) {
      throw new Error('Failed to save part.')
    }

    return created
  } catch (error) {
    return rethrowPartError(error)
  }
}

export async function updatePart(
  id: string,
  data: UpdatePartData
): Promise<void> {
  try {
    await getExistingPartSnapshot(id)
    const prepared = await prepareUpdateData(data)

    await updateDoc(
      doc(db, COLLECTION_NAME, id),
      toUpdateDocumentData(
        prepared.data,
        prepared.supplierName,
        prepared.relatedCarName
      )
    )
  } catch (error) {
    rethrowPartError(error)
  }
}

export async function canDeletePart(id: string): Promise<PartDeleteCheck> {
  const references = await getPartReferences(id)

  return {
    canDelete: Object.values(references).every((count) => count === 0),
    references,
  }
}

export async function deletePart(id: string): Promise<void> {
  try {
    await getExistingPartSnapshot(id)
    const deleteCheck = await canDeletePart(id)

    if (!deleteCheck.canDelete) {
      throw new PartDeleteBlockedError(deleteCheck.references)
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id))
  } catch (error) {
    rethrowPartError(error)
  }
}

export async function searchParts(searchTerm: string): Promise<Part[]> {
  return getParts({ search: searchTerm })
}

export async function getPartsByCarId(carId: string): Promise<Part[]> {
  return getParts({ carId })
}

export async function getPartsBySupplierId(supplierId: string): Promise<Part[]> {
  return getParts({ supplierId })
}

export async function getInstalledParts(): Promise<Part[]> {
  return getParts({ installed: true })
}

export async function getPendingParts(): Promise<Part[]> {
  return getParts({ installed: false })
}

export async function getPartsSummary(filters: PartFilters = {}) {
  const parts = await getParts(filters)

  return {
    totalParts: parts.length,
    installedParts: parts.filter((part) => part.installed).length,
    pendingParts: parts.filter((part) => !part.installed).length,
    totalCost: parts.reduce((sum, part) => sum + part.price, 0),
  }
}

export { createPart as create, deletePart as delete, getParts as getAll, getPartById as getById, updatePart as update }
