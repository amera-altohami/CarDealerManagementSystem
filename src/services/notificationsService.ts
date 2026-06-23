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
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  AppNotification,
  NotificationReadStatus,
  NotificationSeverity,
  NotificationType,
} from '@/features/notifications/data/schema'
import { create as createActivityLog } from './activityLogsService'

const COLLECTION_NAME = 'notifications'
const DELETE_BLOCKED_MESSAGE =
  'This notification cannot be deleted because it is linked to an active related record.'
const NOT_FOUND_MESSAGE = 'Notification was not found.'

type FirestoreDate = Timestamp | Date | string | null

type RelatedCarDocument = {
  status?: string
  carfax_link?: string | null
  carfax_pdf_name?: string | null
  carfax_pdf_url?: string | null
}

export interface NotificationDocument {
  id: string
  title: string
  message: string
  type: NotificationType
  severity: NotificationSeverity
  status: NotificationReadStatus
  related_car_id?: string | null
  related_car_name?: string | null
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
  due_date?: string | null
  action_url?: string | null
  created_by: string
}

export type CreateNotificationData = {
  title: string
  message: string
  type: NotificationType
  severity: NotificationSeverity
  status?: NotificationReadStatus
  relatedCarId?: string | null
  relatedCarName?: string | null
  dueDate?: string | null
  actionUrl?: string | null
  createdBy?: string
}

export type UpdateNotificationData = Partial<CreateNotificationData>

export type NotificationReferences = {
  cars: number
  inspections: number
  parts: number
  missingDocuments: number
}

export type NotificationDeleteCheck = {
  canDelete: boolean
  exists: boolean
  references: NotificationReferences
}

type NotificationCreateDocumentData = Omit<
  NotificationDocument,
  'id' | 'created_at' | 'updated_at'
> & {
  created_at: FieldValue
  updated_at: FieldValue
}

type NotificationUpdateDocumentData = Partial<
  Omit<NotificationDocument, 'id' | 'created_at' | 'updated_at'>
> & {
  updated_at: FieldValue
}

export class NotificationDeleteBlockedError extends Error {
  references: NotificationReferences

  constructor(references: NotificationReferences) {
    super(DELETE_BLOCKED_MESSAGE)
    this.name = 'NotificationDeleteBlockedError'
    this.references = references
  }
}

export class NotificationNotFoundError extends Error {
  constructor() {
    super(NOT_FOUND_MESSAGE)
    this.name = 'NotificationNotFoundError'
  }
}

function normalizeText(value?: string | null) {
  if (value === undefined) return undefined
  if (value === null) return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function dateToString(value?: FirestoreDate) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return value.toDate().toISOString().slice(0, 10)
}

function mapNotificationSnapshot(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): NotificationDocument {
  const data = {
    id: snapshot.id,
    ...(snapshot.data() as Omit<NotificationDocument, 'id'>),
  } as NotificationDocument

  return data
}

function mapNotificationDocumentToAppNotification(
  notification: NotificationDocument
): AppNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    severity: notification.severity,
    status: notification.status,
    relatedCarId: notification.related_car_id ?? undefined,
    relatedCarName: notification.related_car_name ?? undefined,
    createdAt: dateToString(notification.created_at),
    dueDate: notification.due_date ?? undefined,
    actionUrl: notification.action_url ?? undefined,
    createdBy: notification.created_by,
  }
}

function toCreateDocumentData(
  data: CreateNotificationData
): NotificationCreateDocumentData {
  return {
    title: data.title.trim(),
    message: data.message.trim(),
    type: data.type,
    severity: data.severity,
    status: data.status ?? 'Unread',
    related_car_id: normalizeText(data.relatedCarId) ?? null,
    related_car_name: normalizeText(data.relatedCarName) ?? null,
    due_date: normalizeText(data.dueDate) ?? null,
    action_url: normalizeText(data.actionUrl) ?? null,
    created_by: normalizeText(data.createdBy) ?? 'System',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }
}

function toUpdateDocumentData(
  data: UpdateNotificationData
): NotificationUpdateDocumentData {
  const documentData: NotificationUpdateDocumentData = {
    updated_at: serverTimestamp(),
  }

  if (data.title !== undefined) documentData.title = data.title.trim()
  if (data.message !== undefined) documentData.message = data.message.trim()
  if (data.type !== undefined) documentData.type = data.type
  if (data.severity !== undefined) documentData.severity = data.severity
  if (data.status !== undefined) documentData.status = data.status
  if (data.relatedCarId !== undefined) {
    documentData.related_car_id = normalizeText(data.relatedCarId) ?? null
  }
  if (data.relatedCarName !== undefined) {
    documentData.related_car_name = normalizeText(data.relatedCarName) ?? null
  }
  if (data.dueDate !== undefined) {
    documentData.due_date = normalizeText(data.dueDate) ?? null
  }
  if (data.actionUrl !== undefined) {
    documentData.action_url = normalizeText(data.actionUrl) ?? null
  }
  if (data.createdBy !== undefined) {
    documentData.created_by = normalizeText(data.createdBy) ?? 'System'
  }

  return documentData
}

function sortByCreatedDateDesc(notifications: AppNotification[]) {
  return [...notifications].sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt)
  )
}

async function writeNotificationActivityLog(
  action: 'Create' | 'Update' | 'Delete',
  notification: Pick<NotificationDocument, 'id' | 'title'>
) {
  try {
    const now = new Date()

    await createActivityLog({
      user_id: 'system',
      user_name: 'System',
      user_role: 'Admin',
      action,
      module: 'Notifications',
      entity_type: 'notification',
      entity_name: notification.title,
      description: `${action} notification ${notification.title}`,
      changed_fields: null,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      created_at: now,
      ip_address: '127.0.0.1',
    })
  } catch {
    // Activity logging should not block the primary notification action.
  }
}

async function getNotificationDocumentById(
  id: string
): Promise<NotificationDocument | null> {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))

  return snapshot.exists() ? mapNotificationSnapshot(snapshot) : null
}

function hasMissingDocuments(car: RelatedCarDocument) {
  return !(
    normalizeText(car.carfax_link) ||
    normalizeText(car.carfax_pdf_url) ||
    normalizeText(car.carfax_pdf_name)
  )
}

async function getRelatedCarSnapshot(relatedCarId?: string | null) {
  if (!relatedCarId) return null

  const snapshot = await getDoc(doc(db, 'cars', relatedCarId))

  return snapshot.exists() ? snapshot : null
}

async function getRelatedCollectionCount(
  collectionName: string,
  relatedCarId: string
) {
  const snapshot = await getDocs(
    query(collection(db, collectionName), where('car_id', '==', relatedCarId))
  )

  return snapshot.size
}

async function getRelatedPartsCount(relatedCarId: string) {
  const snapshot = await getDocs(
    query(collection(db, 'parts'), where('related_car_id', '==', relatedCarId))
  )

  return snapshot.size
}

export async function getNotificationDocuments(): Promise<
  NotificationDocument[]
> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc'))
  )

  return snapshot.docs.map(mapNotificationSnapshot)
}

export async function getNotifications(): Promise<AppNotification[]> {
  const notifications = await getNotificationDocuments()

  return sortByCreatedDateDesc(
    notifications.map(mapNotificationDocumentToAppNotification)
  )
}

export async function getNotificationById(
  id: string
): Promise<AppNotification | null> {
  const notification = await getNotificationDocumentById(id)

  return notification
    ? mapNotificationDocumentToAppNotification(notification)
    : null
}

export async function createNotification(
  data: CreateNotificationData
): Promise<AppNotification> {
  const docRef = await addDoc(
    collection(db, COLLECTION_NAME),
    toCreateDocumentData(data)
  )

  await updateDoc(docRef, { id: docRef.id })

  const created = await getNotificationDocumentById(docRef.id)

  if (!created) {
    throw new Error('Failed to save notification.')
  }

  await writeNotificationActivityLog('Create', created)

  return mapNotificationDocumentToAppNotification(created)
}

export async function updateNotification(
  id: string,
  data: UpdateNotificationData
): Promise<void> {
  const current = await getNotificationDocumentById(id)

  if (!current) {
    throw new NotificationNotFoundError()
  }

  await updateDoc(doc(db, COLLECTION_NAME, id), toUpdateDocumentData(data))
  await writeNotificationActivityLog('Update', {
    id,
    title: data.title ?? current.title,
  })
}

export async function deleteNotification(id: string): Promise<void> {
  const notification = await getNotificationDocumentById(id)

  if (!notification) {
    throw new NotificationNotFoundError()
  }

  const deleteCheck = await canDeleteNotification(id)

  if (!deleteCheck.canDelete) {
    throw new NotificationDeleteBlockedError(deleteCheck.references)
  }

  await deleteDoc(doc(db, COLLECTION_NAME, id))
  await writeNotificationActivityLog('Delete', notification)
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await updateNotification(id, { status: 'Read' })
}

export async function markNotificationAsUnread(id: string): Promise<void> {
  await updateNotification(id, { status: 'Unread' })
}

export async function getUnreadNotifications(): Promise<AppNotification[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'Unread'),
      orderBy('created_at', 'desc')
    )
  )

  return sortByCreatedDateDesc(
    snapshot.docs
      .map(mapNotificationSnapshot)
      .map(mapNotificationDocumentToAppNotification)
  )
}

export async function getNotificationsByType(
  type: NotificationType
): Promise<AppNotification[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('type', '==', type),
      orderBy('created_at', 'desc')
    )
  )

  return sortByCreatedDateDesc(
    snapshot.docs
      .map(mapNotificationSnapshot)
      .map(mapNotificationDocumentToAppNotification)
  )
}

export async function getNotificationsBySeverity(
  severity: NotificationSeverity
): Promise<AppNotification[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('severity', '==', severity),
      orderBy('created_at', 'desc')
    )
  )

  return sortByCreatedDateDesc(
    snapshot.docs
      .map(mapNotificationSnapshot)
      .map(mapNotificationDocumentToAppNotification)
  )
}

export async function getNotificationsByStatus(
  status: NotificationReadStatus
): Promise<AppNotification[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('status', '==', status),
      orderBy('created_at', 'desc')
    )
  )

  return sortByCreatedDateDesc(
    snapshot.docs
      .map(mapNotificationSnapshot)
      .map(mapNotificationDocumentToAppNotification)
  )
}

export async function getNotificationsByCarId(
  carId: string
): Promise<AppNotification[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('related_car_id', '==', carId),
      orderBy('created_at', 'desc')
    )
  )

  return sortByCreatedDateDesc(
    snapshot.docs
      .map(mapNotificationSnapshot)
      .map(mapNotificationDocumentToAppNotification)
  )
}

export async function canDeleteNotification(
  id: string
): Promise<NotificationDeleteCheck> {
  const notification = await getNotificationDocumentById(id)
  const emptyReferences: NotificationReferences = {
    cars: 0,
    inspections: 0,
    parts: 0,
    missingDocuments: 0,
  }

  if (!notification) {
    return {
      canDelete: false,
      exists: false,
      references: emptyReferences,
    }
  }

  const relatedCarId = normalizeText(notification.related_car_id)

  if (!relatedCarId) {
    return {
      canDelete: true,
      exists: true,
      references: emptyReferences,
    }
  }

  const carSnapshot = await getRelatedCarSnapshot(relatedCarId)
  const cars = carSnapshot ? 1 : 0
  const inspections =
    notification.type === 'Inspection'
      ? await getRelatedCollectionCount('inspections', relatedCarId)
      : 0
  const parts =
    notification.type === 'Low Parts'
      ? await getRelatedPartsCount(relatedCarId)
      : 0
  const missingDocuments =
    notification.type === 'Missing Documents' && carSnapshot
      ? hasMissingDocuments(carSnapshot.data() as RelatedCarDocument)
        ? 1
        : 0
      : 0
  const shouldBlockForCar =
    notification.type === 'Missing Documents' ? missingDocuments > 0 : cars > 0
  const references = {
    cars,
    inspections,
    parts,
    missingDocuments,
  }

  return {
    canDelete:
      !shouldBlockForCar &&
      inspections === 0 &&
      parts === 0 &&
      missingDocuments === 0,
    exists: true,
    references,
  }
}

export { createNotification as create }
export { deleteNotification as delete }
export { getNotificationById as getById }
export { getNotificationDocuments as getAll }
export { getNotifications as getAppNotifications }
export { updateNotification as update }
