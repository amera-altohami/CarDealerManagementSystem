import { orderBy, where } from 'firebase/firestore'
import { getCars } from './carsService'
import { getInspectionsByCarId } from './inspectionsService'
import type {
  NotificationReadStatus,
  NotificationSeverity,
  NotificationType,
  AppNotification,
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

function dateToString(value?: FirestoreDate) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return value.toDate().toISOString().slice(0, 10)
}

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
    relatedCarId: notification.related_car_id,
    relatedCarName: notification.related_car_name,
    createdAt: dateToString(notification.created_at),
    dueDate: notification.due_date,
    actionUrl: notification.action_url,
    createdBy: notification.created_by,
  }
}

async function getSalvageCarInspectionAlerts(): Promise<AppNotification[]> {
  const cars = await getCars()
  const salvageCars = cars.filter(
    (car) => car.currentTitleType === 'Salvage' || car.titleType === 'Salvage'
  )

  const alerts = await Promise.all(
    salvageCars.map(async (car) => {
      const inspections = await getInspectionsByCarId(car.id)

      if (inspections.length > 0) {
        return null
      }

      const carName = `${car.brand} ${car.model} ${car.year}`.trim()

      return {
        id: `salvage-inspection-${car.id}`,
        title: 'Salvage car needs inspection',
        message: `${carName} is marked as Salvage and has no linked inspection yet.`,
        type: 'Inspection',
        severity: 'High',
        status: 'Unread',
        relatedCarId: car.id,
        relatedCarName: carName,
        createdAt: car.titleLastUpdatedAt || car.purchaseDate || '',
        dueDate: '',
        actionUrl: `/inspections/new?carId=${car.id}`,
        createdBy: 'System',
      } satisfies AppNotification
    })
  )

  return alerts.flatMap((alert) => (alert ? [alert] : []))
}

export async function getAppNotifications(): Promise<AppNotification[]> {
  const [storedNotifications, salvageAlerts] = await Promise.all([
    getAll(),
    getSalvageCarInspectionAlerts(),
  ])

  const mappedNotifications = storedNotifications.map(
    mapNotificationDocumentToAppNotification
  )

  return [...salvageAlerts, ...mappedNotifications].sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt)
  )
}

export { deleteNotification as delete }
