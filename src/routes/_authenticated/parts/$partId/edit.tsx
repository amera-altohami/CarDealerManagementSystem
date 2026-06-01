import { createFileRoute } from '@tanstack/react-router'
import { PartEdit } from '@/features/parts/edit'

export const Route = createFileRoute('/_authenticated/parts/$partId/edit')({
  component: PartEditRoute,
})

function PartEditRoute() {
  const { partId } = Route.useParams()

  return <PartEdit partId={partId} />
}
