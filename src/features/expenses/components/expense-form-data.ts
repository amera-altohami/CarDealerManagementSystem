import { z } from 'zod'
import {
  billCategoryOptions,
  expenseTypeOptions,
  type ExpenseType,
  type BillCategory,
  type PaymentMethod,
  paymentMethodOptions,
} from '@/types/dealer'

export const expenseTypes: ExpenseType[] = [...expenseTypeOptions]

export const paymentMethods: PaymentMethod[] = [...paymentMethodOptions]

export const billCategories: BillCategory[] = [...billCategoryOptions]

export const expenseFormSchema = z
  .object({
    carId: z.string().trim().optional().default(''),
    expenseType: z.enum(expenseTypeOptions),
    amount: z.coerce.number().min(0, 'Please enter a valid amount.'),
    paidBy: z.string().min(2, 'Please select who paid this expense.'),
    paymentMethod: z.enum(paymentMethodOptions),
    billCategory: z.string().trim().optional().default(''),
    date: z.string().min(1, 'Please select a date.'),
    notes: z.string().optional().default(''),
    invoiceName: z.string().optional().default(''),
  })
  .superRefine((values, ctx) => {
    if (values.expenseType === 'Bills' && values.billCategory.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['billCategory'],
        message: 'Please select a bill category.',
      })
    }
  })

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>
