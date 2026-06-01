import { createFileRoute } from '@tanstack/react-router'
import { InspectionManagement } from '@/features/inspections'

export const Route = createFileRoute('/_authenticated/inspections/')({
  component: InspectionManagement,
})

