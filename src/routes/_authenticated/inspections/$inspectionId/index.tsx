import { createFileRoute } from '@tanstack/react-router'
import { InspectionDetails } from '@/features/inspections/details'

export const Route = createFileRoute('/_authenticated/inspections/$inspectionId/')({
  component: InspectionDetailsRoute,
})

function InspectionDetailsRoute() {
  const { inspectionId } = Route.useParams()

  return <InspectionDetails inspectionId={inspectionId} />
}
