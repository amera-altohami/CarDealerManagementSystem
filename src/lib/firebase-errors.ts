import { FirebaseError } from 'firebase/app'

const fallbackMessage = 'Something went wrong while talking to Firebase.'

export function getFirestoreErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'permission-denied':
        return 'You do not have permission to access this data.'
      case 'unauthenticated':
        return 'You must be signed in to continue.'
      case 'not-found':
        return 'The requested record was not found.'
      case 'failed-precondition':
        return 'Firebase is not ready for this operation.'
      case 'aborted':
        return 'The operation was interrupted. Please try again.'
      case 'unavailable':
        return 'Firebase is temporarily unavailable. Please try again.'
      default:
        return error.message || fallbackMessage
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}
