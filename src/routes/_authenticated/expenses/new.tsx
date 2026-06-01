import { createFileRoute } from '@tanstack/react-router'
import { ExpenseCreate } from '@/features/expenses/new'

export const Route = createFileRoute('/_authenticated/expenses/new')({
  component: ExpenseCreate,
})

