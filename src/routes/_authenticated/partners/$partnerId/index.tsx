import { createFileRoute } from '@tanstack/react-router'
import { PartnerDetails } from '@/features/partners/details'

export const Route = createFileRoute('/_authenticated/partners/$partnerId/')({
  component: PartnerDetailsRoute,
})

function PartnerDetailsRoute() {
  const { partnerId } = Route.useParams()

  return <PartnerDetails partnerId={partnerId} />
}
