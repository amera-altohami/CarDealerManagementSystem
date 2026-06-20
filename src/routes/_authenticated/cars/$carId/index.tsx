import { createFileRoute } from '@tanstack/react-router'
import { CarDetails } from '@/features/cars/details'

export const Route = createFileRoute('/_authenticated/cars/$carId/')({
  component: CarDetailsRoute,
})

function CarDetailsRoute() {
  const { carId } = Route.useParams()

  return <CarDetails carId={carId} />
}
