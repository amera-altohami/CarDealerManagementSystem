import { createFileRoute } from '@tanstack/react-router'
import { CompanyDetails } from '@/features/companies/details'

export const Route = createFileRoute('/_authenticated/companies/$companyId/')({
  component: CompanyDetailsRoute,
})

function CompanyDetailsRoute() {
  const { companyId } = Route.useParams()

  return <CompanyDetails companyId={companyId} />
}
