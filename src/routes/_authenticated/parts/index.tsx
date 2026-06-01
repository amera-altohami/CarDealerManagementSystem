import { createFileRoute } from '@tanstack/react-router'
import { PartsManagement } from '@/features/parts'

export const Route = createFileRoute('/_authenticated/parts/')({
  component: PartsManagement,
})

