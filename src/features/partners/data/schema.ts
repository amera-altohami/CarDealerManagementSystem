import { z } from 'zod'

export const partnerStatusOptions = ['Active', 'Inactive'] as const

export const paymentMethodOptions = [
  'Cash',
  'Zelle',
  'Card',
  'Bank Transfer',
  'Other',
] as const

export const profitShareStatusOptions = ['Pending', 'Paid', 'Loss'] as const

export const partnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  investmentPercentage: z.number(),
  totalContribution: z.number(),
  totalProfit: z.number(),
  totalLoss: z.number(),
  finalBalance: z.number(),
  status: z.enum(partnerStatusOptions),
  notes: z.string().optional().default(''),
  createdAt: z.string(),
})

export type Partner = z.infer<typeof partnerSchema>

export const partnerContributionSchema = z.object({
  id: z.string(),
  partnerId: z.string(),
  carId: z.string(),
  carName: z.string(),
  contributionAmount: z.number(),
  investmentPercentage: z.number(),
  contributionDate: z.string(),
  paymentMethod: z.enum(paymentMethodOptions),
  notes: z.string().optional().default(''),
})

export type PartnerContribution = z.infer<typeof partnerContributionSchema>

export const profitShareSchema = z.object({
  id: z.string(),
  partnerId: z.string(),
  carId: z.string(),
  carName: z.string(),
  carCost: z.number(),
  sellingPrice: z.number(),
  netProfit: z.number(),
  partnerPercentage: z.number(),
  partnerProfitShare: z.number(),
  status: z.enum(profitShareStatusOptions),
})

export type ProfitShare = z.infer<typeof profitShareSchema>

const optionalEmailSchema = z
  .union([z.literal(''), z.email({ error: 'Email must be valid.' })])
  .optional()
  .default('')

export const partnerFormSchema = z.object({
  name: z.string().min(1, 'Partner Name is required.'),
  email: optionalEmailSchema,
  phone: z.string().optional().default(''),
  status: z.enum(partnerStatusOptions, {
    error: 'Status is required.',
  }),
  notes: z.string().optional().default(''),
})

export type PartnerFormValues = z.infer<typeof partnerFormSchema>

export const contributionFormSchema = z.object({
  partnerId: z.string().min(1, 'Partner is required.'),
  carId: z.string().min(1, 'Car is required.'),
  contributionAmount: z.coerce
    .number()
    .positive('Contribution Amount must be greater than 0.'),
  contributionDate: z.string().min(1, 'Contribution Date is required.'),
  paymentMethod: z.enum(paymentMethodOptions, {
    error: 'Payment Method is required.',
  }),
  notes: z.string().optional().default(''),
})

export type ContributionFormValues = z.infer<typeof contributionFormSchema>
