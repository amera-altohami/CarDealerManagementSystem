import { createFileRoute } from '@tanstack/react-router'
import { CompanyEdit } from '@/features/companies/edit'

export const Route = createFileRoute('/_authenticated/companies/$companyId/edit')({
  component: CompanyEditRoute,
})

function CompanyEditRoute() {
  const { companyId } = Route.useParams()

  return <CompanyEdit companyId={companyId} />
}
