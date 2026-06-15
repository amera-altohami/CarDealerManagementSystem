import type { InspectionStatus } from '@/data/dealerOperationsMockData'
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

const COLLECTION_NAME = 'inspections'

export interface InspectionDocument {
  id: string
  car_id: string
  car_name?: string
  place_id: string
  place?: string
  date: string
  time: string
  status: InspectionStatus
  notes?: string
  files?: string[]
  receipts?: string[]
  before_images?: string[]
  after_images?: string[]
  reminder_sent: boolean
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export type CreateInspectionData = CreateData<InspectionDocument>
export type UpdateInspectionData = UpdateData<InspectionDocument>

export async function getAll(): Promise<InspectionDocument[]> {
  return getCollectionDocs<InspectionDocument>(COLLECTION_NAME, [
    orderBy('date', 'desc'),
  ])
}

export async function getById(id: string): Promise<InspectionDocument | null> {
  return getDocumentById<InspectionDocument>(COLLECTION_NAME, id)
}

export async function create(
  data: CreateInspectionData
): Promise<InspectionDocument> {
  return createDocument<InspectionDocument>(COLLECTION_NAME, data)
}

export async function update(
  id: string,
  data: UpdateInspectionData
): Promise<void> {
  await updateDocument<InspectionDocument>(COLLECTION_NAME, id, data)
}

async function deleteInspection(id: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, id)
}

export async function getInspectionsByCarId(
  carId: string
): Promise<InspectionDocument[]> {
  return getCollectionDocs<InspectionDocument>(COLLECTION_NAME, [
    where('car_id', '==', carId),
    orderBy('date', 'desc'),
  ])
}

export async function getPendingInspections(): Promise<InspectionDocument[]> {
  return getCollectionDocs<InspectionDocument>(COLLECTION_NAME, [
    where('status', '==', 'Pending'),
    orderBy('date'),
  ])
}

export { deleteInspection as delete }
