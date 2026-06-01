import { createFileRoute } from '@tanstack/react-router'
import { PartDetails } from '@/features/parts/details'

export const Route = createFileRoute('/_authenticated/parts/$partId/')({
  component: PartDetailsRoute,
})

function PartDetailsRoute() {
  const { partId } = Route.useParams()

  return <PartDetails partId={partId} />
}
