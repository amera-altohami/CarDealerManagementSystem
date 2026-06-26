import { redirect } from '@tanstack/react-router'
import { getCurrentAuthProfile, waitForAuthReady } from '@/services/authService'
import { isDefaultSuperAdmin } from '@/services/usersService'
import { toast } from 'sonner'
import { type ManagedUser } from '@/features/users/data/schema'

const CHANGE_PASSWORD_PATH = '/change-password'

async function waitForSession() {
  await waitForAuthReady()
  return getCurrentAuthProfile()
}

function isChangePasswordTarget(redirectTo: string) {
  try {
    return (
      new URL(redirectTo, window.location.origin).pathname ===
      CHANGE_PASSWORD_PATH
    )
  } catch {
    return redirectTo.startsWith(CHANGE_PASSWORD_PATH)
  }
}

export async function requireAuthenticated(redirectTo: string) {
  const profile = await waitForSession()

  if (!profile) {
    throw redirect({
      to: '/sign-in',
      search: { redirect: redirectTo },
      replace: true,
    })
  }

  if (profile.mustChangePassword && !isChangePasswordTarget(redirectTo)) {
    toast.warning('Please change your default password before continuing.')
    throw redirect({
      to: CHANGE_PASSWORD_PATH,
      replace: true,
    })
  }

  return profile
}

export async function requireUnauthenticated() {
  const profile = await waitForSession()

  if (profile) {
    throw redirect({ to: '/', replace: true })
  }
}

export async function requireRoles(
  redirectTo: string,
  allowedRoles: ManagedUser['role'][]
) {
  const profile = await requireAuthenticated(redirectTo)

  if (!allowedRoles.includes(profile.role)) {
    throw redirect({ to: '/403', replace: true })
  }

  return profile
}

export async function requireDefaultSuperAdmin(redirectTo: string) {
  const profile = await requireRoles(redirectTo, ['SUPER_ADMIN'])

  if (!isDefaultSuperAdmin(profile)) {
    throw redirect({ to: '/403', replace: true })
  }

  return profile
}
