import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ResetPassword } from '@/features/auth/reset-password'
import { requireUnauthenticated } from '@/lib/auth-guards'

const searchSchema = z.object({
  oobCode: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/reset-password')({
  beforeLoad: async () => {
    await requireUnauthenticated()
  },
  component: ResetPassword,
  validateSearch: searchSchema,
})
