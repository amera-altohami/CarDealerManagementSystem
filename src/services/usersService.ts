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
import type {
  ManagedUser,
  UserManagementFormValues,
} from '@/features/users/data/schema'
import { createActivityLog } from './activityLogsService'

const COLLECTION_NAME = 'managed_users'
const PROTECTED_DELETE_MESSAGE = 'This protected user cannot be deleted.'
const RELATED_DELETE_MESSAGE =
  'This user cannot be deleted because related activity records exist. Disable the user instead of deleting to preserve historical records.'
const ACTIVITY_LOG_ACTOR: {
  role: ManagedUser['role']
  userId: string
  userName: string
} = {
  userId: 'system',
  userName: 'System',
  role: 'Admin',
}

type FirestoreDate = Timestamp | Date | string | null

export interface ManagedUserDocument {
  id: string
  full_name: string
  email: string
  phone?: string | null
  role: ManagedUser['role']
  status: ManagedUser['status']
  is_protected?: boolean
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
  last_login?: FirestoreDate
}

export type CreateUserData = UserManagementFormValues
export type UpdateUserData = Partial<UserManagementFormValues>

export type UserReferences = {
  activityLogs: number
  notifications: number
  titleHistory: number
}

export type UserDeleteCheck = {
  canDelete: boolean
  exists: boolean
  isProtected: boolean
  references: UserReferences
}

type ManagedUserCreateDocumentData = Omit<
  ManagedUserDocument,
  'id' | 'created_at' | 'updated_at' | 'last_login'
> & {
  created_at: FieldValue
  updated_at: FieldValue
  last_login: null
}

type ManagedUserUpdateDocumentData = Partial<
  Omit<ManagedUserDocument, 'id' | 'created_at' | 'updated_at'>
> & {
  updated_at: FieldValue
}

export class ProtectedUserDeleteError extends Error {
  constructor() {
    super(PROTECTED_DELETE_MESSAGE)
    this.name = 'ProtectedUserDeleteError'
  }
}

export class UserDeleteBlockedError extends Error {
  references: UserReferences

  constructor(references: UserReferences) {
    super(RELATED_DELETE_MESSAGE)
    this.name = 'UserDeleteBlockedError'
    this.references = references
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('User was not found.')
    this.name = 'UserNotFoundError'
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

function mapUserSnapshot(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): ManagedUser {
  const data = {
    id: snapshot.id,
    ...(snapshot.data() as Omit<ManagedUserDocument, 'id'>),
  } as ManagedUserDocument

  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone ?? '',
    role: data.role,
    status: data.status,
    isProtected: data.is_protected ?? false,
    createdAt: dateToString(data.created_at),
    lastLogin: dateToString(data.last_login) || 'Never',
  }
}

function toCreateDocumentData(
  data: CreateUserData
): ManagedUserCreateDocumentData {
  return {
    full_name: data.fullName.trim(),
    email: data.email.trim(),
    phone: normalizeText(data.phone),
    role: data.role,
    status: data.status,
    is_protected: false,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    last_login: null,
  }
}

function toUpdateDocumentData(
  data: UpdateUserData
): ManagedUserUpdateDocumentData {
  const documentData: ManagedUserUpdateDocumentData = {
    updated_at: serverTimestamp(),
  }

  if (data.fullName !== undefined) {
    documentData.full_name = data.fullName.trim()
  }

  if (data.email !== undefined) {
    documentData.email = data.email.trim()
  }

  if (data.phone !== undefined) {
    documentData.phone = normalizeText(data.phone)
  }

  if (data.role !== undefined) {
    documentData.role = data.role
  }

  if (data.status !== undefined) {
    documentData.status = data.status
  }

  return documentData
}

async function writeUserActivityLog(
  action: 'Create' | 'Update' | 'Delete',
  user: ManagedUser,
  description: string
) {
  try {
    await createActivityLog({
      userId: ACTIVITY_LOG_ACTOR.userId,
      userName: ACTIVITY_LOG_ACTOR.userName,
      userRole: ACTIVITY_LOG_ACTOR.role,
      action,
      module: 'Users',
      entityType: 'user',
      entityName: user.fullName,
      description,
      changedFields: null,
      ipAddress: '127.0.0.1',
    })
  } catch {
    // Activity logging should not block the primary user action.
  }
}

async function getActivityLogReferenceCount(user: ManagedUser) {
  const snapshot = await getDocs(
    query(collection(db, 'activity_logs'), where('user_id', '==', user.id))
  )

  return snapshot.docs.filter((logSnapshot) => {
    const log = logSnapshot.data() as {
      entity_type?: string
      module?: string
    }

    return !(log.module === 'Users' && log.entity_type === 'user')
  }).length
}

async function getReferenceCount(
  collectionName: string,
  fieldName: string,
  value: string
) {
  const snapshot = await getDocs(
    query(collection(db, collectionName), where(fieldName, '==', value))
  )

  return snapshot.size
}

async function getNotificationReferenceCount(user: ManagedUser) {
  const ids = [user.id, user.email].filter(Boolean)
  const counts = await Promise.all(
    ids.map((value) => getReferenceCount('notifications', 'created_by', value))
  )

  return counts.reduce((sum, count) => sum + count, 0)
}

async function getTitleHistoryReferenceCount(user: ManagedUser) {
  const ids = [user.id, user.email, user.fullName].filter(Boolean)
  const counts = await Promise.all(
    ids.map((value) =>
      getReferenceCount('car_title_history', 'updated_by', value)
    )
  )

  return counts.reduce((sum, count) => sum + count, 0)
}

export async function getUsers(): Promise<ManagedUser[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc'))
  )

  return snapshot.docs.map(mapUserSnapshot)
}

export async function getUserById(id: string): Promise<ManagedUser | null> {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))

  return snapshot.exists() ? mapUserSnapshot(snapshot) : null
}

export async function createUser(data: CreateUserData): Promise<ManagedUser> {
  const docRef = await addDoc(
    collection(db, COLLECTION_NAME),
    toCreateDocumentData(data)
  )

  await updateDoc(docRef, { id: docRef.id })

  const created = await getUserById(docRef.id)

  if (!created) {
    throw new Error('Failed to save user.')
  }

  await writeUserActivityLog(
    'Create',
    created,
    `Created user ${created.fullName}`
  )

  return created
}

export async function updateUser(
  id: string,
  data: UpdateUserData
): Promise<void> {
  const existingUser = await getUserById(id)

  if (!existingUser) {
    throw new UserNotFoundError()
  }

  await updateDoc(doc(db, COLLECTION_NAME, id), toUpdateDocumentData(data))
  await writeUserActivityLog(
    'Update',
    { ...existingUser, ...data },
    `Updated user ${data.fullName ?? existingUser.fullName}`
  )
}

export async function disableUser(id: string): Promise<void> {
  const user = await getUserById(id)

  if (!user) {
    throw new UserNotFoundError()
  }

  await updateDoc(
    doc(db, COLLECTION_NAME, id),
    toUpdateDocumentData({
      status: 'Disabled',
    })
  )
  await writeUserActivityLog('Update', user, `Disabled user ${user.fullName}`)
}

export async function enableUser(id: string): Promise<void> {
  const user = await getUserById(id)

  if (!user) {
    throw new UserNotFoundError()
  }

  await updateDoc(
    doc(db, COLLECTION_NAME, id),
    toUpdateDocumentData({
      status: 'Active',
    })
  )
  await writeUserActivityLog('Update', user, `Enabled user ${user.fullName}`)
}

export async function canDeleteUser(id: string): Promise<UserDeleteCheck> {
  const user = await getUserById(id)
  const emptyReferences: UserReferences = {
    activityLogs: 0,
    notifications: 0,
    titleHistory: 0,
  }

  if (!user) {
    return {
      canDelete: false,
      exists: false,
      isProtected: false,
      references: emptyReferences,
    }
  }

  if (user.isProtected) {
    return {
      canDelete: false,
      exists: true,
      isProtected: true,
      references: emptyReferences,
    }
  }

  const [activityLogs, notifications, titleHistory] = await Promise.all([
    getActivityLogReferenceCount(user),
    getNotificationReferenceCount(user),
    getTitleHistoryReferenceCount(user),
  ])
  const references = {
    activityLogs,
    notifications,
    titleHistory,
  }

  return {
    canDelete: Object.values(references).every((count) => count === 0),
    exists: true,
    isProtected: false,
    references,
  }
}

export async function deleteUser(id: string): Promise<void> {
  const user = await getUserById(id)

  if (!user) {
    throw new UserNotFoundError()
  }

  const deleteCheck = await canDeleteUser(id)

  if (deleteCheck.isProtected) {
    throw new ProtectedUserDeleteError()
  }

  if (!deleteCheck.canDelete) {
    throw new UserDeleteBlockedError(deleteCheck.references)
  }

  await deleteDoc(doc(db, COLLECTION_NAME, id))
  await writeUserActivityLog('Delete', user, `Deleted user ${user.fullName}`)
}

export async function getUsersByRole(
  role: ManagedUser['role']
): Promise<ManagedUser[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('role', '==', role),
      orderBy('created_at', 'desc')
    )
  )

  return snapshot.docs.map(mapUserSnapshot)
}

export async function getActiveUsers(): Promise<ManagedUser[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'Active'),
      orderBy('created_at', 'desc')
    )
  )

  return snapshot.docs.map(mapUserSnapshot)
}

export { createUser as create }
export { deleteUser as delete }
export { getUserById as getById }
export { getUsers as getAll }
export { updateUser as update }
