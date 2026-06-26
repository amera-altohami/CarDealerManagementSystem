import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('SUPER_ADMIN'),
  z.literal('ADMIN'),
  z.literal('USER'),
])

const _userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  status: userStatusSchema,
  role: userRoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof _userSchema>

export const userManagementRoleOptions = [
  'SUPER_ADMIN',
  'ADMIN',
  'USER',
] as const

export const userManagementStatusOptions = ['Active', 'Disabled'] as const

export const userManagementSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional().default(''),
  role: z.enum(userManagementRoleOptions),
  status: z.enum(userManagementStatusOptions),
  isProtected: z.boolean().optional(),
  mustChangePassword: z.boolean().default(false),
  createdAt: z.string(),
  lastLogin: z.string(),
})

export type ManagedUser = z.infer<typeof userManagementSchema>

export const userManagementFormSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required.'),
  email: z.email({
    error: (issue) =>
      issue.input === '' ? 'Email is required.' : 'Email format must be valid.',
  }),
  phone: z.string().optional().default(''),
  role: z.enum(userManagementRoleOptions, {
    error: 'Role is required.',
  }),
  status: z.enum(userManagementStatusOptions, {
    error: 'Status is required.',
  }),
})

export type UserManagementFormValues = z.infer<typeof userManagementFormSchema>
