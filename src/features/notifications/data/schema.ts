import { z } from 'zod'

export const notificationTypeOptions = [
  'Inspection',
  'Car Delay',
  'Low Parts',
  'Missing Documents',
] as const

export const notificationSeverityOptions = [
  'Low',
  'Medium',
  'High',
  'Critical',
] as const

export const notificationStatusOptions = ['Read', 'Unread'] as const

export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(notificationTypeOptions),
  severity: z.enum(notificationSeverityOptions),
  status: z.enum(notificationStatusOptions),
  relatedCarId: z.string().optional(),
  relatedCarName: z.string().optional(),
  createdAt: z.string(),
  dueDate: z.string().optional(),
  actionUrl: z.string().optional(),
  createdBy: z.string(),
})

export type NotificationType = (typeof notificationTypeOptions)[number]
export type NotificationSeverity = (typeof notificationSeverityOptions)[number]
export type NotificationReadStatus = (typeof notificationStatusOptions)[number]
export type AppNotification = z.infer<typeof notificationSchema>

export type NotificationFilters = {
  search: string
  type: NotificationType | 'all'
  status: NotificationReadStatus | 'all'
  severity: NotificationSeverity | 'all'
}
