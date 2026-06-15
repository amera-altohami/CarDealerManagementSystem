import { orderBy, where } from 'firebase/firestore'
import type { TitleType } from '@/features/cars/types/title'
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

const COLLECTION_NAME = 'car_title_history'

export interface CarTitleHistoryDocument {
  id: string
  car_id: string
  previous_title_type: TitleType
  new_title_type: TitleType
  change_date: string
  updated_by: string
  notes?: string
  created_at?: FirestoreDate
}

export type CreateCarTitleHistoryData = CreateData<CarTitleHistoryDocument>
export type UpdateCarTitleHistoryData = UpdateData<CarTitleHistoryDocument>

export async function getAll(): Promise<CarTitleHistoryDocument[]> {
  return getCollectionDocs<CarTitleHistoryDocument>(COLLECTION_NAME, [
    orderBy('change_date', 'desc'),
  ])
}

export async function getById(
  id: string
): Promise<CarTitleHistoryDocument | null> {
  return getDocumentById<CarTitleHistoryDocument>(COLLECTION_NAME, id)
}

export async function create(
  data: CreateCarTitleHistoryData
): Promise<CarTitleHistoryDocument> {
  return createDocument<CarTitleHistoryDocument>(COLLECTION_NAME, data)
}

export async function update(
  id: string,
  data: UpdateCarTitleHistoryData
): Promise<void> {
  await updateDocument<CarTitleHistoryDocument>(COLLECTION_NAME, id, data)
}

async function deleteCarTitleHistory(id: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, id)
}

export async function getTitleHistoryByCarId(
  carId: string
): Promise<CarTitleHistoryDocument[]> {
  return getCollectionDocs<CarTitleHistoryDocument>(COLLECTION_NAME, [
    where('car_id', '==', carId),
    orderBy('change_date', 'desc'),
  ])
}

export { deleteCarTitleHistory as delete }
