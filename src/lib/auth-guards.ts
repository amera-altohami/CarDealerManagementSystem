import { redirect } from '@tanstack/react-router'
import { type ManagedUser } from '@/features/users/data/schema'
import { isDefaultSuperAdmin } from '@/services/usersService'
import { getCurrentAuthProfile, waitForAuthReady } from '@/services/authService'

async function waitForSession() {
  await waitForAuthReady()
  return getCurrentAuthProfile()
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
