import { orderBy, where } from 'firebase/firestore'
import type { ProfitShare } from '@/features/partners/data/schema'
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

const COLLECTION_NAME = 'profit_shares'

export interface ProfitShareDocument {
  id: string
  partner_id: string
  car_id: string
  car_name: string
  car_cost: number
  selling_price: number
  net_profit: number
  partner_percentage: number
  partner_profit_share: number
  status: ProfitShare['status']
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export type CreateProfitShareData = CreateData<ProfitShareDocument>
export type UpdateProfitShareData = UpdateData<ProfitShareDocument>

export async function getAll(): Promise<ProfitShareDocument[]> {
  return getCollectionDocs<ProfitShareDocument>(COLLECTION_NAME, [
    orderBy('created_at', 'desc'),
  ])
}

export async function getById(id: string): Promise<ProfitShareDocument | null> {
  return getDocumentById<ProfitShareDocument>(COLLECTION_NAME, id)
}

export async function create(
  data: CreateProfitShareData
): Promise<ProfitShareDocument> {
  return createDocument<ProfitShareDocument>(COLLECTION_NAME, data)
}

export async function update(
  id: string,
  data: UpdateProfitShareData
): Promise<void> {
  await updateDocument<ProfitShareDocument>(COLLECTION_NAME, id, data)
}

async function deleteProfitShare(id: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, id)
}

export async function getProfitSharesByPartnerId(
  partnerId: string
): Promise<ProfitShareDocument[]> {
  return getCollectionDocs<ProfitShareDocument>(COLLECTION_NAME, [
    where('partner_id', '==', partnerId),
    orderBy('created_at', 'desc'),
  ])
}

export async function getProfitSharesByCarId(
  carId: string
): Promise<ProfitShareDocument[]> {
  return getCollectionDocs<ProfitShareDocument>(COLLECTION_NAME, [
    where('car_id', '==', carId),
    orderBy('created_at', 'desc'),
  ])
}

export { deleteProfitShare as delete }
