import type {
  ExpenseType,
  PaymentMethod,
} from '@/data/dealerOperationsMockData'
import { orderBy, where } from 'firebase/firestore'
import {
  createDocument,
  deleteDocument,
  getCollectionDocs,
  getDocumentById,
  updateDocument,
  type CreateData,
  type FirestoreDate,
  type UpdateData,
} from './firestoreService'

const COLLECTION_NAME = 'expenses'

export interface ExpenseDocument {
  id: string
  car_id: string
  car_name?: string
  expense_type: ExpenseType
  amount: number
  paid_by: string
  payment_method: PaymentMethod
  date: string
  notes?: string
  invoice_name?: string | null
  invoice_url?: string | null
  created_at?: FirestoreDate
  updated_at?: FirestoreDate
}

export type CreateExpenseData = CreateData<ExpenseDocument>
export type UpdateExpenseData = UpdateData<ExpenseDocument>

export async function getAll(): Promise<ExpenseDocument[]> {
  return getCollectionDocs<ExpenseDocument>(COLLECTION_NAME, [
    orderBy('date', 'desc'),
  ])
}

export async function getById(id: string): Promise<ExpenseDocument | null> {
  return getDocumentById<ExpenseDocument>(COLLECTION_NAME, id)
}

export async function create(
  data: CreateExpenseData
): Promise<ExpenseDocument> {
  return createDocument<ExpenseDocument>(COLLECTION_NAME, data)
}

export async function update(
  id: string,
  data: UpdateExpenseData
): Promise<void> {
  await updateDocument<ExpenseDocument>(COLLECTION_NAME, id, data)
}

async function deleteExpense(id: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, id)
}

export async function getExpensesByCarId(
  carId: string
): Promise<ExpenseDocument[]> {
  return getCollectionDocs<ExpenseDocument>(COLLECTION_NAME, [
    where('car_id', '==', carId),
    orderBy('date', 'desc'),
  ])
}

export async function getTotalExpensesByCarId(carId: string): Promise<number> {
  const expenses = await getExpensesByCarId(carId)

  return expenses.reduce((sum, expense) => sum + expense.amount, 0)
}

export { deleteExpense as delete }
