import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
  type Timestamp,
  type UpdateData as FirestoreUpdateData,
  type WithFieldValue,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type FirestoreDate = Timestamp | Date | string | null
export type FirestoreEntity = { id: string }
export type CreateData<T extends FirestoreEntity> = Omit<T, 'id'>
export type UpdateData<T extends FirestoreEntity> = Partial<CreateData<T>>

export function normalizeDocument<T extends FirestoreEntity>(
  snapshot: DocumentSnapshot<DocumentData>
): T {
  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<T, 'id'>),
  } as T
}

export async function getCollectionDocs<T extends FirestoreEntity>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const collectionQuery = query(collection(db, collectionName), ...constraints)
  const snapshot = await getDocs(collectionQuery)

  return snapshot.docs.map((item) => normalizeDocument<T>(item))
}

export async function getDocumentById<T extends FirestoreEntity>(
  collectionName: string,
  id: string
) {
  const snapshot = await getDoc(doc(db, collectionName, id))

  return snapshot.exists() ? normalizeDocument<T>(snapshot) : null
}

export async function createDocument<T extends FirestoreEntity>(
  collectionName: string,
  data: CreateData<T>
) {
  const docRef = await addDoc(
    collection(db, collectionName),
    data as WithFieldValue<DocumentData>
  )

  return {
    id: docRef.id,
    ...data,
  } as T
}

export async function updateDocument<T extends FirestoreEntity>(
  collectionName: string,
  id: string,
  data: UpdateData<T>
) {
  await updateDoc(
    doc(db, collectionName, id),
    data as FirestoreUpdateData<DocumentData>
  )
}

export async function deleteDocument(collectionName: string, id: string) {
  await deleteDoc(doc(db, collectionName, id))
}
