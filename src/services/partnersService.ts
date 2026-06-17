import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type FieldValue,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Partner } from '@/features/partners/data/schema'
import { getContributionsByPartnerId } from './partnerContributionsService'
import { getProfitSharesByPartnerId } from './profitSharesService'

const COLLECTION_NAME = 'partners'
const DELETE_BLOCKED_MESSAGE =
  'This partner cannot be deleted because related investment records exist.'

type FirestoreDate = Timestamp | Date | string | null

export interface PartnerDocument {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  status: Partner['status']
  notes?: string | null
  investment_percentage: number
  total_contribution: number
  total_profit: number
  total_loss: number
  final_balance: number
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export interface PartnerReferences {
  contributions: number
  profitShares: number
}

export interface PartnerDeleteCheck {
  canDelete: boolean
  references: PartnerReferences
}

export type CreatePartnerData = Pick<
  Partner,
  'name' | 'email' | 'phone' | 'status' | 'notes'
>
export type UpdatePartnerData = Partial<CreatePartnerData> &
  Partial<
    Pick<
      Partner,
      | 'investmentPercentage'
      | 'totalContribution'
      | 'totalProfit'
      | 'totalLoss'
      | 'finalBalance'
    >
  >

type PartnerCreateDocumentData = Omit<
  PartnerDocument,
  'id' | 'created_at' | 'updated_at'
> & {
  created_at: FieldValue
  updated_at: FieldValue
}

type PartnerUpdateDocumentData = Partial<
  Omit<PartnerDocument, 'id' | 'created_at' | 'updated_at'>
> & {
  updated_at: FieldValue
}

export class PartnerDeleteBlockedError extends Error {
  references: PartnerReferences

  constructor(references: PartnerReferences) {
    super(DELETE_BLOCKED_MESSAGE)
    this.name = 'PartnerDeleteBlockedError'
    this.references = references
  }
}

function normalizeText(value?: string | null) {
  if (value === undefined) return undefined
  if (value === null) return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function dateToString(value?: FirestoreDate) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return value.toDate().toISOString().slice(0, 10)
}

function mapPartnerSnapshot(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): Partner {
  const data = snapshot.data() as PartnerDocument

  return {
    id: snapshot.id,
    name: data.name,
    email: data.email ?? '',
    phone: data.phone ?? '',
    investmentPercentage: data.investment_percentage ?? 0,
    totalContribution: data.total_contribution ?? 0,
    totalProfit: data.total_profit ?? 0,
    totalLoss: data.total_loss ?? 0,
    finalBalance: data.final_balance ?? 0,
    status: data.status,
    notes: data.notes ?? '',
    createdAt: dateToString(data.created_at),
  }
}

function toCreateDocumentData(
  data: CreatePartnerData
): PartnerCreateDocumentData {
  return {
    name: data.name.trim(),
    email: normalizeText(data.email),
    phone: normalizeText(data.phone),
    status: data.status,
    notes: normalizeText(data.notes),
    investment_percentage: 0,
    total_contribution: 0,
    total_profit: 0,
    total_loss: 0,
    final_balance: 0,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }
}

function toUpdateDocumentData(
  data: UpdatePartnerData
): PartnerUpdateDocumentData {
  const documentData: PartnerUpdateDocumentData = {
    updated_at: serverTimestamp(),
  }

  if (data.name !== undefined) documentData.name = data.name.trim()
  if (data.email !== undefined) documentData.email = normalizeText(data.email)
  if (data.phone !== undefined) documentData.phone = normalizeText(data.phone)
  if (data.status !== undefined) documentData.status = data.status
  if (data.notes !== undefined) documentData.notes = normalizeText(data.notes)
  if (data.investmentPercentage !== undefined) {
    documentData.investment_percentage = data.investmentPercentage
  }
  if (data.totalContribution !== undefined) {
    documentData.total_contribution = data.totalContribution
  }
  if (data.totalProfit !== undefined)
    documentData.total_profit = data.totalProfit
  if (data.totalLoss !== undefined) documentData.total_loss = data.totalLoss
  if (data.finalBalance !== undefined) {
    documentData.final_balance = data.finalBalance
  }

  return documentData
}

async function getReferenceCount(
  collectionName: string,
  fieldName: string,
  partnerId: string
) {
  const snapshot = await getDocs(
    query(collection(db, collectionName), where(fieldName, '==', partnerId))
  )

  return snapshot.size
}

export async function getPartners(): Promise<Partner[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), orderBy('name'))
  )

  return snapshot.docs.map(mapPartnerSnapshot)
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))

  return snapshot.exists() ? mapPartnerSnapshot(snapshot) : null
}

export async function createPartner(data: CreatePartnerData): Promise<Partner> {
  const docRef = await addDoc(
    collection(db, COLLECTION_NAME),
    toCreateDocumentData(data)
  )
  await updateDoc(docRef, { id: docRef.id })

  const created = await getPartnerById(docRef.id)
  if (!created) throw new Error('Failed to save partner.')

  return created
}

export async function updatePartner(
  id: string,
  data: UpdatePartnerData
): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, id), toUpdateDocumentData(data))
}

export async function canDeletePartner(
  id: string
): Promise<PartnerDeleteCheck> {
  const [contributions, profitShares] = await Promise.all([
    getReferenceCount('partner_contributions', 'partner_id', id),
    getReferenceCount('profit_shares', 'partner_id', id),
  ])
  const references = { contributions, profitShares }

  return {
    canDelete: contributions + profitShares === 0,
    references,
  }
}

export async function deletePartner(id: string): Promise<void> {
  const deleteCheck = await canDeletePartner(id)

  if (!deleteCheck.canDelete) {
    throw new PartnerDeleteBlockedError(deleteCheck.references)
  }

  await deleteDoc(doc(db, COLLECTION_NAME, id))
}

export async function getActivePartners(): Promise<Partner[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'Active'),
      orderBy('name')
    )
  )

  return snapshot.docs.map(mapPartnerSnapshot)
}

export async function getPartnerContributions(partnerId: string) {
  return getContributionsByPartnerId(partnerId)
}

export async function getPartnerProfitShares(partnerId: string) {
  return getProfitSharesByPartnerId(partnerId)
}

export { getPartners as getAll, getPartnerById as getById }
export { createPartner as create, updatePartner as update }
export { deletePartner as delete }
