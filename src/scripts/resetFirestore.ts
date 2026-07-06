/// <reference types="node" />

import { readFileSync } from 'node:fs'

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import {
  getFirestore,
  type CollectionReference,
  type Firestore,
} from 'firebase-admin/firestore'

const DEFAULT_SUPER_ADMIN_ID = 'admin-default'
const DEFAULT_SUPER_ADMIN_EMAIL = 'car.d.d.admin@gmail.com'
const DEFAULT_SUPER_ADMIN_PASSWORD = 'CarLotE@2026!Adm1n'
const DEFAULT_SUPER_ADMIN_NAME = 'Admin'
const DEFAULT_PROJECT_ID = 'car-dealer-management-system'

function getServiceAccountCredentials() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.GCLOUD_PROJECT ??
    process.env.GOOGLE_CLOUD_PROJECT ??
    DEFAULT_PROJECT_ID
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS

  if (clientEmail && privateKey) {
    return {
      projectId,
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    }
  }

  if (serviceAccountPath) {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8')) as {
      client_email: string
      private_key: string
      project_id?: string
    }

    const resolvedProjectId = serviceAccount.project_id ?? projectId

    return {
      projectId: resolvedProjectId,
      credential: cert({
        projectId: resolvedProjectId,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      }),
    }
  }

  throw new Error(
    [
      'Missing Firebase Admin credentials.',
      'Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON file, or provide FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_PROJECT_ID.',
    ].join(' ')
  )
}

function createAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const adminCredentials = getServiceAccountCredentials()

  return initializeApp({
    projectId: adminCredentials.projectId,
    credential: adminCredentials.credential,
  })
}

async function deleteAllDocumentsInCollection(
  collectionRef: CollectionReference
) {
  let deletedCount = 0

  while (true) {
    const snapshot = await collectionRef.limit(500).get()

    if (snapshot.empty) break

    const batch = collectionRef.firestore.batch()
    for (const documentSnapshot of snapshot.docs) {
      batch.delete(documentSnapshot.ref)
      deletedCount += 1
    }

    await batch.commit()
  }

  return deletedCount
}

async function resetFirestore(db: Firestore) {
  const collectionSnapshots = await db.listCollections()
  const deletedCounts: Record<string, number> = {}

  for (const collectionRef of collectionSnapshots) {
    deletedCounts[collectionRef.id] =
      collectionRef.id === 'managed_users'
        ? await deleteAllDocumentsInCollectionExcept(collectionRef, [
            DEFAULT_SUPER_ADMIN_ID,
          ])
        : await deleteAllDocumentsInCollection(collectionRef)
  }

  const adminDocRef = db.collection('managed_users').doc(DEFAULT_SUPER_ADMIN_ID)
  await adminDocRef.set(
    {
      id: DEFAULT_SUPER_ADMIN_ID,
      full_name: DEFAULT_SUPER_ADMIN_NAME,
      email: DEFAULT_SUPER_ADMIN_EMAIL,
      phone: '+218 91 111 1111',
      role: 'SUPER_ADMIN',
      status: 'Active',
      is_protected: true,
      must_change_password: false,
      created_at: new Date(),
      updated_at: new Date(),
      last_login: null,
    },
    { merge: false }
  )

  return deletedCounts
}

async function deleteAllDocumentsInCollectionExcept(
  collectionRef: CollectionReference,
  excludedDocumentIds: string[]
) {
  let deletedCount = 0

  while (true) {
    const snapshot = await collectionRef.limit(500).get()
    const deletableDocs = snapshot.docs.filter(
      (documentSnapshot) => !excludedDocumentIds.includes(documentSnapshot.id)
    )

    if (deletableDocs.length === 0) break

    const batch = collectionRef.firestore.batch()
    for (const documentSnapshot of deletableDocs) {
      batch.delete(documentSnapshot.ref)
      deletedCount += 1
    }

    await batch.commit()
  }

  return deletedCount
}

async function resetAuth(auth: Auth) {
  const deletedUsers: string[] = []
  let pageToken: string | undefined = undefined

  do {
    const result = await auth.listUsers(1000, pageToken)
    for (const user of result.users) {
      deletedUsers.push(user.uid)
      await auth.deleteUser(user.uid)
    }
    pageToken = result.pageToken
  } while (pageToken)

  await auth.createUser({
    uid: DEFAULT_SUPER_ADMIN_ID,
    email: DEFAULT_SUPER_ADMIN_EMAIL,
    password: DEFAULT_SUPER_ADMIN_PASSWORD,
    displayName: DEFAULT_SUPER_ADMIN_NAME,
    disabled: false,
    emailVerified: false,
  })

  return deletedUsers.length
}

async function fullReset() {
  const app = createAdminApp()
  const db = getFirestore(app)
  const auth = getAuth(app)

  const [deletedFirestoreCounts, deletedAuthUsers] = await Promise.all([
    resetFirestore(db),
    resetAuth(auth),
  ])

  // eslint-disable-next-line no-console
  console.log('Full reset complete.')
  // eslint-disable-next-line no-console
  console.log(
    `Deleted Firestore documents: ${Object.entries(deletedFirestoreCounts)
      .map(([name, count]) => `${name}=${count}`)
      .join(', ')}`
  )
  // eslint-disable-next-line no-console
  console.log(`Deleted Auth users: ${deletedAuthUsers}`)
  // eslint-disable-next-line no-console
  console.log(
    `Recreated Firestore and Auth default admin: ${DEFAULT_SUPER_ADMIN_EMAIL} / ${DEFAULT_SUPER_ADMIN_PASSWORD}`
  )
}

fullReset().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Error running full reset:', error)
  throw error
})
