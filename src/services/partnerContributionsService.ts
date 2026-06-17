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
import type { PartnerContribution } from '@/features/partners/data/schema'

const COLLECTION_NAME = 'partner_contributions'
const DELETE_BLOCKED_MESSAGE =
  'This contribution cannot be deleted because related profit share records exist.'

type FirestoreDate = Timestamp | Date | string | null

export interface PartnerContributionDocument {
  id: string
  partner_id: string
  car_id: string
  car_name: string
  contribution_amount: number
  investment_percentage: number
  contribution_date: string
  payment_method: PartnerContribution['paymentMethod']
  notes?: string | null
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export interface ContributionDeleteCheck {
  canDelete: boolean
  references: {
    profitShares: number
  }
}

export type CreatePartnerContributionData = Omit<PartnerContribution, 'id'>
export type UpdatePartnerContributionData =
  Partial<CreatePartnerContributionData>

type ContributionCreateDocumentData = Omit<
  PartnerContributionDocument,
  'id' | 'created_at' | 'updated_at'
> & {
  created_at: FieldValue
  updated_at: FieldValue
}

type ContributionUpdateDocumentData = Partial<
  Omit<PartnerContributionDocument, 'id' | 'created_at' | 'updated_at'>
> & {
  updated_at: FieldValue
}

export class ContributionDeleteBlockedError extends Error {
  references: ContributionDeleteCheck['references']

  constructor(references: ContributionDeleteCheck['references']) {
    super(DELETE_BLOCKED_MESSAGE)
    this.name = 'ContributionDeleteBlockedError'
    this.references = references
  }
}

function normalizeText(value?: string | null) {
  if (value === undefined) return undefined
  if (value === null) return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function mapContributionSnapshot(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): PartnerContribution {
  const data = snapshot.data() as PartnerContributionDocument

  return {
    id: snapshot.id,
    partnerId: data.partner_id,
    carId: data.car_id,
    carName: data.car_name,
    contributionAmount: data.contribution_amount,
    investmentPercentage: data.investment_percentage,
    contributionDate: data.contribution_date,
    paymentMethod: data.payment_method,
    notes: data.notes ?? '',
  }
}

function toCreateDocumentData(
  data: CreatePartnerContributionData
): ContributionCreateDocumentData {
  return {
    partner_id: data.partnerId,
    car_id: data.carId,
    car_name: data.carName,
    contribution_amount: data.contributionAmount,
    investment_percentage: data.investmentPercentage,
    contribution_date: data.contributionDate,
    payment_method: data.paymentMethod,
    notes: normalizeText(data.notes),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }
}

function toUpdateDocumentData(
  data: UpdatePartnerContributionData
): ContributionUpdateDocumentData {
  const documentData: ContributionUpdateDocumentData = {
    updated_at: serverTimestamp(),
  }

  if (data.partnerId !== undefined) documentData.partner_id = data.partnerId
  if (data.carId !== undefined) documentData.car_id = data.carId
  if (data.carName !== undefined) documentData.car_name = data.carName
  if (data.contributionAmount !== undefined) {
    documentData.contribution_amount = data.contributionAmount
  }
  if (data.investmentPercentage !== undefined) {
    documentData.investment_percentage = data.investmentPercentage
  }
  if (data.contributionDate !== undefined) {
    documentData.contribution_date = data.contributionDate
  }
  if (data.paymentMethod !== undefined) {
    documentData.payment_method = data.paymentMethod
  }
  if (data.notes !== undefined) documentData.notes = normalizeText(data.notes)

  return documentData
}

export async function getPartnerContributions(): Promise<
  PartnerContribution[]
> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), orderBy('contribution_date', 'desc'))
  )

  return snapshot.docs.map(mapContributionSnapshot)
}

export async function getContributionById(
  id: string
): Promise<PartnerContribution | null> {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))

  return snapshot.exists() ? mapContributionSnapshot(snapshot) : null
}

export async function getContributionsByPartnerId(
  partnerId: string
): Promise<PartnerContribution[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('partner_id', '==', partnerId),
      orderBy('contribution_date', 'desc')
    )
  )

  return snapshot.docs.map(mapContributionSnapshot)
}

export async function getContributionsByCarId(
  carId: string
): Promise<PartnerContribution[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('car_id', '==', carId),
      orderBy('contribution_date', 'desc')
    )
  )

  return snapshot.docs.map(mapContributionSnapshot)
}

export async function createContribution(
  data: CreatePartnerContributionData
): Promise<PartnerContribution> {
  const docRef = await addDoc(
    collection(db, COLLECTION_NAME),
    toCreateDocumentData(data)
  )
  await updateDoc(docRef, { id: docRef.id })

  const created = await getContributionById(docRef.id)
  if (!created) throw new Error('Failed to save contribution.')

  return created
}

export async function updateContribution(
  id: string,
  data: UpdatePartnerContributionData
): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, id), toUpdateDocumentData(data))
}

export async function canDeleteContribution(
  id: string
): Promise<ContributionDeleteCheck> {
  const contribution = await getContributionById(id)

  if (!contribution) {
    return {
      canDelete: false,
      references: { profitShares: 0 },
    }
  }

  const snapshot = await getDocs(
    query(
      collection(db, 'profit_shares'),
      where('partner_id', '==', contribution.partnerId),
      where('car_id', '==', contribution.carId)
    )
  )
  const references = { profitShares: snapshot.size }

  return {
    canDelete: references.profitShares === 0,
    references,
  }
}

export async function deleteContribution(id: string): Promise<void> {
  const deleteCheck = await canDeleteContribution(id)

  if (!deleteCheck.canDelete) {
    throw new ContributionDeleteBlockedError(deleteCheck.references)
  }

  await deleteDoc(doc(db, COLLECTION_NAME, id))
}

export { getPartnerContributions as getAll, getContributionById as getById }
export { createContribution as create, updateContribution as update }
export { deleteContribution as delete }
