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
import {
  getNormalizedCarTitleTypeForStatus,
  type CarStatus,
} from './carsService'
import type { TitleType } from '@/features/cars/types/title'
import type { InspectionStatus } from '@/types/dealer'

const COLLECTION_NAME = 'car_title_history'
const CAR_COLLECTION_NAME = 'cars'
const INSPECTION_COLLECTION_NAME = 'inspections'
const DELETE_NOT_FOUND_MESSAGE = 'Title record was not found.'
const DELETE_BLOCKED_MESSAGE =
  'This title record cannot be deleted because it is currently in use.'

const titleTypeValues = ['Clean', 'Salvage', 'Rebuilt'] as const

type FirestoreDate = Timestamp | Date | string | null

export interface CarTitleHistoryDocument {
  id: string
  car_id: string
  previous_title_type: TitleType
  new_title_type: TitleType
  change_date: string
  updated_by: string
  notes?: string | null
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export interface CarTitleHistory {
  id: string
  carId: string
  previousTitleType: TitleType
  newTitleType: TitleType
  changeDate: string
  updatedBy: string
  notes: string
  createdAt?: FirestoreDate
  updatedAt?: FirestoreDate
}

export interface CarTitleHistoryReferences {
  activityLogs: number
  notifications: number
}

export interface CarTitleHistoryDeleteCheck {
  canDelete: boolean
  exists: boolean
  references: CarTitleHistoryReferences
}

export interface CarTitleHistoryPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface CarTitleHistoryPageResult {
  items: CarTitleHistory[]
  pagination: CarTitleHistoryPagination
}

export interface CarTitleHistoryFilters {
  search?: string
  carId?: string
  titleType?: TitleType
  page?: number
  pageSize?: number
}

export type CreateCarTitleHistoryData = {
  carId: string
  previousTitleType: TitleType
  newTitleType: TitleType
  changeDate: string
  updatedBy: string
  notes?: string | null
}

export type UpdateCarTitleHistoryData = Partial<CreateCarTitleHistoryData>

type CarTitleHistoryWriteDocumentData = {
  car_id: string
  previous_title_type: TitleType
  new_title_type: TitleType
  change_date: string
  updated_by: string
  notes: string | null
}

type CarTitleHistoryCreateDocumentData = CarTitleHistoryWriteDocumentData & {
  created_at: FieldValue
  updated_at: FieldValue
}

type CarTitleHistoryUpdateDocumentData = Partial<CarTitleHistoryWriteDocumentData> & {
  updated_at: FieldValue
}

const titleHistoryInputSchema = z.object({
  carId: z.string().trim().min(1, 'Please select a car.'),
  previousTitleType: z.enum(titleTypeValues),
  newTitleType: z.enum(titleTypeValues),
  changeDate: z
    .string()
    .trim()
    .min(1, 'Please select a change date.')
    .refine((value) => isValidDate(value), {
      message: 'Please select a valid change date.',
    }),
  updatedBy: z.string().trim().min(2, 'Please enter who made this change.'),
  notes: z.string().trim().optional().nullable(),
})

const titleHistoryUpdateSchema = titleHistoryInputSchema.partial().superRefine(
  (data, ctx) => {
    if (
      data.changeDate !== undefined &&
      typeof data.changeDate === 'string' &&
      !isValidDate(data.changeDate)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a valid change date.',
        path: ['changeDate'],
      })
    }
  }
)

export class CarTitleHistoryValidationError extends Error {
  issues: string[]

  constructor(issues: string[]) {
    super(issues[0] ?? 'Title record data is invalid.')
    this.name = 'CarTitleHistoryValidationError'
    this.issues = issues
  }
}

export class CarTitleHistoryDeleteBlockedError extends Error {
  references: CarTitleHistoryReferences

  constructor(references: CarTitleHistoryReferences) {
    super(DELETE_BLOCKED_MESSAGE)
    this.name = 'CarTitleHistoryDeleteBlockedError'
    this.references = references
  }
}

export class CarTitleHistoryNotFoundError extends Error {
  constructor() {
    super(DELETE_NOT_FOUND_MESSAGE)
    this.name = 'CarTitleHistoryNotFoundError'
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

function toMillis(value?: FirestoreDate) {
  if (!value) {
    return 0
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  if (typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') {
    return value.toMillis()
  }

  return 0
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime())
}

function mapCarTitleHistorySnapshot(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): CarTitleHistory {
  const data = {
    id: snapshot.id,
    ...(snapshot.data() as Omit<CarTitleHistoryDocument, 'id'>),
  } as CarTitleHistoryDocument

  return {
    id: data.id,
    carId: data.car_id,
    previousTitleType: data.previous_title_type,
    newTitleType: data.new_title_type,
    changeDate: data.change_date,
    updatedBy: data.updated_by,
    notes: normalizeOptionalText(data.notes),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function createValidationError(error: z.ZodError) {
  return new CarTitleHistoryValidationError(
    error.issues.map((issue) => issue.message).filter(Boolean)
  )
}

async function resolveCarSnapshot(carId: string) {
  const snapshot = await getDoc(doc(db, CAR_COLLECTION_NAME, carId))

  if (!snapshot.exists()) {
    throw new CarTitleHistoryValidationError(['Selected car was not found.'])
  }

  return snapshot
}

type InspectionSnapshotFields = {
  status?: InspectionStatus
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
  date?: string
  time?: string
}

function getInspectionSortKey(value?: InspectionSnapshotFields) {
  if (!value) {
    return 0
  }

  const createdAt = toMillis(value.created_at)
  if (createdAt > 0) {
    return createdAt
  }

  const updatedAt = toMillis(value.updated_at)
  if (updatedAt > 0) {
    return updatedAt
  }

  if (value.date) {
    const dateTime = Date.parse(`${value.date}T${value.time ?? '00:00'}:00.000Z`)
    if (!Number.isNaN(dateTime)) {
      return dateTime
    }
  }

  return 0
}

async function getLatestInspectionForCar(carId: string) {
  const snapshot = await getDocs(
    query(collection(db, INSPECTION_COLLECTION_NAME), where('car_id', '==', carId))
  )

  return snapshot.docs
    .map((docSnapshot) => docSnapshot.data() as InspectionSnapshotFields)
    .sort((first, second) => getInspectionSortKey(second) - getInspectionSortKey(first))[0]
}

function getInspectionDateThreshold(inspection?: InspectionSnapshotFields | null) {
  return getInspectionSortKey(inspection ?? undefined)
}

async function hasLatestPassedInspectionAfter(
  carId: string,
  threshold: number
) {
  const latestInspection = await getLatestInspectionForCar(carId)
  return (
    latestInspection?.status === 'Passed' &&
    getInspectionDateThreshold(latestInspection) > threshold
  )
}

async function getLatestSalvageTitleHistoryForCar(carId: string) {
  const history = await getTitleHistoryByCarId(carId)
  return history.find((record) => record.newTitleType === 'Salvage') ?? null
}

function getTitleHistorySortKey(record?: CarTitleHistory | null) {
  if (!record) {
    return 0
  }

  const createdAt = toMillis(record.createdAt)
  if (createdAt > 0) {
    return createdAt
  }

  const updatedAt = toMillis(record.updatedAt)
  if (updatedAt > 0) {
    return updatedAt
  }

  const parsedChangeDate = Date.parse(`${record.changeDate}T00:00:00.000Z`)
  return Number.isNaN(parsedChangeDate) ? 0 : parsedChangeDate
}

async function ensureRebuiltTransitionAllowed(
  carId: string,
  newTitleType: TitleType
) {
  if (newTitleType !== 'Rebuilt') {
    return
  }

  const latestSalvage = await getLatestSalvageTitleHistoryForCar(carId)
  const passed = await hasLatestPassedInspectionAfter(
    carId,
    getTitleHistorySortKey(latestSalvage)
  )

  if (!passed) {
    throw new CarTitleHistoryValidationError([
      'A passed inspection after the latest Salvage title is required before converting the title to Rebuilt.',
    ])
  }
}

async function resolveCurrentCarTitleType(carId: string) {
  const carSnapshot = await resolveCarSnapshot(carId)
  const car = carSnapshot.data() as {
    status?: CarStatus
    current_title_type?: TitleType
    title_type?: TitleType
    title_last_updated_at?: string
    title_updated_by?: string
  }

  return {
    status: car.status ?? 'purchased',
    currentTitleType: car.current_title_type ?? car.title_type ?? 'Clean',
    titleType: car.title_type ?? 'Clean',
    titleLastUpdatedAt: car.title_last_updated_at ?? '',
    titleUpdatedBy: car.title_updated_by ?? '',
  }
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

async function getTitleHistoryReferences(
  id: string
): Promise<CarTitleHistoryReferences> {
  const [activityLogs, notifications] = await Promise.all([
    getReferenceCount('activity_logs', [
      where('entity_type', '==', 'title_history'),
      where('entity_id', '==', id),
    ]),
    getReferenceCount('notifications', [where('related_title_history_id', '==', id)]),
  ])

  return {
    activityLogs,
    notifications,
  }
}

function applySearchFilter(
  records: CarTitleHistory[],
  searchTerm?: string
) {
  const search = searchTerm?.trim().toLowerCase()

  if (!search) {
    return records
  }

  return records.filter((record) =>
    [
      record.carId,
      record.previousTitleType,
      record.newTitleType,
      record.changeDate,
      record.updatedBy,
      record.notes,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search)
  )
}

function sortTitleHistoryByChangeDateDesc(records: CarTitleHistory[]) {
  return [...records].sort((first, second) => {
    const createdAtCompare = toMillis(second.createdAt) - toMillis(first.createdAt)
    if (createdAtCompare !== 0) {
      return createdAtCompare
    }

    const updatedAtCompare = toMillis(second.updatedAt) - toMillis(first.updatedAt)
    if (updatedAtCompare !== 0) {
      return updatedAtCompare
    }

    return second.changeDate.localeCompare(first.changeDate)
  })
}

function applyFilters(
  records: CarTitleHistory[],
  filters: CarTitleHistoryFilters = {}
) {
  let filtered = records

  if (filters.carId) {
    filtered = filtered.filter((record) => record.carId === filters.carId)
  }

  if (filters.titleType) {
    filtered = filtered.filter(
      (record) =>
        record.previousTitleType === filters.titleType ||
        record.newTitleType === filters.titleType
    )
  }

  return applySearchFilter(filtered, filters.search)
}

function paginateTitleHistory(
  records: CarTitleHistory[],
  page = 1,
  pageSize = 10
): CarTitleHistoryPageResult {
  const safePageSize = Math.max(1, Math.floor(pageSize))
  const safePage = Math.max(1, Math.floor(page))
  const total = records.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / safePageSize)
  const startIndex = (safePage - 1) * safePageSize
  const items = records.slice(startIndex, startIndex + safePageSize)

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

async function fetchTitleHistoryForCar(carId: string) {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), where('car_id', '==', carId))
  )

  return sortTitleHistoryByChangeDateDesc(
    snapshot.docs.map(mapCarTitleHistorySnapshot)
  )
}

async function syncCarTitleState(carId: string) {
  const carSnapshot = await resolveCarSnapshot(carId)
  const car = carSnapshot.data() as {
    status?: CarStatus
    title_type?: TitleType
    current_title_type?: TitleType
    purchase_date?: string
  }
  const history = await fetchTitleHistoryForCar(carId)
  const latest = history[0]

  if (!latest) {
    const normalizedTitleType = getNormalizedCarTitleTypeForStatus(
      car.status ?? 'purchased',
      car.current_title_type ?? car.title_type ?? 'Clean'
    )
    await updateDoc(doc(db, CAR_COLLECTION_NAME, carId), {
      current_title_type: normalizedTitleType,
      title_type: normalizedTitleType,
      title_last_updated_at: car.purchase_date ?? '',
      title_updated_by: 'System',
      updated_at: serverTimestamp(),
    })
    return
  }

  await updateDoc(doc(db, CAR_COLLECTION_NAME, carId), {
    current_title_type: latest.newTitleType,
    title_type: latest.newTitleType,
    title_last_updated_at: latest.changeDate,
    title_updated_by: latest.updatedBy,
    updated_at: serverTimestamp(),
  })
}

function rethrowTitleHistoryError(error: unknown): never {
  if (
    error instanceof CarTitleHistoryValidationError ||
    error instanceof CarTitleHistoryDeleteBlockedError ||
    error instanceof CarTitleHistoryNotFoundError
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

async function prepareCreateData(data: CreateCarTitleHistoryData) {
  const parsed = titleHistoryInputSchema.safeParse(data)

  if (!parsed.success) {
    throw createValidationError(parsed.error)
  }

  const current = await resolveCurrentCarTitleType(parsed.data.carId)

  if (parsed.data.previousTitleType !== current.currentTitleType) {
    throw new CarTitleHistoryValidationError([
      'The previous title type must match the car current title.',
    ])
  }

  if (
    parsed.data.newTitleType === 'Rebuilt' &&
    parsed.data.previousTitleType !== 'Salvage'
  ) {
    throw new CarTitleHistoryValidationError([
      'A Rebuilt title can only be created from a Salvage title.',
    ])
  }

  await ensureRebuiltTransitionAllowed(parsed.data.carId, parsed.data.newTitleType)

  return parsed.data
}

async function prepareUpdateData(data: UpdateCarTitleHistoryData) {
  const parsed = titleHistoryUpdateSchema.safeParse(data)

  if (!parsed.success) {
    throw createValidationError(parsed.error)
  }

  if (parsed.data.carId !== undefined) {
    const existing = await resolveCarSnapshot(parsed.data.carId)
    void existing
  }

  return parsed.data
}

function toCreateDocumentData(
  data: CreateCarTitleHistoryData
): CarTitleHistoryCreateDocumentData {
  return {
    car_id: data.carId.trim(),
    previous_title_type: data.previousTitleType,
    new_title_type: data.newTitleType,
    change_date: data.changeDate,
    updated_by: data.updatedBy.trim(),
    notes: normalizeNullableText(data.notes),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }
}

function toUpdateDocumentData(
  data: UpdateCarTitleHistoryData
): CarTitleHistoryUpdateDocumentData {
  const documentData: CarTitleHistoryUpdateDocumentData = {
    updated_at: serverTimestamp(),
  }

  if (data.carId !== undefined) {
    documentData.car_id = data.carId.trim()
  }

  if (data.previousTitleType !== undefined) {
    documentData.previous_title_type = data.previousTitleType
  }

  if (data.newTitleType !== undefined) {
    documentData.new_title_type = data.newTitleType
  }

  if (data.changeDate !== undefined) {
    documentData.change_date = data.changeDate
  }

  if (data.updatedBy !== undefined) {
    documentData.updated_by = data.updatedBy.trim()
  }

  if (data.notes !== undefined) {
    documentData.notes = normalizeNullableText(data.notes)
  }

  return documentData
}

export async function getTitleHistory(
  filters: CarTitleHistoryFilters = {}
): Promise<CarTitleHistory[]> {
  try {
    const constraints: QueryConstraint[] = []

    if (filters.carId) {
      constraints.unshift(where('car_id', '==', filters.carId))
    }

    if (filters.titleType && !filters.carId) {
      constraints.unshift(where('new_title_type', '==', filters.titleType))
    }

    const snapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), ...constraints)
    )
    const records = snapshot.docs.map(mapCarTitleHistorySnapshot)
    return sortTitleHistoryByChangeDateDesc(applyFilters(records, filters))
  } catch (error) {
    return rethrowTitleHistoryError(error)
  }
}

export async function getTitleHistoryPage(
  filters: CarTitleHistoryFilters = {}
): Promise<CarTitleHistoryPageResult> {
  const records = await getTitleHistory(filters)
  return paginateTitleHistory(records, filters.page, filters.pageSize)
}

export async function getTitleHistoryById(
  id: string
): Promise<CarTitleHistory | null> {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))
    return snapshot.exists() ? mapCarTitleHistorySnapshot(snapshot) : null
  } catch (error) {
    return rethrowTitleHistoryError(error)
  }
}

export async function createTitleHistory(
  data: CreateCarTitleHistoryData
): Promise<CarTitleHistory> {
  try {
    const prepared = await prepareCreateData(data)
    const docRef = await addDoc(
      collection(db, COLLECTION_NAME),
      toCreateDocumentData(prepared)
    )

    await updateDoc(docRef, { id: docRef.id })
    await syncCarTitleState(prepared.carId)

    const created = await getTitleHistoryById(docRef.id)

    if (!created) {
      throw new Error('Failed to save title record.')
    }

    return created
  } catch (error) {
    return rethrowTitleHistoryError(error)
  }
}

export async function updateTitleHistory(
  id: string,
  data: UpdateCarTitleHistoryData
): Promise<void> {
  try {
    const existing = await getTitleHistoryById(id)

    if (!existing) {
      throw new CarTitleHistoryNotFoundError()
    }

    const prepared = await prepareUpdateData(data)
    const targetCarId = prepared.carId ?? existing.carId
    const targetTitleType = prepared.newTitleType ?? existing.newTitleType

    if (targetTitleType === 'Rebuilt') {
      await ensureRebuiltTransitionAllowed(targetCarId, 'Rebuilt')
    }

    if (prepared.carId !== undefined && prepared.carId !== existing.carId) {
      throw new CarTitleHistoryValidationError([
        'The title record car cannot be changed.',
      ])
    }

    await updateDoc(
      doc(db, COLLECTION_NAME, id),
      toUpdateDocumentData(prepared)
    )

    await syncCarTitleState(existing.carId)
  } catch (error) {
    rethrowTitleHistoryError(error)
  }
}

export async function canDeleteTitleHistory(
  id: string
): Promise<CarTitleHistoryDeleteCheck> {
  const record = await getTitleHistoryById(id)

  if (!record) {
    return {
      canDelete: false,
      exists: false,
      references: {
        activityLogs: 0,
        notifications: 0,
      },
    }
  }

  const references = await getTitleHistoryReferences(id)

  return {
    canDelete: Object.values(references).every((count) => count === 0),
    exists: true,
    references,
  }
}

export async function deleteTitleHistory(id: string): Promise<void> {
  try {
    const record = await getTitleHistoryById(id)

    if (!record) {
      throw new CarTitleHistoryNotFoundError()
    }

    const deleteCheck = await canDeleteTitleHistory(id)

    if (!deleteCheck.canDelete) {
      throw new CarTitleHistoryDeleteBlockedError(deleteCheck.references)
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id))
    await syncCarTitleState(record.carId)
  } catch (error) {
    rethrowTitleHistoryError(error)
  }
}

export async function getTitleHistoryByCarId(
  carId: string
): Promise<CarTitleHistory[]> {
  return getTitleHistory({ carId })
}

export async function getLatestTitleHistoryByCarId(
  carId: string
): Promise<CarTitleHistory | null> {
  const history = await getTitleHistoryByCarId(carId)
  return history[0] ?? null
}

export async function getCurrentCarTitleState(carId: string) {
  const carSnapshot = await resolveCarSnapshot(carId)
  const car = carSnapshot.data() as {
    status?: CarStatus
    title_type?: TitleType
    current_title_type?: TitleType
    title_last_updated_at?: string
    title_updated_by?: string
  }

  return {
    status: car.status ?? 'purchased',
    titleType: car.title_type ?? 'Clean',
    currentTitleType: car.current_title_type ?? car.title_type ?? 'Clean',
    titleLastUpdatedAt: car.title_last_updated_at ?? '',
    titleUpdatedBy: car.title_updated_by ?? '',
  }
}

export async function createRebuiltTitleFromPassedInspection(carId: string) {
  const current = await resolveCurrentCarTitleType(carId)

  if (current.currentTitleType !== 'Salvage') {
    return null
  }

  const latestSalvage = await getLatestSalvageTitleHistoryForCar(carId)
  const passed = await hasLatestPassedInspectionAfter(
    carId,
    getTitleHistorySortKey(latestSalvage)
  )

  if (!passed) {
    return null
  }

  const latestHistory = await getLatestTitleHistoryByCarId(carId)
  const previousTitleType =
    latestHistory?.newTitleType ?? current.currentTitleType

  if (previousTitleType === 'Rebuilt') {
    return null
  }

  return createTitleHistory({
    carId,
    previousTitleType,
    newTitleType: 'Rebuilt',
    changeDate: new Date().toISOString().slice(0, 10),
    updatedBy: 'System',
    notes: 'Automatically converted after a passed inspection.',
  })
}

export { createTitleHistory as create }
export { deleteTitleHistory as delete }
export { getTitleHistory as getAll }
export { getTitleHistoryById as getById }
export { updateTitleHistory as update }
