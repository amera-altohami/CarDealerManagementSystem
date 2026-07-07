import { z } from 'zod'
import { carStatusOptions } from '@/services/carsService'
import { titleTypeOptions } from '../types/title'

const titleTypeSchema = z.enum([
  titleTypeOptions[0],
  titleTypeOptions[1],
  titleTypeOptions[2],
])

const statusSchema = z.enum([
  carStatusOptions[0].value,
  carStatusOptions[1].value,
  carStatusOptions[2].value,
  carStatusOptions[3].value,
  carStatusOptions[4].value,
])

export const carFormSchema = z
  .object({
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
    mileage: z.string().min(1, 'Please enter mileage.'),
    purchaseDate: z.string().min(1, 'Please select a purchase date.'),
    purchasePrice: z.coerce
      .number()
      .min(0, 'Please enter a valid purchase price.'),
    sellingPrice: z.coerce
      .number()
      .min(0, 'Please enter a valid selling price.'),
    purchasePlace: z
      .string()
      .min(2, 'Purchase place must be at least 2 characters.'),
    titleType: titleTypeSchema,
    status: statusSchema,
    carfaxType: z.enum(['none', 'link', 'pdf']),
    carfaxLink: z.string().optional().default(''),
    carfaxPdfName: z.string().optional().default(''),
    carfaxPdfFile: z.instanceof(File).optional().nullable().default(null),
    notes: z.string().optional().default(''),
    photo: z.string().optional().default(''),
  })
  .refine(
    (values) =>
      values.carfaxType === 'none' ||
      (values.carfaxType === 'link'
        ? values.carfaxLink.trim().length > 0
        : Boolean(values.carfaxPdfFile || values.carfaxPdfName)),
    {
      message:
        'Please provide a Carfax link or upload a PDF file depending on the selected type.',
      path: ['carfaxType'],
    }
  )
  .refine(
    (values) =>
      values.carfaxType !== 'link' || values.carfaxLink.trim().length > 0,
    {
      message: 'Please enter a Carfax link.',
      path: ['carfaxLink'],
    }
  )
  .refine(
    (values) =>
      values.carfaxType !== 'pdf' ||
      Boolean(values.carfaxPdfFile || values.carfaxPdfName),
    {
      message: 'Please upload a Carfax PDF file.',
      path: ['carfaxPdfName'],
    }
  )

export type CarFormValues = z.infer<typeof carFormSchema>
