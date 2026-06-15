import type { CarStatus, CarTitleType } from '@/data/carsMockData'
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

const COLLECTION_NAME = 'cars'

export interface CarDocument {
  id: string
  brand: string
  model: string
  year: number
  vin: string
  lot_number: string
  status: CarStatus
  title_type: CarTitleType
  current_title_type: CarTitleType
  title_last_updated_at: string
  title_updated_by: string
  purchase_date: string
  purchase_price: number
  selling_price: number
  purchase_place_id: string
  carfax_type: 'link' | 'pdf'
  carfax_link?: string | null
  carfax_pdf_name?: string | null
  carfax_pdf_url?: string | null
  notes?: string
  photo_url?: string
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export type CreateCarData = CreateData<CarDocument>
export type UpdateCarData = UpdateData<CarDocument>

export async function getAll(): Promise<CarDocument[]> {
  return getCollectionDocs<CarDocument>(COLLECTION_NAME, [
    orderBy('purchase_date', 'desc'),
  ])
}

export async function getById(id: string): Promise<CarDocument | null> {
  return getDocumentById<CarDocument>(COLLECTION_NAME, id)
}

export async function create(data: CreateCarData): Promise<CarDocument> {
  return createDocument<CarDocument>(COLLECTION_NAME, data)
}

export async function update(id: string, data: UpdateCarData): Promise<void> {
  await updateDocument<CarDocument>(COLLECTION_NAME, id, data)
}

async function deleteCar(id: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, id)
}

export async function getCars(): Promise<CarDocument[]> {
  return getAll()
}

export async function getCarById(id: string): Promise<CarDocument | null> {
  return getById(id)
}

export async function getCarsByStatus(
  status: CarStatus
): Promise<CarDocument[]> {
  return getCollectionDocs<CarDocument>(COLLECTION_NAME, [
    where('status', '==', status),
    orderBy('purchase_date', 'desc'),
  ])
}

export { deleteCar as delete }
