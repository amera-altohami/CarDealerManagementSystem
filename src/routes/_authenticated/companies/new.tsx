import { createFileRoute } from '@tanstack/react-router'
import { CompanyCreate } from '@/features/companies/new'

export const Route = createFileRoute('/_authenticated/companies/new')({
  component: CompanyCreate,
})

