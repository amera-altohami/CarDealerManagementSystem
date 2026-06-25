import { createFileRoute } from '@tanstack/react-router'
import { ForgotPassword } from '@/features/auth/forgot-password'
import { requireUnauthenticated } from '@/lib/auth-guards'

export const Route = createFileRoute('/(auth)/forgot-password')({
  beforeLoad: async () => {
    await requireUnauthenticated()
  },
  component: ForgotPassword,
})
