import { Timestamp, doc, writeBatch } from 'firebase/firestore'
import { z } from 'zod'
import {
  createDocument,
  deleteDocument,
  getCollectionDocs,
  type FirestoreDate,
} from './firestoreService'
import {
  defaultPartCatalogItems,
  type PartCatalogItem,
} from '@/features/parts/components/part-catalog-data'
import { db } from '@/lib/firebase'

const COLLECTION_NAME = 'part_catalog'

type PartCatalogDocument = {
  id: string
  name: string
  category: string
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export type CreatePartCatalogData = {
  name: string
  category: string
}

const partCatalogInputSchema = z.object({
  name: z.string().trim().min(2, 'Please enter a part name.'),
  category: z.string().trim().min(1, 'Please select a category.'),
})

function mapPartCatalogDocument(document: PartCatalogDocument): PartCatalogItem {
  return {
    id: document.id,
    name: document.name,
    category: document.category,
  }
}

function sortCatalogItems(items: PartCatalogItem[]) {
  return [...items].sort((left, right) => {
    const categoryCompare = left.category.localeCompare(right.category)
    if (categoryCompare !== 0) return categoryCompare
    return left.name.localeCompare(right.name)
  })
}

function normalizePartName(name: string) {
  return name.trim()
}

function normalizeCategory(category: string) {
  return category.trim() || 'Other'
}

async function seedDefaultPartCatalog() {
  const now = Timestamp.now()
  const batch = writeBatch(db)

  for (const item of defaultPartCatalogItems) {
    batch.set(doc(db, COLLECTION_NAME, item.id), {
      id: item.id,
      name: item.name,
      category: item.category,
      created_at: now,
      updated_at: now,
    })
  }

  await batch.commit()
}

async function getExistingCatalogItems() {
  const documents = await getCollectionDocs<PartCatalogDocument>(
    COLLECTION_NAME
  )

  return sortCatalogItems(documents.map(mapPartCatalogDocument))
}

function findMatchingCatalogItem(
  items: PartCatalogItem[],
  name: string
) {
  const normalizedName = normalizePartName(name).toLowerCase()

  return items.find(
    (item) => item.name.trim().toLowerCase() === normalizedName
  )
}

function createValidationError(message: string) {
  return new Error(message)
}

function toCreateData(data: CreatePartCatalogData): Omit<PartCatalogDocument, 'id'> {
  const now = Timestamp.now()

  return {
    name: normalizePartName(data.name),
    category: normalizeCategory(data.category),
    created_at: now,
    updated_at: now,
  }
}

export async function getPartCatalog(): Promise<PartCatalogItem[]> {
  const items = await getExistingCatalogItems()

  if (items.length === 0) {
    await seedDefaultPartCatalog()
    return defaultPartCatalogItems
  }

  return items
}

export async function createPartCatalogItem(
  data: CreatePartCatalogData
): Promise<PartCatalogItem> {
  const parsed = partCatalogInputSchema.safeParse(data)
  if (!parsed.success) {
    throw createValidationError(
      parsed.error.issues[0]?.message ?? 'Part catalog data is invalid.'
    )
  }

  const existingItems = await getExistingCatalogItems()
  const matchedItem = findMatchingCatalogItem(existingItems, parsed.data.name)
  if (matchedItem) {
    return matchedItem
  }

  const created = await createDocument<PartCatalogDocument>(
    COLLECTION_NAME,
    toCreateData(parsed.data)
  )

  return mapPartCatalogDocument(created)
}

export async function deletePartCatalogItem(id: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, id)
}

export async function restoreDefaultPartCatalog(): Promise<PartCatalogItem[]> {
  const currentItems = await getExistingCatalogItems()
  await Promise.all(currentItems.map((item) => deleteDocument(COLLECTION_NAME, item.id)))
  await seedDefaultPartCatalog()
  return defaultPartCatalogItems
}
