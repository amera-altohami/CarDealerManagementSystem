import { z } from 'zod'
import { carStatusOptions, titleTypeOptions } from '@/data/carsMockData'

const titleTypeSchema = z.enum([
  titleTypeOptions[0],
  titleTypeOptions[1],
  titleTypeOptions[2],
  titleTypeOptions[3],
])

const statusSchema = z.enum([
  carStatusOptions[0].value,
  carStatusOptions[1].value,
  carStatusOptions[2].value,
  carStatusOptions[3].value,
  carStatusOptions[4].value,
])

export const carFormSchema = z.object({
  brand: z
    .string('Please enter a brand.')
    .min(2, 'Brand must be at least 2 characters.'),
  model: z
    .string('Please enter a model.')
    .min(2, 'Model must be at least 2 characters.'),
  year: z.coerce
    .number()
    .min(1980, 'Please enter a valid year.')
    .max(new Date().getFullYear() + 1, 'Please enter a valid year.'),
  vin: z
    .string('Please enter a VIN.')
    .min(5, 'VIN must be at least 5 characters.'),
  lotNumber: z.string().min(2, 'Lot number must be at least 2 characters.'),
  purchaseDate: z.string().min(1, 'Please select a purchase date.'),
  purchasePlace: z
    .string()
    .min(2, 'Purchase place must be at least 2 characters.'),
  titleType: titleTypeSchema,
  status: statusSchema,
  notes: z.string().optional().default(''),
  photo: z.string().optional().default(''),
  carfaxLink: z.string().optional().default(''),
})

export type CarFormValues = z.infer<typeof carFormSchema>
