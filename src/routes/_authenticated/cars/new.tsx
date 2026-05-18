import { createFileRoute } from '@tanstack/react-router'
import { CarCreate } from '@/features/cars/new'

export const Route = createFileRoute('/_authenticated/cars/new')({
  component: CarCreate,
})
