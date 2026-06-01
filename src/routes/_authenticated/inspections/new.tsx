import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { InspectionCreate } from '@/features/inspections/new'

const inspectionsNewSearchSchema = z.object({
  carId: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/inspections/new')({
  validateSearch: inspectionsNewSearchSchema,
  component: InspectionCreate,
})
