import { FirebaseError } from 'firebase/app'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
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
import type { InspectionStatus } from '@/data/dealerOperationsMockData'
import { createRebuiltTitleFromPassedInspection } from './titleHistoryService'

const COLLECTION_NAME = 'inspections'
const CAR_COLLECTION_NAME = 'cars'
const COMPANY_COLLECTION_NAME = 'companies'
const DELETE_BLOCKED_MESSAGE =
  'This inspection cannot be deleted because it is currently in use.'
const DELETE_NOT_FOUND_MESSAGE = 'Inspection was not found.'

const inspectionStatusValues = ['Pending', 'Passed', 'Failed'] as const
const allowedPlaceTypes = ['Inspection Center', 'Repair Shop'] as const

type FirestoreDate = Timestamp | Date | string | null
type ListInput = string | string[] | null | undefined

export interface InspectionDocument {
  id: string
  car_id: string
  car_name?: string | null
  place_id: string
  place?: string | null
  date: string
  time: string
  status: InspectionStatus
  notes?: string | null
  files?: string[] | null
  receipts?: string[] | null
  before_images?: string[] | null
  after_images?: string[] | null
  reminder_sent: boolean
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export interface Inspection extends InspectionDocument {
  carId: string
  carName: string
  placeId: string
  placeName: string
  notes: string
  files: string[]
  receipts: string[]
  beforeImages: string[]
  afterImages: string[]
  reminderSent: boolean
  createdAt?: FirestoreDate
  updatedAt?: FirestoreDate
}

export interface InspectionReferences {
  activityLogs: number
  notifications: number
}

export interface InspectionDeleteCheck {
  canDelete: boolean
  exists: boolean
  references: InspectionReferences
}

export interface InspectionPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface InspectionPageResult {
  items: Inspection[]
  pagination: InspectionPagination
}

export interface InspectionFilters {
  search?: string
  carId?: string
  placeId?: string
  status?: InspectionStatus
  reminderSent?: boolean
  page?: number
  pageSize?: number
}

export type CreateInspectionData = {
  carId: string
  placeId: string
  date: string
  time: string
  status: InspectionStatus
  notes?: string | null
  files?: ListInput
  receipts?: ListInput
  beforeImages?: ListInput
  afterImages?: ListInput
  reminderSent?: boolean | 'yes' | 'no'
}

export type UpdateInspectionData = Partial<CreateInspectionData>

type InspectionWriteDocumentData = {
  car_id: string
  car_name?: string | null
  place_id: string
  place?: string | null
  date: string
  time: string
  status: InspectionStatus
  notes: string | null
  files: string[]
  receipts: string[]
  before_images: string[]
  after_images: string[]
  reminder_sent: boolean
}

type InspectionCreateDocumentData = InspectionWriteDocumentData & {
  created_at: FieldValue
  updated_at: FieldValue
}

type InspectionUpdateDocumentData = Partial<InspectionWriteDocumentData> & {
  updated_at: FieldValue
}

const listSchema = z.union([z.string(), z.array(z.string())]).optional().nullable()

const inspectionInputSchema = z.object({
  carId: z.string().trim().min(1, 'Please select a car.'),
  placeId: z.string().trim().min(1, 'Please select a place.'),
  date: z
    .string()
    .trim()
    .min(1, 'Please select a date.')
    .refine((value) => isValidDate(value), {
      message: 'Please select a valid date.',
    }),
  time: z
    .string()
    .trim()
    .min(1, 'Please select a time.')
    .refine((value) => isValidTime(value), {
      message: 'Please select a valid time.',
    }),
  status: z.enum(inspectionStatusValues),
  notes: z.string().trim().optional().nullable(),
  files: listSchema,
  receipts: listSchema,
  beforeImages: listSchema,
  afterImages: listSchema,
  reminderSent: z.union([z.boolean(), z.enum(['yes', 'no'])]).optional(),
})

const inspectionUpdateSchema = inspectionInputSchema.partial().superRefine(
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

    if (
      data.time !== undefined &&
      typeof data.time === 'string' &&
      !isValidTime(data.time)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a valid time.',
        path: ['time'],
      })
    }
  }
)

export class InspectionValidationError extends Error {
  issues: string[]

  constructor(issues: string[]) {
    super(issues[0] ?? 'Inspection data is invalid.')
    this.name = 'InspectionValidationError'
    this.issues = issues
  }
}

export class InspectionDeleteBlockedError extends Error {
  references: InspectionReferences

  constructor(references: InspectionReferences) {
    super(DELETE_BLOCKED_MESSAGE)
    this.name = 'InspectionDeleteBlockedError'
    this.references = references
  }
}

export class InspectionNotFoundError extends Error {
  constructor() {
    super(DELETE_NOT_FOUND_MESSAGE)
    this.name = 'InspectionNotFoundError'
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

function normalizeList(value: ListInput) {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return []
  }

  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean)
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeReminderSent(value?: boolean | 'yes' | 'no' | null) {
  if (value === undefined) {
    return undefined
  }

  if (typeof value === 'boolean') {
    return value
  }

  return value === 'yes'
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime())
}

function isValidTime(value: string) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)
}

function sortByDateTimeDesc(inspections: Inspection[]) {
  return [...inspections].sort((first, second) => {
    const dateCompare = second.date.localeCompare(first.date)
    if (dateCompare !== 0) {
      return dateCompare
    }

    return second.time.localeCompare(first.time)
  })
}

function mapInspectionSnapshot(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): Inspection {
  const data = {
    id: snapshot.id,
    ...(snapshot.data() as Omit<InspectionDocument, 'id'>),
  } as InspectionDocument

  return {
    ...data,
    carId: data.car_id,
    carName: normalizeOptionalText(data.car_name) || data.car_id,
    placeId: data.place_id,
    placeName: normalizeOptionalText(data.place) || data.place_id,
    notes: normalizeOptionalText(data.notes),
    files: data.files ?? [],
    receipts: data.receipts ?? [],
    beforeImages: data.before_images ?? [],
    afterImages: data.after_images ?? [],
    reminderSent: data.reminder_sent ?? false,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function createValidationError(error: z.ZodError) {
  return new InspectionValidationError(
    error.issues.map((issue) => issue.message).filter(Boolean)
  )
}

async function resolveCarName(carId: string) {
  const snapshot = await getDoc(doc(db, CAR_COLLECTION_NAME, carId))

  if (!snapshot.exists()) {
    throw new InspectionValidationError(['Selected car was not found.'])
  }

  const car = snapshot.data() as {
    brand?: string
    model?: string
    year?: number
  }

  const brand = car.brand?.trim() || ''
  const model = car.model?.trim() || ''
  const year = car.year ? String(car.year) : ''

  return [brand, model, year].filter(Boolean).join(' ').trim() || carId
}

async function resolvePlaceName(placeId: string) {
  const snapshot = await getDoc(doc(db, COMPANY_COLLECTION_NAME, placeId))

  if (!snapshot.exists()) {
    throw new InspectionValidationError(['Selected place was not found.'])
  }

  const company = snapshot.data() as {
    name?: string
    type?: string
  }

  if (
    company.type &&
    !allowedPlaceTypes.includes(company.type as (typeof allowedPlaceTypes)[number])
  ) {
    throw new InspectionValidationError([
      'Selected place must be an inspection center or repair shop.',
    ])
  }

  return company.name?.trim() || placeId
}

async function prepareCreateData(data: CreateInspectionData) {
  const parsed = inspectionInputSchema.safeParse(data)

  if (!parsed.success) {
    throw createValidationError(parsed.error)
  }

  const [carName, placeName] = await Promise.all([
    resolveCarName(parsed.data.carId),
    resolvePlaceName(parsed.data.placeId),
  ])

  return {
    data: parsed.data,
    carName,
    placeName,
  }
}

async function prepareUpdateData(data: UpdateInspectionData) {
  const parsed = inspectionUpdateSchema.safeParse(data)

  if (!parsed.success) {
    throw createValidationError(parsed.error)
  }

  const carName =
    parsed.data.carId !== undefined
      ? await resolveCarName(parsed.data.carId)
      : undefined
  const placeName =
    parsed.data.placeId !== undefined
      ? await resolvePlaceName(parsed.data.placeId)
      : undefined

  return {
    data: parsed.data,
    carName,
    placeName,
  }
}

function toCreateDocumentData(
  data: CreateInspectionData,
  carName: string,
  placeName: string
): InspectionCreateDocumentData {
  return {
    car_id: data.carId.trim(),
    car_name: carName,
    place_id: data.placeId.trim(),
    place: placeName,
    date: data.date,
    time: data.time,
    status: data.status,
    notes: normalizeNullableText(data.notes),
    files: normalizeList(data.files) ?? [],
    receipts: normalizeList(data.receipts) ?? [],
    before_images: normalizeList(data.beforeImages) ?? [],
    after_images: normalizeList(data.afterImages) ?? [],
    reminder_sent: normalizeReminderSent(data.reminderSent) ?? false,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }
}

function toUpdateDocumentData(
  data: UpdateInspectionData,
  carName?: string,
  placeName?: string
): InspectionUpdateDocumentData {
  const documentData: InspectionUpdateDocumentData = {
    updated_at: serverTimestamp(),
  }

  if (data.carId !== undefined) {
    documentData.car_id = data.carId.trim()
    if (carName !== undefined) {
      documentData.car_name = carName
    }
  }

  if (data.placeId !== undefined) {
    documentData.place_id = data.placeId.trim()
    if (placeName !== undefined) {
      documentData.place = placeName
    }
  }

  if (data.date !== undefined) {
    documentData.date = data.date
  }

  if (data.time !== undefined) {
    documentData.time = data.time
  }

  if (data.status !== undefined) {
    documentData.status = data.status
  }

  if (data.notes !== undefined) {
    documentData.notes = normalizeNullableText(data.notes)
  }

  if (data.files !== undefined) {
    documentData.files = normalizeList(data.files) ?? []
  }

  if (data.receipts !== undefined) {
    documentData.receipts = normalizeList(data.receipts) ?? []
  }

  if (data.beforeImages !== undefined) {
    documentData.before_images = normalizeList(data.beforeImages) ?? []
  }

  if (data.afterImages !== undefined) {
    documentData.after_images = normalizeList(data.afterImages) ?? []
  }

  if (data.reminderSent !== undefined) {
    documentData.reminder_sent =
      normalizeReminderSent(data.reminderSent) ?? false
  }

  return documentData
}

async function getInspectionSnapshot(id: string) {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))

  if (!snapshot.exists()) {
    throw new InspectionNotFoundError()
  }

  return snapshot
}

async function getReferenceCount(
  collectionName: string,
  constraints: QueryConstraint[]
) {
  const snapshot = await getCountFromServer(
    query(collection(db, collectionName), ...constraints)
  )

  return snapshot.data().count
}

async function getInspectionReferences(id: string): Promise<InspectionReferences> {
  const [activityLogs, notifications] = await Promise.all([
    getReferenceCount('activity_logs', [
      where('entity_type', '==', 'inspection'),
      where('entity_id', '==', id),
    ]),
    getReferenceCount('notifications', [where('related_inspection_id', '==', id)]),
  ])

  return {
    activityLogs,
    notifications,
  }
}

function applySearchFilter(inspections: Inspection[], searchTerm?: string) {
  const search = searchTerm?.trim().toLowerCase()

  if (!search) {
    return inspections
  }

  return inspections.filter((inspection) =>
    [
      inspection.carName,
      inspection.placeName,
      inspection.status,
      inspection.date,
      inspection.time,
      inspection.notes,
      inspection.files.join(' '),
      inspection.receipts.join(' '),
      inspection.beforeImages.join(' '),
      inspection.afterImages.join(' '),
    ]
      .join(' ')
      .toLowerCase()
      .includes(search)
  )
}

function applyFilters(inspections: Inspection[], filters: InspectionFilters) {
  let filtered = inspections

  if (filters.carId) {
    filtered = filtered.filter((inspection) => inspection.carId === filters.carId)
  }

  if (filters.placeId) {
    filtered = filtered.filter(
      (inspection) => inspection.placeId === filters.placeId
    )
  }

  if (filters.status) {
    filtered = filtered.filter((inspection) => inspection.status === filters.status)
  }

  if (typeof filters.reminderSent === 'boolean') {
    filtered = filtered.filter(
      (inspection) => inspection.reminderSent === filters.reminderSent
    )
  }

  return applySearchFilter(filtered, filters.search)
}

function paginateInspections(
  inspections: Inspection[],
  page = 1,
  pageSize = 10
): InspectionPageResult {
  const safePageSize = Math.max(1, Math.floor(pageSize))
  const safePage = Math.max(1, Math.floor(page))
  const total = inspections.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / safePageSize)
  const startIndex = (safePage - 1) * safePageSize
  const items = inspections.slice(startIndex, startIndex + safePageSize)

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

function rethrowInspectionError(error: unknown): never {
  if (
    error instanceof InspectionValidationError ||
    error instanceof InspectionDeleteBlockedError ||
    error instanceof InspectionNotFoundError
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

export async function getInspections(
  filters: InspectionFilters = {}
): Promise<Inspection[]> {
  try {
    const constraints: QueryConstraint[] = []

    if (filters.carId) {
      constraints.push(where('car_id', '==', filters.carId))
    } else {
      if (filters.placeId) {
        constraints.push(where('place_id', '==', filters.placeId))
      }

      if (filters.status) {
        constraints.push(where('status', '==', filters.status))
      }

      if (typeof filters.reminderSent === 'boolean') {
        constraints.push(where('reminder_sent', '==', filters.reminderSent))
      }

      constraints.push(orderBy('date', 'desc'))
    }

    const snapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), ...constraints)
    )
    const inspections = snapshot.docs.map(mapInspectionSnapshot)
    return sortByDateTimeDesc(applyFilters(inspections, filters))
  } catch (error) {
    return rethrowInspectionError(error)
  }
}

export async function getInspectionsPage(
  filters: InspectionFilters = {}
): Promise<InspectionPageResult> {
  const inspections = await getInspections(filters)
  return paginateInspections(inspections, filters.page, filters.pageSize)
}

export async function getInspectionById(id: string): Promise<Inspection | null> {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))
    return snapshot.exists() ? mapInspectionSnapshot(snapshot) : null
  } catch (error) {
    return rethrowInspectionError(error)
  }
}

export async function createInspection(
  data: CreateInspectionData
): Promise<Inspection> {
  try {
    const prepared = await prepareCreateData(data)
    const docRef = await addDoc(
      collection(db, COLLECTION_NAME),
      toCreateDocumentData(prepared.data, prepared.carName, prepared.placeName)
    )

    await updateDoc(docRef, { id: docRef.id })

    const created = await getInspectionById(docRef.id)

    if (!created) {
      throw new Error('Failed to save inspection.')
    }

    if (created.status === 'Passed') {
      await createRebuiltTitleFromPassedInspection(created.carId)
    }

    return created
  } catch (error) {
    return rethrowInspectionError(error)
  }
}

export async function updateInspection(
  id: string,
  data: UpdateInspectionData
): Promise<void> {
  try {
    await getInspectionSnapshot(id)
    const prepared = await prepareUpdateData(data)

    await updateDoc(
      doc(db, COLLECTION_NAME, id),
      toUpdateDocumentData(prepared.data, prepared.carName, prepared.placeName)
    )

    const updatedInspection = await getInspectionById(id)

    if (updatedInspection?.status === 'Passed') {
      await createRebuiltTitleFromPassedInspection(updatedInspection.carId)
    }
  } catch (error) {
    rethrowInspectionError(error)
  }
}

export async function canDeleteInspection(
  id: string
): Promise<InspectionDeleteCheck> {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))

  if (!snapshot.exists()) {
    return {
      canDelete: false,
      exists: false,
      references: {
        activityLogs: 0,
        notifications: 0,
      },
    }
  }

  const references = await getInspectionReferences(id)

  return {
    canDelete: Object.values(references).every((count) => count === 0),
    exists: true,
    references,
  }
}

export async function deleteInspection(id: string): Promise<void> {
  try {
    const deleteCheck = await canDeleteInspection(id)

    if (!deleteCheck.exists) {
      throw new InspectionNotFoundError()
    }

    if (!deleteCheck.canDelete) {
      throw new InspectionDeleteBlockedError(deleteCheck.references)
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id))
  } catch (error) {
    rethrowInspectionError(error)
  }
}

export async function getInspectionsByCarId(
  carId: string
): Promise<Inspection[]> {
  return getInspections({ carId })
}

export async function getPendingInspections(): Promise<Inspection[]> {
  return getInspections({ status: 'Pending' })
}

export async function searchInspections(
  searchTerm: string
): Promise<Inspection[]> {
  return getInspections({ search: searchTerm })
}

export async function getInspectionSummary(filters: InspectionFilters = {}) {
  const inspections = await getInspections(filters)

  return {
    totalInspections: inspections.length,
    pendingInspections: inspections.filter((inspection) => inspection.status === 'Pending').length,
    passedInspections: inspections.filter((inspection) => inspection.status === 'Passed').length,
    failedInspections: inspections.filter((inspection) => inspection.status === 'Failed').length,
    reminderSentInspections: inspections.filter((inspection) => inspection.reminderSent).length,
  }
}

export { createInspection as create }
export { deleteInspection as delete }
export { getInspectionById as getById }
export { getInspections as getAll }
export { updateInspection as update }
