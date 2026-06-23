import {
  addDoc,
  collection,
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
  ActivityLog,
  ActivityLogAction,
  ActivityLogModule,
  ChangedField,
} from '@/features/logs/data/schema'
import type { ManagedUser } from '@/features/users/data/schema'

const COLLECTION_NAME = 'activity_logs'
const DELETE_BLOCKED_MESSAGE =
  'Activity logs are audit records and cannot be deleted directly.'

type FirestoreDate = Timestamp | Date | string | null

export interface ActivityLogDocument {
  id: string
  user_id: string
  user_name: string
  user_role: ManagedUser['role']
  action: ActivityLogAction
  module: ActivityLogModule
  entity_type: string
  entity_name: string
  description: string
  changed_fields?: ChangedField[] | null
  date: string
  time: string
  created_at?: FirestoreDate
  ip_address: string
}

export type CreateActivityLogData = {
  userId?: string
  userName?: string
  userRole?: ManagedUser['role']
  action: ActivityLogAction
  module: ActivityLogModule
  entityType: string
  entityName: string
  description: string
  changedFields?: ChangedField[] | null
  date?: string
  time?: string
  ipAddress?: string
}

export type LegacyCreateActivityLogData = {
  user_id: string
  user_name: string
  user_role: ManagedUser['role']
  action: ActivityLogAction
  module: ActivityLogModule
  entity_type: string
  entity_name: string
  description: string
  changed_fields?: ChangedField[] | null
  date: string
  time: string
  created_at?: FirestoreDate
  ip_address: string
}

export type UpdateActivityLogData = Partial<CreateActivityLogData>

export type ActivityLogDeleteCheck = {
  canDelete: boolean
}

type ActivityLogCreateDocumentData = Omit<
  ActivityLogDocument,
  'id' | 'created_at'
> & {
  created_at: FieldValue
}

type ActivityLogUpdateDocumentData = Partial<
  Omit<ActivityLogDocument, 'id' | 'created_at'>
> & {
  created_at?: FieldValue
}

export class ActivityLogDeleteBlockedError extends Error {
  constructor() {
    super(DELETE_BLOCKED_MESSAGE)
    this.name = 'ActivityLogDeleteBlockedError'
  }
}

function dateToString(value?: FirestoreDate) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return value.toDate().toISOString().slice(0, 10)
}

function getCurrentDateParts() {
  const now = new Date()

  return {
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
  }
}

function mapActivityLogSnapshot(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): ActivityLog {
  const data = {
    id: snapshot.id,
    ...(snapshot.data() as Omit<ActivityLogDocument, 'id'>),
  } as ActivityLogDocument

  return {
    id: data.id,
    userId: data.user_id,
    userName: data.user_name,
    userRole: data.user_role,
    action: data.action,
    module: data.module,
    entityType: data.entity_type,
    entityName: data.entity_name,
    description: data.description,
    changedFields: data.changed_fields ?? undefined,
    date: data.date,
    time: data.time,
    createdAt: dateToString(data.created_at) || data.date,
    ipAddress: data.ip_address,
  }
}

function toCreateDocumentData(
  data: CreateActivityLogData | LegacyCreateActivityLogData
): ActivityLogCreateDocumentData {
  const currentDateParts = getCurrentDateParts()
  const legacyData = data as LegacyCreateActivityLogData
  const currentData = data as CreateActivityLogData

  return {
    user_id: currentData.userId ?? legacyData.user_id ?? 'system',
    user_name: currentData.userName ?? legacyData.user_name ?? 'System',
    user_role: currentData.userRole ?? legacyData.user_role ?? 'Admin',
    action: data.action,
    module: data.module,
    entity_type: currentData.entityType ?? legacyData.entity_type,
    entity_name: currentData.entityName ?? legacyData.entity_name,
    description: data.description,
    changed_fields:
      currentData.changedFields ?? legacyData.changed_fields ?? null,
    date: currentData.date ?? legacyData.date ?? currentDateParts.date,
    time: currentData.time ?? legacyData.time ?? currentDateParts.time,
    created_at: serverTimestamp(),
    ip_address: currentData.ipAddress ?? legacyData.ip_address ?? '127.0.0.1',
  }
}

function toUpdateDocumentData(
  data: UpdateActivityLogData
): ActivityLogUpdateDocumentData {
  const documentData: ActivityLogUpdateDocumentData = {}

  if (data.userId !== undefined) documentData.user_id = data.userId
  if (data.userName !== undefined) documentData.user_name = data.userName
  if (data.userRole !== undefined) documentData.user_role = data.userRole
  if (data.action !== undefined) documentData.action = data.action
  if (data.module !== undefined) documentData.module = data.module
  if (data.entityType !== undefined) documentData.entity_type = data.entityType
  if (data.entityName !== undefined) documentData.entity_name = data.entityName
  if (data.description !== undefined) {
    documentData.description = data.description
  }
  if (data.changedFields !== undefined) {
    documentData.changed_fields = data.changedFields
  }
  if (data.date !== undefined) documentData.date = data.date
  if (data.time !== undefined) documentData.time = data.time
  if (data.ipAddress !== undefined) documentData.ip_address = data.ipAddress

  return documentData
}

async function getActivityLogSnapshot(id: string) {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))

  return snapshot.exists() ? snapshot : null
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc'))
  )

  return snapshot.docs.map(mapActivityLogSnapshot)
}

export async function getActivityLogById(
  id: string
): Promise<ActivityLog | null> {
  const snapshot = await getActivityLogSnapshot(id)

  return snapshot ? mapActivityLogSnapshot(snapshot) : null
}

export async function createActivityLog(
  data: CreateActivityLogData | LegacyCreateActivityLogData
): Promise<ActivityLog> {
  const docRef = await addDoc(
    collection(db, COLLECTION_NAME),
    toCreateDocumentData(data)
  )

  await updateDoc(docRef, { id: docRef.id })

  const created = await getActivityLogById(docRef.id)

  if (!created) {
    throw new Error('Failed to create activity log.')
  }

  return created
}

export async function updateActivityLog(
  id: string,
  data: UpdateActivityLogData
): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, id), toUpdateDocumentData(data))
}

export async function canDeleteActivityLog(
  id: string
): Promise<ActivityLogDeleteCheck> {
  void id

  return {
    canDelete: false,
  }
}

export async function deleteActivityLog(id: string): Promise<void> {
  void id
  throw new ActivityLogDeleteBlockedError()
}

export async function getLogsByUser(userId: string): Promise<ActivityLog[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    )
  )

  return snapshot.docs.map(mapActivityLogSnapshot)
}

export async function getLogsByModule(
  module: ActivityLogModule
): Promise<ActivityLog[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('module', '==', module),
      orderBy('created_at', 'desc')
    )
  )

  return snapshot.docs.map(mapActivityLogSnapshot)
}

export async function getLogsByAction(
  action: ActivityLogAction
): Promise<ActivityLog[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('action', '==', action),
      orderBy('created_at', 'desc')
    )
  )

  return snapshot.docs.map(mapActivityLogSnapshot)
}

export async function getLogsByDateRange(
  startDate: string,
  endDate: string
): Promise<ActivityLog[]> {
  const logs = await getActivityLogs()

  return logs.filter((log) => {
    if (startDate && log.date < startDate) return false
    if (endDate && log.date > endDate) return false

    return true
  })
}

export { createActivityLog as create }
export { deleteActivityLog as delete }
export { getActivityLogById as getById }
export { getActivityLogs as getAll }
export { updateActivityLog as update }
