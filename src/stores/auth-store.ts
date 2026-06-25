import { create } from 'zustand'
import type { User as FirebaseUser } from 'firebase/auth'
import { type ManagedUser } from '@/features/users/data/schema'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthSession = {
  firebaseUser: FirebaseUser | null
  profile: ManagedUser | null
}

interface AuthState {
  auth: {
    status: AuthStatus
    firebaseUser: FirebaseUser | null
    profile: ManagedUser | null
    isReady: boolean
    setLoading: () => void
    setSession: (session: AuthSession) => void
    clear: () => void
    markReady: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    status: 'loading',
    firebaseUser: null,
    profile: null,
    isReady: false,
    setLoading: () =>
      set((state) => ({
        ...state,
        auth: { ...state.auth, status: 'loading' },
      })),
    setSession: (session) =>
      set((state) => ({
        ...state,
        auth: {
          ...state.auth,
          firebaseUser: session.firebaseUser,
          profile: session.profile,
          status: session.firebaseUser ? 'authenticated' : 'unauthenticated',
        },
      })),
    clear: () =>
      set((state) => ({
        ...state,
        auth: {
          ...state.auth,
          firebaseUser: null,
          profile: null,
          status: 'unauthenticated',
        },
      })),
    markReady: () =>
      set((state) => ({
        ...state,
        auth: { ...state.auth, isReady: true },
      })),
  },
}))
