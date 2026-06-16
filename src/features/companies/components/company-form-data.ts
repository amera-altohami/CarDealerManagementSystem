import { z } from 'zod'
import { companyTypes } from '../model'

export { companyTypes } from '../model'

export const companyFormSchema = z.object({
  name: z.string().min(2, 'Please enter a company name.'),
  type: z.enum([
    companyTypes[0],
    companyTypes[1],
    companyTypes[2],
    companyTypes[3],
    companyTypes[4],
    companyTypes[5],
  ]),
  phoneNumber: z.string().min(7, 'Please enter a valid phone number.'),
  address: z.string().min(4, 'Please enter an address.'),
  email: z.string().email('Please enter a valid email.').optional().or(z.literal('')),
  notes: z.string().optional().default(''),
})

export type CompanyFormValues = z.infer<typeof companyFormSchema>
