import {
  confirmPasswordReset,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  verifyPasswordResetCode,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth-store'
import type { ManagedUser } from '@/features/users/data/schema'
import {
  getByEmail,
  ensureDefaultSuperAdminProfile,
  isDefaultSuperAdmin,
  markLastLogin,
} from './usersService'
import { createActivityLog } from './activityLogsService'

const RESET_LINK_TTL_WARNING =
  'Firebase controls password reset link validity. This app uses the secure Firebase action-code flow and validates the code before accepting a new password.'

let authReadyResolve: (() => void) | null = null
let authReadyPromise: Promise<void> | null = null
let listenerStarted = false

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

export { getAuthSignInErrorMessage }
