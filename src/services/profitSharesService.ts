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
import type { ProfitShare } from '@/features/partners/data/schema'

const COLLECTION_NAME = 'profit_shares'

type FirestoreDate = Timestamp | Date | string | null

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

export type CreateProfitShareData = Omit<ProfitShare, 'id'>
export type UpdateProfitShareData = Partial<CreateProfitShareData>

type ProfitShareCreateDocumentData = Omit<
  ProfitShareDocument,
  'id' | 'created_at' | 'updated_at'
> & {
  created_at: FieldValue
  updated_at: FieldValue
}

type ProfitShareUpdateDocumentData = Partial<
  Omit<ProfitShareDocument, 'id' | 'created_at' | 'updated_at'>
> & {
  updated_at: FieldValue
}

function mapProfitShareSnapshot(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): ProfitShare {
  const data = snapshot.data() as ProfitShareDocument

  return {
    id: snapshot.id,
    partnerId: data.partner_id,
    carId: data.car_id,
    carName: data.car_name,
    carCost: data.car_cost,
    sellingPrice: data.selling_price,
    netProfit: data.net_profit,
    partnerPercentage: data.partner_percentage,
    partnerProfitShare: data.partner_profit_share,
    status: data.status,
  }
}

function toCreateDocumentData(
  data: CreateProfitShareData
): ProfitShareCreateDocumentData {
  return {
    partner_id: data.partnerId,
    car_id: data.carId,
    car_name: data.carName,
    car_cost: data.carCost,
    selling_price: data.sellingPrice,
    net_profit: data.netProfit,
    partner_percentage: data.partnerPercentage,
    partner_profit_share: data.partnerProfitShare,
    status: data.status,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }
}

function toUpdateDocumentData(
  data: UpdateProfitShareData
): ProfitShareUpdateDocumentData {
  const documentData: ProfitShareUpdateDocumentData = {
    updated_at: serverTimestamp(),
  }

  if (data.partnerId !== undefined) documentData.partner_id = data.partnerId
  if (data.carId !== undefined) documentData.car_id = data.carId
  if (data.carName !== undefined) documentData.car_name = data.carName
  if (data.carCost !== undefined) documentData.car_cost = data.carCost
  if (data.sellingPrice !== undefined) {
    documentData.selling_price = data.sellingPrice
  }
  if (data.netProfit !== undefined) documentData.net_profit = data.netProfit
  if (data.partnerPercentage !== undefined) {
    documentData.partner_percentage = data.partnerPercentage
  }
  if (data.partnerProfitShare !== undefined) {
    documentData.partner_profit_share = data.partnerProfitShare
  }
  if (data.status !== undefined) documentData.status = data.status

  return documentData
}

export async function getProfitShares(): Promise<ProfitShare[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc'))
  )

  return snapshot.docs.map(mapProfitShareSnapshot)
}

export async function getProfitShareById(
  id: string
): Promise<ProfitShare | null> {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))

  return snapshot.exists() ? mapProfitShareSnapshot(snapshot) : null
}

export async function getProfitSharesByPartnerId(
  partnerId: string
): Promise<ProfitShare[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('partner_id', '==', partnerId),
      orderBy('created_at', 'desc')
    )
  )

  return snapshot.docs.map(mapProfitShareSnapshot)
}

export async function getProfitSharesByCarId(
  carId: string
): Promise<ProfitShare[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('car_id', '==', carId),
      orderBy('created_at', 'desc')
    )
  )

  return snapshot.docs.map(mapProfitShareSnapshot)
}

export async function createProfitShare(
  data: CreateProfitShareData
): Promise<ProfitShare> {
  const docRef = await addDoc(
    collection(db, COLLECTION_NAME),
    toCreateDocumentData(data)
  )
  await updateDoc(docRef, { id: docRef.id })

  const created = await getProfitShareById(docRef.id)
  if (!created) throw new Error('Failed to save profit share.')

  return created
}

export async function updateProfitShare(
  id: string,
  data: UpdateProfitShareData
): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, id), toUpdateDocumentData(data))
}

export async function deleteProfitShare(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id))
}

export { getProfitShares as getAll, getProfitShareById as getById }
export { createProfitShare as create, updateProfitShare as update }
export { deleteProfitShare as delete }
