import { createFileRoute } from '@tanstack/react-router'
import { CarEdit } from '@/features/cars/edit'

export const Route = createFileRoute('/_authenticated/cars/$carId/edit')({
  component: CarEditRoute,
})

function CarEditRoute() {
  const { carId } = Route.useParams()
  return <CarEdit carId={carId} />
}
