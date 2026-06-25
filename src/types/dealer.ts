export const expenseTypeOptions = [
  'Purchase',
  'Shipping',
  'Repair',
  'Parts',
  'Labor',
  'Inspection',
  'Fees',
  'Other',
] as const

export type ExpenseType = (typeof expenseTypeOptions)[number]

export const paymentMethodOptions = ['Zelle', 'Cash', 'Card'] as const

export type PaymentMethod = (typeof paymentMethodOptions)[number]

export const inspectionStatusOptions = ['Pending', 'Passed', 'Failed'] as const

export type InspectionStatus = (typeof inspectionStatusOptions)[number]

