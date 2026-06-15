import { orderBy, where } from 'firebase/firestore'
import type { Partner } from '@/features/partners/data/schema'
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
import {
  getContributionsByPartnerId,
  type PartnerContributionDocument,
} from './partnerContributionsService'
import {
  getProfitSharesByPartnerId,
  type ProfitShareDocument,
} from './profitSharesService'

const COLLECTION_NAME = 'partners'

export interface PartnerDocument {
  id: string
  name: string
  email?: string
  phone?: string
  status: Partner['status']
  notes?: string
  investment_percentage: number
  total_contribution: number
  total_profit: number
  total_loss: number
  final_balance: number
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export type CreatePartnerData = CreateData<PartnerDocument>
export type UpdatePartnerData = UpdateData<PartnerDocument>

export async function getAll(): Promise<PartnerDocument[]> {
  return getCollectionDocs<PartnerDocument>(COLLECTION_NAME, [orderBy('name')])
}

export async function getById(id: string): Promise<PartnerDocument | null> {
  return getDocumentById<PartnerDocument>(COLLECTION_NAME, id)
}

export async function create(
  data: CreatePartnerData
): Promise<PartnerDocument> {
  return createDocument<PartnerDocument>(COLLECTION_NAME, data)
}

export async function update(
  id: string,
  data: UpdatePartnerData
): Promise<void> {
  await updateDocument<PartnerDocument>(COLLECTION_NAME, id, data)
}

async function deletePartner(id: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, id)
}

export async function getActivePartners(): Promise<PartnerDocument[]> {
  return getCollectionDocs<PartnerDocument>(COLLECTION_NAME, [
    where('status', '==', 'Active'),
    orderBy('name'),
  ])
}

export async function getPartnerContributions(
  partnerId: string
): Promise<PartnerContributionDocument[]> {
  return getContributionsByPartnerId(partnerId)
}

export async function getPartnerProfitShares(
  partnerId: string
): Promise<ProfitShareDocument[]> {
  return getProfitSharesByPartnerId(partnerId)
}

export { deletePartner as delete }
