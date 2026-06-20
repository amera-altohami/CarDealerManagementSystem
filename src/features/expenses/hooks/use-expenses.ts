import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ExpenseDeleteBlockedError,
  ExpenseNotFoundError,
  ExpenseValidationError,
  createExpense,
  deleteExpense,
  getExpenseById,
  getExpenses,
  updateExpense,
  type CreateExpenseData,
  type Expense,
  type UpdateExpenseData,
} from '@/services/expensesService'
import { toast } from 'sonner'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'

export const expensesQueryKey = ['expenses'] as const

function getExpenseErrorMessage(error: unknown) {
  if (error instanceof ExpenseValidationError) {
    return error.issues[0] ?? 'Expense data is invalid.'
  }

  if (error instanceof ExpenseNotFoundError) {
    return error.message
  }

  return getFirestoreErrorMessage(error)
}

export function useExpensesQuery() {
  return useQuery({
    queryKey: expensesQueryKey,
    queryFn: getExpenses,
  })
}

export function useExpenseQuery(expenseId: string) {
  return useQuery({
    queryKey: [...expensesQueryKey, expenseId] as const,
    queryFn: () => getExpenseById(expenseId),
    enabled: Boolean(expenseId),
  })
}

export function useCreateExpenseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExpenseData) => createExpense(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: expensesQueryKey })
      toast.success('Expense added successfully.')
    },
    onError: (error) => {
      toast.error(getExpenseErrorMessage(error))
    },
  })
}

export function useUpdateExpenseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseData }) =>
      updateExpense(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: expensesQueryKey })
      toast.success('Expense updated successfully.')
    },
    onError: (error) => {
      toast.error(getExpenseErrorMessage(error))
    },
  })
}

export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: expensesQueryKey })
      toast.success('Expense deleted successfully.')
    },
    onError: (error) => {
      if (error instanceof ExpenseDeleteBlockedError) {
        toast.warning(
          'This expense cannot be deleted because related records exist.'
        )
        return
      }

      toast.error(getExpenseErrorMessage(error))
    },
  })
}

export type { Expense }
