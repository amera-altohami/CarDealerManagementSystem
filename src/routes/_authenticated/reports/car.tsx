import { createFileRoute } from '@tanstack/react-router'
import { CarReport } from '@/features/reports/car-report'

export const Route = createFileRoute('/_authenticated/reports/car')({
  component: CarReport,
})
