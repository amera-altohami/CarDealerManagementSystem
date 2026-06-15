import type { CompanyType } from '@/data/dealerOperationsMockData'
import { orderBy, where } from 'firebase/firestore'
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

const COLLECTION_NAME = 'companies'

export interface CompanyDocument {
  id: string
  name: string
  type: CompanyType
  phone_number: string
  address: string
  email?: string
  notes?: string
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export type CreateCompanyData = CreateData<CompanyDocument>
export type UpdateCompanyData = UpdateData<CompanyDocument>

export async function getAll(): Promise<CompanyDocument[]> {
  return getCollectionDocs<CompanyDocument>(COLLECTION_NAME, [orderBy('name')])
}

export async function getById(id: string): Promise<CompanyDocument | null> {
  return getDocumentById<CompanyDocument>(COLLECTION_NAME, id)
}

export async function create(
  data: CreateCompanyData
): Promise<CompanyDocument> {
  return createDocument<CompanyDocument>(COLLECTION_NAME, data)
}

export async function update(
  id: string,
  data: UpdateCompanyData
): Promise<void> {
  await updateDocument<CompanyDocument>(COLLECTION_NAME, id, data)
}

async function deleteCompany(id: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, id)
}

export async function getCompaniesByType(
  type: CompanyType
): Promise<CompanyDocument[]> {
  return getCollectionDocs<CompanyDocument>(COLLECTION_NAME, [
    where('type', '==', type),
    orderBy('name'),
  ])
}

export { deleteCompany as delete }
