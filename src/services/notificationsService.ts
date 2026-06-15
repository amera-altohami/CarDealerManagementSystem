import { orderBy, where } from 'firebase/firestore'
import type {
  NotificationReadStatus,
  NotificationSeverity,
  NotificationType,
} from '@/features/notifications/data/schema'
import {
  createDocument,
  deleteDocument,
  getCollectionDocs,
  getDocumentById,
  updateDocument,
  type CreateData,
  type FirestoreDate,
  type UpdateData,
} from './firestoreService'

const COLLECTION_NAME = 'notifications'

export interface NotificationDocument {
  id: string
  title: string
  message: string
  type: NotificationType
  severity: NotificationSeverity
  status: NotificationReadStatus
  related_car_id?: string
  related_car_name?: string
  created_at?: FirestoreDate
  due_date?: string
  action_url?: string
  created_by: string
}

export type CreateNotificationData = CreateData<NotificationDocument>
export type UpdateNotificationData = UpdateData<NotificationDocument>

export async function getAll(): Promise<NotificationDocument[]> {
  return getCollectionDocs<NotificationDocument>(COLLECTION_NAME, [
    orderBy('created_at', 'desc'),
  ])
}

export async function getById(
  id: string
): Promise<NotificationDocument | null> {
  return getDocumentById<NotificationDocument>(COLLECTION_NAME, id)
}

export async function create(
  data: CreateNotificationData
): Promise<NotificationDocument> {
  return createDocument<NotificationDocument>(COLLECTION_NAME, data)
}

export async function update(
  id: string,
  data: UpdateNotificationData
): Promise<void> {
  await updateDocument<NotificationDocument>(COLLECTION_NAME, id, data)
}

async function deleteNotification(id: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, id)
}

export async function getUnreadNotifications(): Promise<
  NotificationDocument[]
> {
  return getCollectionDocs<NotificationDocument>(COLLECTION_NAME, [
    where('status', '==', 'Unread'),
    orderBy('created_at', 'desc'),
  ])
}

export { deleteNotification as delete }
