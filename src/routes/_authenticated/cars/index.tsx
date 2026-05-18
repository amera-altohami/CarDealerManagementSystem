import { createFileRoute } from '@tanstack/react-router'
import { CarsManagement } from '@/features/cars'

export const Route = createFileRoute('/_authenticated/cars/')({
  component: CarsManagement,
})
