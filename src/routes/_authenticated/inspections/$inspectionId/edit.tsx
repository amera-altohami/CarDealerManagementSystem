import { createFileRoute } from '@tanstack/react-router'
import { InspectionEdit } from '@/features/inspections/edit'

export const Route = createFileRoute('/_authenticated/inspections/$inspectionId/edit')({
  component: InspectionEditRoute,
})

function InspectionEditRoute() {
  const { inspectionId } = Route.useParams()

  return <InspectionEdit inspectionId={inspectionId} />
}
