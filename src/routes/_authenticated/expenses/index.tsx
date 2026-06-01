import { createFileRoute } from '@tanstack/react-router'
import { ExpensesManagement } from '@/features/expenses'

export const Route = createFileRoute('/_authenticated/expenses/')({
  component: ExpensesManagement,
})

