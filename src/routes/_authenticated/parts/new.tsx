import { createFileRoute } from '@tanstack/react-router'
import { PartCreate } from '@/features/parts/new'

export const Route = createFileRoute('/_authenticated/parts/new')({
  component: PartCreate,
})

