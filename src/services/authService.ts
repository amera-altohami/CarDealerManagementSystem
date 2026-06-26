import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app'
import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  verifyPasswordResetCode,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth'
import { useAuthStore } from '@/stores/auth-store'
import { auth, firebaseConfig } from '@/lib/firebase'
import type { ManagedUser } from '@/features/users/data/schema'
import { createActivityLog } from './activityLogsService'
import {
  DEFAULT_MANAGED_USER_PASSWORD,
  getByEmail,
  ensureDefaultSuperAdminProfile,
  isDefaultSuperAdmin,
  markLastLogin,
  setMustChangePassword,
} from './usersService'

const RESET_LINK_TTL_WARNING =
  'Firebase controls password reset link validity. This app uses the secure Firebase action-code flow and validates the code before accepting a new password.'
const CURRENT_PASSWORD_INCORRECT_MESSAGE = 'Current password is incorrect.'
const DEFAULT_PASSWORD_REUSE_MESSAGE =
  'New password cannot be the default password.'
const PASSWORD_CHANGE_FAILED_MESSAGE = 'Failed to change password.'
const USER_RECORD_NOT_FOUND_MESSAGE = 'User record not found.'

let authReadyResolve: (() => void) | null = null
let authReadyPromise: Promise<void> | null = null
let listenerStarted = false
let secondaryAppCounter = 0

export class CurrentPasswordIncorrectError extends Error {
  constructor() {
    super(CURRENT_PASSWORD_INCORRECT_MESSAGE)
    this.name = 'CurrentPasswordIncorrectError'
  }
}

export class DefaultPasswordReuseError extends Error {
  constructor() {
    super(DEFAULT_PASSWORD_REUSE_MESSAGE)
    this.name = 'DefaultPasswordReuseError'
  }
}

export class ManagedUserRecordNotFoundError extends Error {
  constructor() {
    super(USER_RECORD_NOT_FOUND_MESSAGE)
    this.name = 'ManagedUserRecordNotFoundError'
  }
}

function ensureReadyPromise() {
  if (!authReadyPromise) {
    authReadyPromise = new Promise<void>((resolve) => {
      authReadyResolve = resolve
    })
  }

  return authReadyPromise
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function getFirebaseErrorCode(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null
  }

  return String((error as { code?: unknown }).code ?? '')
}

function isInvalidCredentialError(error: unknown) {
  return [
    'auth/invalid-credential',
    'auth/user-not-found',
    'auth/wrong-password',
  ].includes(getFirebaseErrorCode(error) ?? '')
}

function createSecondaryAuth(label: string): {
  app: FirebaseApp
  auth: Auth
} {
  secondaryAppCounter += 1
  const secondaryApp = initializeApp(
    firebaseConfig,
    `${label}-${Date.now()}-${secondaryAppCounter}`
  )

  return {
    app: secondaryApp,
    auth: getAuth(secondaryApp),
  }
}

async function disposeSecondaryAuth(app: FirebaseApp, secondaryAuth: Auth) {
  try {
    await signOut(secondaryAuth)
  } catch {
    // The secondary app may never have signed in if Firebase rejected the action.
  }

  await deleteApp(app)
}

function getAuthSignInErrorMessage(error: unknown, email: string) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (
      message.includes('auth/invalid-credential') ||
      message.includes('auth/user-not-found') ||
      message.includes('auth/wrong-password')
    ) {
      return [
        `Unable to sign in with ${normalizeEmail(email)}.`,
        'Make sure this exact email exists in Firebase Authentication for this project, Email/Password sign-in is enabled, and the password is correct.',
      ].join(' ')
    }
  }

  return error instanceof Error ? error.message : 'Unable to sign in.'
}

async function syncSession(firebaseUser: FirebaseUser | null) {
  const store = useAuthStore.getState().auth

  if (!firebaseUser?.email) {
    store.clear()
    return
  }

  const profile = await getByEmail(firebaseUser.email)

  if (!profile || profile.status === 'Disabled') {
    const fallbackProfile = await ensureDefaultSuperAdminProfile(
      firebaseUser.email
    )

    if (fallbackProfile && fallbackProfile.status !== 'Disabled') {
      store.setSession({ firebaseUser, profile: fallbackProfile })
      if (fallbackProfile.lastLogin === 'Never') {
        await markLastLogin(fallbackProfile.id)
      }
      return
    }

    await signOut(auth)
    store.clear()
    return
  }

  store.setSession({ firebaseUser, profile })

  if (profile.lastLogin === 'Never') {
    await markLastLogin(profile.id)
  }
}

export function startAuthObserver() {
  if (listenerStarted) return ensureReadyPromise()
  listenerStarted = true

  const store = useAuthStore.getState().auth
  store.setLoading()

  onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      await syncSession(firebaseUser)
    } finally {
      store.markReady()
      authReadyResolve?.()
      authReadyResolve = null
    }
  })

  return ensureReadyPromise()
}

export function waitForAuthReady() {
  return ensureReadyPromise()
}

export function getCurrentAuthProfile() {
  return useAuthStore.getState().auth.profile
}

export function getCurrentFirebaseUser() {
  return useAuthStore.getState().auth.firebaseUser
}

export async function createAuthUserByAdmin(
  email: string,
  defaultPassword: string
) {
  const { app, auth: secondaryAuth } = createSecondaryAuth('admin-create-user')

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      normalizeEmail(email),
      defaultPassword
    )

    return credential.user.uid
  } finally {
    await disposeSecondaryAuth(app, secondaryAuth)
  }
}

export async function signInWithFirebaseAuth(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email)
  const credential = await signInWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  )
  await syncSession(credential.user)

  const profile = useAuthStore.getState().auth.profile
  if (profile) {
    await createActivityLog({
      userId: profile.id,
      userName: profile.fullName,
      userRole: profile.role,
      action: 'Login',
      module: 'Users',
      entityType: 'auth',
      entityName: profile.fullName,
      description: `User ${profile.fullName} signed in`,
      changedFields: null,
    })
  }

  return credential
}

export async function signOutWithFirebaseAuth() {
  const profile = useAuthStore.getState().auth.profile

  if (profile) {
    await createActivityLog({
      userId: profile.id,
      userName: profile.fullName,
      userRole: profile.role,
      action: 'Logout',
      module: 'Users',
      entityType: 'auth',
      entityName: profile.fullName,
      description: `User ${profile.fullName} signed out`,
      changedFields: null,
    })
  }

  await signOut(auth)
  useAuthStore.getState().auth.clear()
}

export async function changeUserPassword(
  email: string,
  currentPassword: string,
  newPassword: string
) {
  const normalizedEmail = normalizeEmail(email)

  if (newPassword === DEFAULT_MANAGED_USER_PASSWORD) {
    throw new DefaultPasswordReuseError()
  }

  const profile = await getByEmail(normalizedEmail)

  if (!profile) {
    throw new ManagedUserRecordNotFoundError()
  }

  const { app, auth: secondaryAuth } = createSecondaryAuth(
    'default-password-change'
  )

  try {
    const credential = await signInWithEmailAndPassword(
      secondaryAuth,
      normalizedEmail,
      currentPassword
    )
    await updatePassword(credential.user, newPassword)
  } catch (error) {
    if (isInvalidCredentialError(error)) {
      throw new CurrentPasswordIncorrectError()
    }

    throw error
  } finally {
    await disposeSecondaryAuth(app, secondaryAuth)
  }

  await setMustChangePassword(profile.id, false)

  await createActivityLog({
    userId: profile.id,
    userName: profile.fullName,
    userRole: profile.role,
    action: 'Update',
    module: 'Users',
    entityType: 'user',
    entityName: profile.fullName || profile.email,
    description: 'User changed default password',
    changedFields: null,
  })

  if (auth.currentUser?.email) {
    const currentEmail = normalizeEmail(auth.currentUser.email)

    if (currentEmail === normalizedEmail) {
      await signOut(auth)
      useAuthStore.getState().auth.clear()
    }
  }
}

export function getPasswordChangeErrorMessage(error: unknown) {
  if (
    error instanceof CurrentPasswordIncorrectError ||
    error instanceof DefaultPasswordReuseError ||
    error instanceof ManagedUserRecordNotFoundError
  ) {
    return error.message
  }

  if (isInvalidCredentialError(error)) {
    return CURRENT_PASSWORD_INCORRECT_MESSAGE
  }

  return PASSWORD_CHANGE_FAILED_MESSAGE
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = normalizeEmail(email)

  await sendPasswordResetEmail(auth, normalizedEmail, {
    url: `${window.location.origin}/reset-password`,
    handleCodeInApp: true,
  })

  const profile = await getByEmail(normalizedEmail)
  if (profile) {
    await createActivityLog({
      userId: profile.id,
      userName: profile.fullName,
      userRole: profile.role,
      action: 'Update',
      module: 'Users',
      entityType: 'auth',
      entityName: profile.fullName,
      description: `Password reset requested for ${profile.fullName}`,
      changedFields: null,
    })
  }

  return RESET_LINK_TTL_WARNING
}

export async function canApplyPasswordReset(code: string) {
  return verifyPasswordResetCode(auth, code)
}

export async function applyPasswordReset(code: string, newPassword: string) {
  await confirmPasswordReset(auth, code, newPassword)
}

export function isProtectedSuperAdmin(user?: Pick<ManagedUser, 'id' | 'role'>) {
  if (!user) return false
  return isDefaultSuperAdmin(user)
}

export const loginWithEmailPassword = signInWithFirebaseAuth
export const getCurrentUser = getCurrentFirebaseUser
export const logout = signOutWithFirebaseAuth

export { getAuthSignInErrorMessage }
