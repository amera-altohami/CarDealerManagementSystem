import { createFileRoute } from '@tanstack/react-router'
import { PartnerReport } from '@/features/reports/partner-report'

export const Route = createFileRoute('/_authenticated/reports/partner')({
  component: PartnerReport,
})
