import { createFileRoute } from '@tanstack/react-router'
import { CompaniesManagement } from '@/features/companies'

export const Route = createFileRoute('/_authenticated/companies/')({
  component: CompaniesManagement,
})

