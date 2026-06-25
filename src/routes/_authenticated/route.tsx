import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { requireAuthenticated } from '@/lib/auth-guards'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    await requireAuthenticated(location.href)
  },
  component: AuthenticatedLayout,
})
