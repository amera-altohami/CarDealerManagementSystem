import { Timestamp, orderBy, where } from 'firebase/firestore'
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
import { type CompanyType } from '@/features/companies/model'

const COLLECTION_NAME = 'companies'

type CompanyReferenceDocument = {
  id: string
}

export interface CompanyDocument {
  id: string
  name: string
  type: CompanyType
  phone_number: string
  address: string
  email?: string | null
  notes?: string | null
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export interface Company {
  id: string
  name: string
  type: CompanyType
  phoneNumber: string
  address: string
  email?: string | null
  notes?: string | null
  createdAt?: FirestoreDate
  updatedAt?: FirestoreDate
}

export interface CompanyUsageSummary {
  cars: number
  parts: number
  inspections: number
  total: number
}

export type CreateCompanyData = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateCompanyData = Partial<CreateCompanyData>

function mapCompanyDocument(document: CompanyDocument): Company {
  return {
    id: document.id,
    name: document.name,
    type: document.type,
    phoneNumber: document.phone_number,
    address: document.address,
    email: document.email ?? null,
    notes: document.notes ?? null,
    createdAt: document.created_at,
    updatedAt: document.updated_at,
  }
}

function normalizeText(value?: string | null) {
  if (value === undefined) return undefined
  if (value === null) return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toCreateDocumentData(data: CreateCompanyData): CreateData<CompanyDocument> {
  const now = Timestamp.now()

  return {
    name: data.name.trim(),
    type: data.type,
    phone_number: data.phoneNumber.trim(),
    address: data.address.trim(),
    email: normalizeText(data.email),
    notes: normalizeText(data.notes),
    created_at: now,
    updated_at: now,
  }
}

function toUpdateDocumentData(data: UpdateCompanyData): UpdateData<CompanyDocument> {
  const documentData: UpdateData<CompanyDocument> = {}

  if (data.name !== undefined) {
    documentData.name = data.name.trim()
  }

  if (data.type !== undefined) {
    documentData.type = data.type
  }

  if (data.phoneNumber !== undefined) {
    documentData.phone_number = data.phoneNumber.trim()
  }

  if (data.address !== undefined) {
    documentData.address = data.address.trim()
  }

  if (data.email !== undefined) {
    documentData.email = normalizeText(data.email)
  }

  if (data.notes !== undefined) {
    documentData.notes = normalizeText(data.notes)
  }

  documentData.updated_at = Timestamp.now()

  return documentData
}

export async function getCompanyUsageSummary(
  companyId: string
): Promise<CompanyUsageSummary> {
  const [cars, parts, inspections] = await Promise.all([
    getCollectionDocs<CompanyReferenceDocument>('cars', [
      where('purchase_place_id', '==', companyId),
    ]),
    getCollectionDocs<CompanyReferenceDocument>('parts', [
      where('supplier_id', '==', companyId),
    ]),
    getCollectionDocs<CompanyReferenceDocument>('inspections', [
      where('place_id', '==', companyId),
    ]),
  ])

  return {
    cars: cars.length,
    parts: parts.length,
    inspections: inspections.length,
    total: cars.length + parts.length + inspections.length,
  }
}

export async function getAllCompanies(): Promise<Company[]> {
  const documents = await getCollectionDocs<CompanyDocument>(COLLECTION_NAME, [
    orderBy('name'),
  ])

  return documents.map(mapCompanyDocument)
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const document = await getDocumentById<CompanyDocument>(COLLECTION_NAME, id)

  return document ? mapCompanyDocument(document) : null
}

export async function createCompany(data: CreateCompanyData): Promise<Company> {
  const created = await createDocument<CompanyDocument>(
    COLLECTION_NAME,
    toCreateDocumentData(data)
  )

  return mapCompanyDocument(created)
}

export async function updateCompany(
  id: string,
  data: UpdateCompanyData
): Promise<void> {
  await updateDocument<CompanyDocument>(
    COLLECTION_NAME,
    id,
    toUpdateDocumentData(data)
  )
}

export async function deleteCompany(id: string): Promise<void> {
  const usage = await getCompanyUsageSummary(id)

  if (usage.total > 0) {
    throw new Error(
      `This company cannot be deleted because it is linked to ${usage.total} record(s) in cars, parts, or inspections.`
    )
  }

  await deleteDocument(COLLECTION_NAME, id)
}

export async function getCompaniesByType(
  type: CompanyType
): Promise<Company[]> {
  const documents = await getCollectionDocs<CompanyDocument>(COLLECTION_NAME, [
    where('type', '==', type),
  ])

  return documents
    .map(mapCompanyDocument)
    .sort((left, right) => left.name.localeCompare(right.name))
}

export { getAllCompanies as getAll, deleteCompany as delete }
