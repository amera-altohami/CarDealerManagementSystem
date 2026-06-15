import { orderBy, where } from 'firebase/firestore'
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

const COLLECTION_NAME = 'managed_users'

export interface ManagedUserDocument {
  id: string
  full_name: string
  email: string
  phone?: string
  role: ManagedUser['role']
  status: ManagedUser['status']
  is_protected?: boolean
  created_at?: FirestoreDate
  last_login?: FirestoreDate
}

export type CreateManagedUserData = CreateData<ManagedUserDocument>
export type UpdateManagedUserData = UpdateData<ManagedUserDocument>

export async function getAll(): Promise<ManagedUserDocument[]> {
  return getCollectionDocs<ManagedUserDocument>(COLLECTION_NAME, [
    orderBy('created_at', 'desc'),
  ])
}

export async function getById(id: string): Promise<ManagedUserDocument | null> {
  return getDocumentById<ManagedUserDocument>(COLLECTION_NAME, id)
}

export async function create(
  data: CreateManagedUserData
): Promise<ManagedUserDocument> {
  return createDocument<ManagedUserDocument>(COLLECTION_NAME, data)
}

export async function update(
  id: string,
  data: UpdateManagedUserData
): Promise<void> {
  await updateDocument<ManagedUserDocument>(COLLECTION_NAME, id, data)
}

async function deleteManagedUser(id: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, id)
}

export async function getUsersByRole(
  role: ManagedUser['role']
): Promise<ManagedUserDocument[]> {
  return getCollectionDocs<ManagedUserDocument>(COLLECTION_NAME, [
    where('role', '==', role),
    orderBy('created_at', 'desc'),
  ])
}

export { deleteManagedUser as delete }
