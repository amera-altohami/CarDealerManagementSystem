import { z } from 'zod'
import {
  expenseTypeOptions,
  type ExpenseType,
  type PaymentMethod,
} from '@/data/dealerOperationsMockData'

export const expenseTypes: ExpenseType[] = [...expenseTypeOptions]

export const paymentMethods: PaymentMethod[] = ['Zelle', 'Cash', 'Card']

export const expenseFormSchema = z.object({
  carId: z.string().trim().optional().default(''),
  expenseType: z.enum(expenseTypeOptions),
  amount: z.coerce.number().min(0, 'Please enter a valid amount.'),
  paidBy: z.string().min(2, 'Please select who paid this expense.'),
  paymentMethod: z.enum([
    paymentMethods[0],
    paymentMethods[1],
    paymentMethods[2],
  ]),
  date: z.string().min(1, 'Please select a date.'),
  notes: z.string().optional().default(''),
  invoiceName: z.string().optional().default(''),
})

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>
