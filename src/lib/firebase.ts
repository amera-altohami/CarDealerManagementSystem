import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: 'AIzaSyDJdrt80on3blndGnu7oOj4UqRZtytOupM',
  authDomain: 'car-dealer-management-system.firebaseapp.com',
  projectId: 'car-dealer-management-system',
  storageBucket: 'car-dealer-management-system.firebasestorage.app',
  messagingSenderId: '964803983764',
  appId: '1:964803983764:web:8406440a15cd407b33b781',
}

export const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)

export default app
