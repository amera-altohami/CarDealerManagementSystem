import { orderBy, where } from 'firebase/firestore'
import type { PartnerContribution } from '@/features/partners/data/schema'
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

const COLLECTION_NAME = 'partner_contributions'

export interface PartnerContributionDocument {
  id: string
  partner_id: string
  car_id: string
  car_name: string
  contribution_amount: number
  investment_percentage: number
  contribution_date: string
  payment_method: PartnerContribution['paymentMethod']
  notes?: string
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export type CreatePartnerContributionData =
  CreateData<PartnerContributionDocument>
export type UpdatePartnerContributionData =
  UpdateData<PartnerContributionDocument>

export async function getAll(): Promise<PartnerContributionDocument[]> {
  return getCollectionDocs<PartnerContributionDocument>(COLLECTION_NAME, [
    orderBy('contribution_date', 'desc'),
  ])
}

export async function getById(
  id: string
): Promise<PartnerContributionDocument | null> {
  return getDocumentById<PartnerContributionDocument>(COLLECTION_NAME, id)
}

export async function create(
  data: CreatePartnerContributionData
): Promise<PartnerContributionDocument> {
  return createDocument<PartnerContributionDocument>(COLLECTION_NAME, data)
}

export async function update(
  id: string,
  data: UpdatePartnerContributionData
): Promise<void> {
  await updateDocument<PartnerContributionDocument>(COLLECTION_NAME, id, data)
}

async function deletePartnerContribution(id: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, id)
}

export async function getContributionsByPartnerId(
  partnerId: string
): Promise<PartnerContributionDocument[]> {
  return getCollectionDocs<PartnerContributionDocument>(COLLECTION_NAME, [
    where('partner_id', '==', partnerId),
    orderBy('contribution_date', 'desc'),
  ])
}

export async function getContributionsByCarId(
  carId: string
): Promise<PartnerContributionDocument[]> {
  return getCollectionDocs<PartnerContributionDocument>(COLLECTION_NAME, [
    where('car_id', '==', carId),
    orderBy('contribution_date', 'desc'),
  ])
}

export { deletePartnerContribution as delete }
