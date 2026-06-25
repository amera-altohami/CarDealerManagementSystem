import { updateEmail, updateProfile } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import {
  getCurrentAuthProfile,
  getCurrentFirebaseUser,
} from './authService'
import { useAuthStore } from '@/stores/auth-store'
import { getById, update as updateUser } from './usersService'

export type UpdateProfileData = {
  fullName: string
  email: string
  phone: string
}

export async function updateCurrentProfile(data: UpdateProfileData) {
  const profile = getCurrentAuthProfile()
  const firebaseUser = getCurrentFirebaseUser()

  if (!profile || !firebaseUser) {
    throw new Error('You must be signed in to update your profile.')
  }

  const nextEmail = data.email.trim()
  const nextName = data.fullName.trim()
  const nextPhone = data.phone.trim()
  const authUser = auth.currentUser ?? firebaseUser

  if (nextEmail !== profile.email) {
    if (!authUser) {
      throw new Error('Firebase user is not available.')
    }
    await updateEmail(authUser, nextEmail)
  }

  if (!authUser) {
    throw new Error('Firebase user is not available.')
  }

  await updateProfile(authUser, {
    displayName: nextName,
  })

  await updateUser(profile.id, {
    fullName: nextName,
    email: nextEmail,
    phone: nextPhone,
    role: profile.role,
    status: profile.status,
  })

  const updatedProfile = await getById(profile.id)

  if (updatedProfile) {
    useAuthStore.getState().auth.setSession({
      firebaseUser: authUser,
      profile: updatedProfile,
    })
  }

  return updatedProfile
}
