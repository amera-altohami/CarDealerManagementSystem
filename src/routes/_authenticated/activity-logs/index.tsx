import { createFileRoute } from '@tanstack/react-router'
import { ActivityLogs } from '@/features/logs'
import { requireDefaultSuperAdmin } from '@/lib/auth-guards'

export const Route = createFileRoute('/_authenticated/activity-logs/')({
  beforeLoad: async ({ location }) => {
    await requireDefaultSuperAdmin(location.href)
  },
  component: ActivityLogs,
})
