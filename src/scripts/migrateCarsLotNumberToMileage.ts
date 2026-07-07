import {
  collection,
  deleteField,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

async function migrateCarsLotNumberToMileage() {
  const snapshot = await getDocs(collection(db, 'cars'))

  if (snapshot.empty) {
    // eslint-disable-next-line no-console
    console.log('No cars found to migrate.')
    return
  }

  const batch = writeBatch(db)

  for (const carDoc of snapshot.docs) {
    const data = carDoc.data() as {
      lot_number?: string | null
    }

    if (data.lot_number) {
      batch.update(doc(db, 'cars', carDoc.id), {
        mileage: data.lot_number,
        lot_number: deleteField(),
      })
    }
  }

  await batch.commit()

  // eslint-disable-next-line no-console
  console.log('Car mileage migration completed successfully.')
}

migrateCarsLotNumberToMileage().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Error migrating car mileage fields:', error)
})
