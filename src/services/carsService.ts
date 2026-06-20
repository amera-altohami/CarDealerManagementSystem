import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
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
import type { TitleType } from '@/features/cars/types/title'

const COLLECTION_NAME = 'cars'
const DEFAULT_CAR_PHOTO = '/images/car-placeholder.svg'
const DELETE_BLOCKED_MESSAGE =
  'This car cannot be deleted because related records exist.'

type FirestoreDate = Timestamp | Date | string | null

export type CarStatus =
  | 'purchased'
  | 'shipping'
  | 'repairing'
  | 'ready-for-sale'
  | 'sold'

export type CarTitleType = TitleType
export type CarfaxType = 'link' | 'pdf'

export function getNormalizedCarTitleTypeForStatus(
  status: CarStatus,
  currentTitleType: CarTitleType = 'Clean'
): CarTitleType {
  void status
  return currentTitleType
}

export const carStatusOptions: Array<{ value: CarStatus; label: string }> = [
  { value: 'purchased', label: 'Purchased' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'repairing', label: 'Repairing' },
  { value: 'ready-for-sale', label: 'Ready For Sale' },
  { value: 'sold', label: 'Sold' },
]

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
  carfax_type: CarfaxType
  carfax_link?: string | null
  carfax_pdf_name?: string | null
  carfax_pdf_url?: string | null
  notes?: string | null
  photo_url?: string | null
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export interface Car extends CarDocument {
  lotNumber: string
  titleType: CarTitleType
  currentTitleType: CarTitleType
  titleLastUpdatedAt: string
  titleUpdatedBy: string
  purchaseDate: string
  purchasePrice: number
  sellingPrice: number
  purchasePlace: string
  purchasePlaceId: string
  carfaxType: CarfaxType
  carfaxLink: string
  carfaxPdfName: string
  carfaxPdfUrl: string
  photo: string
  createdAt?: FirestoreDate
  updatedAt?: FirestoreDate
}

export interface CarReferences {
  activityLogs: number
  expenses: number
  parts: number
  inspections: number
  partnerContributions: number
  profitShares: number
  notifications: number
  titleHistory: number
}

export interface CarDeleteCheck {
  canDelete: boolean
  references: CarReferences
}

export type CreateCarData = {
  brand: string
  model: string
  year: number
  vin: string
  lotNumber: string
  status: CarStatus
  titleType: CarTitleType
  purchaseDate: string
  purchasePrice: number
  sellingPrice: number
  purchasePlace: string
  carfaxType: CarfaxType
  carfaxLink?: string
  carfaxPdfName?: string
  carfaxPdfUrl?: string
  notes?: string
  photo?: string
}

export type UpdateCarData = Partial<CreateCarData>

type CarCreateDocumentData = Omit<
  CarDocument,
  'id' | 'created_at' | 'updated_at'
> & {
  created_at: FieldValue
  updated_at: FieldValue
}

type CarUpdateDocumentData = Partial<
  Omit<CarDocument, 'id' | 'created_at' | 'updated_at'>
> & {
  updated_at: FieldValue
}

export class CarDeleteBlockedError extends Error {
  references: CarReferences

  constructor(references: CarReferences) {
    super(DELETE_BLOCKED_MESSAGE)
    this.name = 'CarDeleteBlockedError'
    this.references = references
  }
}

function normalizeText(value?: string | null) {
  if (value === undefined) return undefined
  if (value === null) return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeOptionalText(value?: string | null) {
  return normalizeText(value) ?? ''
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function mapCarSnapshot(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): Car {
  const data = {
    id: snapshot.id,
    ...(snapshot.data() as Omit<CarDocument, 'id'>),
  } as CarDocument

  const carfaxLink = normalizeOptionalText(data.carfax_link)
  const carfaxPdfName = normalizeOptionalText(data.carfax_pdf_name)
  const carfaxPdfUrl = normalizeOptionalText(data.carfax_pdf_url)
  const photo = normalizeOptionalText(data.photo_url) || DEFAULT_CAR_PHOTO
  const currentTitleType = data.current_title_type ?? data.title_type ?? 'Clean'

  return {
    ...data,
    lotNumber: data.lot_number,
    titleType: data.title_type ?? currentTitleType,
    currentTitleType,
    titleLastUpdatedAt: data.title_last_updated_at,
    titleUpdatedBy: data.title_updated_by,
    purchaseDate: data.purchase_date,
    purchasePrice: data.purchase_price,
    sellingPrice: data.selling_price,
    purchasePlace: data.purchase_place_id,
    purchasePlaceId: data.purchase_place_id,
    carfaxType: data.carfax_type,
    carfaxLink,
    carfaxPdfName,
    carfaxPdfUrl,
    photo,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function toCreateDocumentData(data: CreateCarData): CarCreateDocumentData {
  const titleDate = data.purchaseDate || getToday()

  return {
    brand: data.brand.trim(),
    model: data.model.trim(),
    year: data.year,
    vin: data.vin.trim(),
    lot_number: data.lotNumber.trim(),
    status: data.status,
    title_type: data.titleType,
    current_title_type: data.titleType,
    title_last_updated_at: titleDate,
    title_updated_by: 'System',
    purchase_date: data.purchaseDate,
    purchase_price: data.purchasePrice,
    selling_price: data.sellingPrice,
    purchase_place_id: data.purchasePlace,
    carfax_type: data.carfaxType,
    carfax_link:
      data.carfaxType === 'link' ? normalizeText(data.carfaxLink) : null,
    carfax_pdf_name:
      data.carfaxType === 'pdf' ? normalizeText(data.carfaxPdfName) : null,
    carfax_pdf_url:
      data.carfaxType === 'pdf' ? normalizeText(data.carfaxPdfUrl) : null,
    notes: normalizeText(data.notes),
    photo_url: normalizeText(data.photo) ?? DEFAULT_CAR_PHOTO,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }
}

function toUpdateDocumentData(data: UpdateCarData): CarUpdateDocumentData {
  const documentData: CarUpdateDocumentData = {
    updated_at: serverTimestamp(),
  }

  if (data.brand !== undefined) {
    documentData.brand = data.brand.trim()
  }

  if (data.model !== undefined) {
    documentData.model = data.model.trim()
  }

  if (data.year !== undefined) {
    documentData.year = data.year
  }

  if (data.vin !== undefined) {
    documentData.vin = data.vin.trim()
  }

  if (data.lotNumber !== undefined) {
    documentData.lot_number = data.lotNumber.trim()
  }

  if (data.status !== undefined) {
    documentData.status = data.status
  }

  if (data.titleType !== undefined) {
    documentData.title_type = data.titleType
    documentData.current_title_type = data.titleType
    documentData.title_last_updated_at = getToday()
    documentData.title_updated_by = 'System'
  }

  if (data.purchaseDate !== undefined) {
    documentData.purchase_date = data.purchaseDate
  }

  if (data.purchasePrice !== undefined) {
    documentData.purchase_price = data.purchasePrice
  }

  if (data.sellingPrice !== undefined) {
    documentData.selling_price = data.sellingPrice
  }

  if (data.purchasePlace !== undefined) {
    documentData.purchase_place_id = data.purchasePlace
  }

  if (data.carfaxType !== undefined) {
    documentData.carfax_type = data.carfaxType
    documentData.carfax_link =
      data.carfaxType === 'link' ? normalizeText(data.carfaxLink) : null
    documentData.carfax_pdf_name =
      data.carfaxType === 'pdf' ? normalizeText(data.carfaxPdfName) : null
    if (data.carfaxType === 'pdf') {
      if (data.carfaxPdfUrl !== undefined) {
        documentData.carfax_pdf_url = normalizeText(data.carfaxPdfUrl)
      }
    } else {
      documentData.carfax_pdf_url = null
    }
  } else {
    if (data.carfaxLink !== undefined) {
      documentData.carfax_link = normalizeText(data.carfaxLink)
    }

    if (data.carfaxPdfName !== undefined) {
      documentData.carfax_pdf_name = normalizeText(data.carfaxPdfName)
    }

    if (data.carfaxPdfUrl !== undefined) {
      documentData.carfax_pdf_url = normalizeText(data.carfaxPdfUrl)
    }
  }

  if (data.notes !== undefined) {
    documentData.notes = normalizeText(data.notes)
  }

  if (data.photo !== undefined) {
    documentData.photo_url = normalizeText(data.photo) ?? DEFAULT_CAR_PHOTO
  }

  return documentData
}

async function getReferenceCount(
  collectionName: string,
  fieldName: string,
  carId: string
) {
  const snapshot = await getDocs(
    query(collection(db, collectionName), where(fieldName, '==', carId))
  )

  return snapshot.size
}

export async function getCars(): Promise<Car[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), orderBy('purchase_date', 'desc'))
  )

  return snapshot.docs.map(mapCarSnapshot)
}

export async function getCarById(id: string): Promise<Car | null> {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))

  return snapshot.exists() ? mapCarSnapshot(snapshot) : null
}

export async function createCar(data: CreateCarData): Promise<Car> {
  const docRef = await addDoc(
    collection(db, COLLECTION_NAME),
    toCreateDocumentData(data)
  )

  await updateDoc(docRef, { id: docRef.id })

  const created = await getCarById(docRef.id)

  if (!created) {
    throw new Error('Failed to save car.')
  }

  return created
}

export async function updateCar(
  id: string,
  data: UpdateCarData
): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, id), toUpdateDocumentData(data))
}

export async function deleteCar(id: string): Promise<void> {
  const deleteCheck = await canDeleteCar(id)

  if (!deleteCheck.canDelete) {
    throw new CarDeleteBlockedError(deleteCheck.references)
  }

  await deleteDoc(doc(db, COLLECTION_NAME, id))
}

export async function searchCars(searchTerm: string): Promise<Car[]> {
  const search = searchTerm.trim().toLowerCase()
  const cars = await getCars()

  if (!search) {
    return cars
  }

  return cars.filter((car) =>
    [car.brand, car.model, car.vin, car.lotNumber]
      .join(' ')
      .toLowerCase()
      .includes(search)
  )
}

export async function getCarsByStatus(status: CarStatus): Promise<Car[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('status', '==', status),
      orderBy('purchase_date', 'desc')
    )
  )

  return snapshot.docs.map(mapCarSnapshot)
}

export async function canDeleteCar(id: string): Promise<CarDeleteCheck> {
  const carSnapshot = await getDoc(doc(db, COLLECTION_NAME, id))

  if (!carSnapshot.exists()) {
    return {
      canDelete: false,
      references: {
        activityLogs: 0,
        expenses: 0,
        parts: 0,
        inspections: 0,
        partnerContributions: 0,
        profitShares: 0,
        notifications: 0,
        titleHistory: 0,
      },
    }
  }

  const car = carSnapshot.data() as {
    brand?: string
    model?: string
    year?: number
  }
  const carName = [car.brand?.trim(), car.model?.trim(), car.year]
    .filter(Boolean)
    .join(' ')

  const [
    expenses,
    parts,
    inspections,
    partnerContributions,
    profitShares,
    notifications,
    titleHistory,
  ] = await Promise.all([
    getReferenceCount('expenses', 'car_id', id),
    getReferenceCount('parts', 'related_car_id', id),
    getReferenceCount('inspections', 'car_id', id),
    getReferenceCount('partner_contributions', 'car_id', id),
    getReferenceCount('profit_shares', 'car_id', id),
    getReferenceCount('notifications', 'related_car_id', id),
    getReferenceCount('car_title_history', 'car_id', id),
  ])

  const activityLogs = carName
    ? await getCountFromServer(
        query(
          collection(db, 'activity_logs'),
          where('entity_type', '==', 'car'),
          where('entity_name', '==', carName)
        )
      ).then((snapshot) => snapshot.data().count)
    : 0

  const references = {
    activityLogs,
    expenses,
    parts,
    inspections,
    partnerContributions,
    profitShares,
    notifications,
    titleHistory,
  }

  return {
    canDelete: Object.values(references).every((count) => count === 0),
    references,
  }
}

export function formatCarName(car: Pick<Car, 'brand' | 'model' | 'year'>) {
  return `${car.brand} ${car.model} ${car.year}`
}

export { getCars as getAll }
export { deleteCar as delete }
