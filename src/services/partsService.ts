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

const COLLECTION_NAME = 'parts'

export interface PartDocument {
  id: string
  part_name: string
  price: number
  supplier_id?: string
  supplier_name: string
  purchase_date: string
  installed: boolean
  related_car_id?: string | null
  related_car_name?: string | null
  invoice_name?: string | null
  invoice_url?: string | null
  notes?: string
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export type CreatePartData = CreateData<PartDocument>
export type UpdatePartData = UpdateData<PartDocument>

export async function getAll(): Promise<PartDocument[]> {
  return getCollectionDocs<PartDocument>(COLLECTION_NAME, [
    orderBy('purchase_date', 'desc'),
  ])
}

export async function getById(id: string): Promise<PartDocument | null> {
  return getDocumentById<PartDocument>(COLLECTION_NAME, id)
}

export async function create(data: CreatePartData): Promise<PartDocument> {
  return createDocument<PartDocument>(COLLECTION_NAME, data)
}

export async function update(id: string, data: UpdatePartData): Promise<void> {
  await updateDocument<PartDocument>(COLLECTION_NAME, id, data)
}

async function deletePart(id: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, id)
}

export async function getPartsByCarId(carId: string): Promise<PartDocument[]> {
  return getCollectionDocs<PartDocument>(COLLECTION_NAME, [
    where('related_car_id', '==', carId),
    orderBy('purchase_date', 'desc'),
  ])
}

export { deletePart as delete }
