import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type FieldValue,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth-store'
import { db } from '@/lib/firebase'
import type {
  ManagedUser,
  UserManagementFormValues,
} from '@/features/users/data/schema'
import { createActivityLog } from './activityLogsService'

const COLLECTION_NAME = 'managed_users'
export const DEFAULT_MANAGED_USER_PASSWORD = 'CarLotE@2026!Adm1n'
export const DEFAULT_SUPER_ADMIN_EMAIL = 'car.d.d.admin@gmail.com'
const DEFAULT_SUPER_ADMIN_ID = 'admin-default'
const DEFAULT_SUPER_ADMIN_NAME = 'Admin'
const PROTECTED_DELETE_MESSAGE = 'This protected user cannot be deleted.'
const DUPLICATE_EMAIL_MESSAGE = 'A user with this email already exists.'
const RELATED_DELETE_MESSAGE =
  'This user cannot be deleted because related activity records exist. Disable the user instead of deleting to preserve historical records.'
const LEGACY_ROLE_MAP: Record<string, ManagedUser['role']> = {
  superadmin: 'SUPER_ADMIN',
  'super admin': 'SUPER_ADMIN',
  admin: 'ADMIN',
  manager: 'ADMIN',
  accountant: 'USER',
  sales: 'USER',
  cashier: 'USER',
  viewer: 'USER',
  user: 'USER',
}
const ACTIVITY_LOG_ACTOR: {
  role: ManagedUser['role']
  userId: string
  userName: string
} = {
  userId: 'system',
  userName: 'System',
  role: 'SUPER_ADMIN',
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
  must_change_password?: boolean
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

export class UserEmailExistsError extends Error {
  constructor() {
    super(DUPLICATE_EMAIL_MESSAGE)
    this.name = 'UserEmailExistsError'
  }
}

function normalizeText(value?: string | null) {
  if (value === undefined) return undefined
  if (value === null) return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizeRole(role: string): ManagedUser['role'] {
  const normalized = role.trim().replace(/\s+/g, ' ').toLowerCase()

  return LEGACY_ROLE_MAP[normalized] ?? (role as ManagedUser['role'])
}

function isEmailAlreadyInUseError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'auth/email-already-in-use'
  )
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
    role: normalizeRole(data.role),
    status: data.status,
    isProtected: data.is_protected ?? false,
    mustChangePassword: data.must_change_password ?? false,
    createdAt: dateToString(data.created_at),
    lastLogin: dateToString(data.last_login) || 'Never',
  }
}

function toCreateDocumentData(
  data: CreateUserData,
  mustChangePassword = false
): ManagedUserCreateDocumentData {
  return {
    full_name: data.fullName.trim(),
    email: normalizeEmail(data.email),
    phone: normalizeText(data.phone),
    role: normalizeRole(data.role),
    status: data.status,
    is_protected: false,
    must_change_password: mustChangePassword,
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
    documentData.email = normalizeEmail(data.email)
  }

  if (data.phone !== undefined) {
    documentData.phone = normalizeText(data.phone)
  }

  if (data.role !== undefined) {
    documentData.role = normalizeRole(data.role)
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
  const actor = useAuthStore.getState().auth.profile
  const actorId = actor?.id ?? ACTIVITY_LOG_ACTOR.userId
  const actorName = actor?.fullName ?? ACTIVITY_LOG_ACTOR.userName
  const actorRole = actor?.role ?? ACTIVITY_LOG_ACTOR.role

  try {
    await createActivityLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action,
      module: 'Users',
      entityType: 'user',
      entityName: user.fullName || user.email,
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

  await Promise.all(
    snapshot.docs
      .filter((userSnapshot) => {
        const data = userSnapshot.data() as ManagedUserDocument
        return normalizeRole(data.role) !== data.role
      })
      .map((userSnapshot) =>
        updateDoc(doc(db, COLLECTION_NAME, userSnapshot.id), {
          role: normalizeRole(
            (userSnapshot.data() as ManagedUserDocument).role
          ),
          updated_at: serverTimestamp(),
        })
      )
  )

  return snapshot.docs.map(mapUserSnapshot)
}

export async function getUserById(id: string): Promise<ManagedUser | null> {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, id))

  return snapshot.exists() ? mapUserSnapshot(snapshot) : null
}

export async function getUserByEmail(
  email: string
): Promise<ManagedUser | null> {
  const normalizedEmail = normalizeEmail(email)
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where('email', '==', normalizedEmail)
    )
  )

  return snapshot.docs[0] ? mapUserSnapshot(snapshot.docs[0]) : null
}

export async function userEmailExists(email: string): Promise<boolean> {
  return Boolean(await getUserByEmail(email))
}

export function isDefaultSuperAdmin(user: Pick<ManagedUser, 'id' | 'role'>) {
  return user.id === DEFAULT_SUPER_ADMIN_ID || user.role === 'SUPER_ADMIN'
}

export async function ensureDefaultSuperAdminProfile(
  email: string
): Promise<ManagedUser | null> {
  if (email.trim().toLowerCase() !== DEFAULT_SUPER_ADMIN_EMAIL) {
    return null
  }

  const existingById = await getUserById(DEFAULT_SUPER_ADMIN_ID)

  if (existingById) {
    if (
      existingById.email !== DEFAULT_SUPER_ADMIN_EMAIL ||
      existingById.status !== 'Active' ||
      !existingById.isProtected ||
      existingById.role !== 'SUPER_ADMIN'
    ) {
      await updateDoc(doc(db, COLLECTION_NAME, DEFAULT_SUPER_ADMIN_ID), {
        full_name: DEFAULT_SUPER_ADMIN_NAME,
        email: DEFAULT_SUPER_ADMIN_EMAIL,
        phone: null,
        role: 'SUPER_ADMIN',
        status: 'Active',
        is_protected: true,
        must_change_password: false,
        updated_at: serverTimestamp(),
      })
      return getUserById(DEFAULT_SUPER_ADMIN_ID)
    }

    return existingById
  }

  const existingByEmail = await getUserByEmail(DEFAULT_SUPER_ADMIN_EMAIL)

  if (existingByEmail) {
    return existingByEmail
  }

  const now = serverTimestamp()

  await setDoc(doc(db, COLLECTION_NAME, DEFAULT_SUPER_ADMIN_ID), {
    id: DEFAULT_SUPER_ADMIN_ID,
    full_name: DEFAULT_SUPER_ADMIN_NAME,
    email: DEFAULT_SUPER_ADMIN_EMAIL,
    phone: null,
    role: 'SUPER_ADMIN',
    status: 'Active',
    is_protected: true,
    must_change_password: false,
    created_at: now,
    updated_at: now,
    last_login: now,
  })

  return getUserById(DEFAULT_SUPER_ADMIN_ID)
}

export async function createManagedUser(
  data: CreateUserData,
  options: {
    id?: string
    mustChangePassword?: boolean
  } = {}
): Promise<ManagedUser> {
  if (options.id) {
    await setDoc(doc(db, COLLECTION_NAME, options.id), {
      id: options.id,
      ...toCreateDocumentData(data, options.mustChangePassword ?? false),
    })

    const created = await getUserById(options.id)

    if (!created) {
      throw new Error('Failed to save user.')
    }

    return created
  }

  const docRef = await addDoc(
    collection(db, COLLECTION_NAME),
    toCreateDocumentData(data, options.mustChangePassword ?? false)
  )

  await updateDoc(docRef, { id: docRef.id })

  const created = await getUserById(docRef.id)

  if (!created) {
    throw new Error('Failed to save user.')
  }

  return created
}

export async function createUser(data: CreateUserData): Promise<ManagedUser> {
  const normalizedEmail = normalizeEmail(data.email)

  if (await userEmailExists(normalizedEmail)) {
    throw new UserEmailExistsError()
  }

  const { createAuthUserByAdmin } = await import('./authService')
  let authUserId: string

  try {
    authUserId = await createAuthUserByAdmin(
      normalizedEmail,
      DEFAULT_MANAGED_USER_PASSWORD
    )
  } catch (error) {
    if (isEmailAlreadyInUseError(error)) {
      throw new UserEmailExistsError()
    }

    throw error
  }

  const created = await createManagedUser(
    { ...data, email: normalizedEmail },
    { id: authUserId, mustChangePassword: true }
  )

  await writeUserActivityLog(
    'Create',
    created,
    'Admin created a new user account'
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

export async function updateManagedUser(
  id: string,
  data: UpdateUserData
): Promise<void> {
  return updateUser(id, data)
}

export async function setMustChangePassword(
  userId: string,
  value: boolean
): Promise<void> {
  const existingUser = await getUserById(userId)

  if (!existingUser) {
    throw new UserNotFoundError()
  }

  await updateDoc(doc(db, COLLECTION_NAME, userId), {
    must_change_password: value,
    updated_at: serverTimestamp(),
  })
}

export async function markLastLogin(id: string): Promise<void> {
  const existingUser = await getUserById(id)

  if (!existingUser) {
    throw new UserNotFoundError()
  }

  await updateDoc(doc(db, COLLECTION_NAME, id), {
    last_login: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
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
export { getUserByEmail as getByEmail }
export { getUsers as getAll }
export { updateUser as update }
export { updateManagedUser as updateManaged }
