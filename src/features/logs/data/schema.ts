import { z } from 'zod'
import { userManagementRoleOptions } from '@/features/users/data/schema'

export const activityLogActionOptions = [
  'Create',
  'Update',
  'Delete',
  'Login',
] as const

export const activityLogModuleOptions = [
  'Cars',
  'Expenses',
  'Partners',
  'Users',
  'Reports',
  'Notifications',
  'Companies',
  'Inspections',
  'Parts',
  'Titles',
] as const

export const changedFieldSchema = z.object({
  field: z.string(),
  oldValue: z.string(),
  newValue: z.string(),
})

export const activityLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userRole: z.enum(userManagementRoleOptions),
  action: z.enum(activityLogActionOptions),
  module: z.enum(activityLogModuleOptions),
  entityType: z.string(),
  entityName: z.string(),
  description: z.string(),
  changedFields: z.array(changedFieldSchema).optional(),
  date: z.string(),
  time: z.string(),
  createdAt: z.string(),
  ipAddress: z.string(),
})

export type ActivityLogAction = (typeof activityLogActionOptions)[number]
export type ActivityLogModule = (typeof activityLogModuleOptions)[number]
export type ActivityLog = z.infer<typeof activityLogSchema>
export type ChangedField = z.infer<typeof changedFieldSchema>

export type ActivityLogFilters = {
  search: string
  userId: string
  action: ActivityLogAction | 'all'
  module: ActivityLogModule | 'all'
  fromDate: string
  toDate: string
}
