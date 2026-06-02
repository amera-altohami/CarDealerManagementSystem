import { z } from 'zod'

export const partFormSchema = z.object({
  partName: z.string().min(2, 'Please enter a part name.'),
  price: z.coerce.number().min(0, 'Please enter a valid price.'),
  supplierId: z.string().optional().default(''),
  purchaseDate: z.string().min(1, 'Please select a purchase date.'),
  installed: z.enum(['yes', 'no']),
  relatedCarId: z.string().optional().default(''),
  invoiceName: z.string().optional().default(''),
  notes: z.string().optional().default(''),
})

export type PartFormValues = z.infer<typeof partFormSchema>
