import { z } from 'zod'
import type { InspectionStatus } from '@/data/dealerOperationsMockData'

export const inspectionStatuses: InspectionStatus[] = ['Pending', 'Passed', 'Failed']

export const inspectionFormSchema = z.object({
  carId: z.string().min(1, 'Please select a car.'),
  date: z.string().min(1, 'Please select a date.'),
  time: z.string().min(1, 'Please select a time.'),
  placeId: z.string().min(1, 'Please select a place.'),
  status: z.enum([inspectionStatuses[0], inspectionStatuses[1], inspectionStatuses[2]]),
  notes: z.string().optional().default(''),
  files: z.string().optional().default(''),
  receipts: z.string().optional().default(''),
  beforeImages: z.string().optional().default(''),
  afterImages: z.string().optional().default(''),
  reminderSent: z.enum(['yes', 'no']),
})

export type InspectionFormValues = z.infer<typeof inspectionFormSchema>
