import { createFileRoute } from '@tanstack/react-router'
import { ProfitReport } from '@/features/reports/profit-report'

export const Route = createFileRoute('/_authenticated/reports/profit')({
  component: ProfitReport,
})
