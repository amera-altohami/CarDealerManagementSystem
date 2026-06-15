import { orderBy, where } from 'firebase/firestore'
import type {
  ActivityLogAction,
  ActivityLogModule,
  ChangedField,
} from '@/features/logs/data/schema'
import type { ManagedUser } from '@/features/users/data/schema'
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

const COLLECTION_NAME = 'activity_logs'

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

export type CreateActivityLogData = CreateData<ActivityLogDocument>
export type UpdateActivityLogData = UpdateData<ActivityLogDocument>

export async function getAll(): Promise<ActivityLogDocument[]> {
  return getCollectionDocs<ActivityLogDocument>(COLLECTION_NAME, [
    orderBy('created_at', 'desc'),
  ])
}

export async function getById(id: string): Promise<ActivityLogDocument | null> {
  return getDocumentById<ActivityLogDocument>(COLLECTION_NAME, id)
}

export async function create(
  data: CreateActivityLogData
): Promise<ActivityLogDocument> {
  return createDocument<ActivityLogDocument>(COLLECTION_NAME, data)
}

export async function update(
  id: string,
  data: UpdateActivityLogData
): Promise<void> {
  await updateDocument<ActivityLogDocument>(COLLECTION_NAME, id, data)
}

async function deleteActivityLog(id: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, id)
}

export async function getLogsByUser(
  userId: string
): Promise<ActivityLogDocument[]> {
  return getCollectionDocs<ActivityLogDocument>(COLLECTION_NAME, [
    where('user_id', '==', userId),
    orderBy('created_at', 'desc'),
  ])
}

export async function getLogsByModule(
  module: ActivityLogModule
): Promise<ActivityLogDocument[]> {
  return getCollectionDocs<ActivityLogDocument>(COLLECTION_NAME, [
    where('module', '==', module),
    orderBy('created_at', 'desc'),
  ])
}

export { deleteActivityLog as delete }
