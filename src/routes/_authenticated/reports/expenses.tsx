import { createFileRoute } from '@tanstack/react-router'
import { ExpensesReport } from '@/features/reports/expenses-report'

export const Route = createFileRoute('/_authenticated/reports/expenses')({
  component: ExpensesReport,
})
