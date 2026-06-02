import { createFileRoute } from '@tanstack/react-router'
import { Partners } from '@/features/partners'

export const Route = createFileRoute('/_authenticated/partners/')({
  component: Partners,
})
