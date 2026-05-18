import { createFileRoute } from '@tanstack/react-router'
import { CarDetails } from '@/features/cars/details'
import { getCarById } from '@/data/carsMockData'

export const Route = createFileRoute('/_authenticated/cars/$carId/')({
  component: CarDetailsRoute,
})

function CarDetailsRoute() {
  const { carId } = Route.useParams()
  const car = getCarById(carId)

  if (!car) {
    return <div className='p-6'>Car not found.</div>
  }

  return <CarDetails car={car} />
}
