export const expenseTypeOptions = [
  'Purchase',
  'Shipping',
  'Repair',
  'Parts',
  'Labor',
  'Inspection',
  'Fees',
  'Bills',
  'Other',
] as const

export type ExpenseType = (typeof expenseTypeOptions)[number]

export const paymentMethodOptions = [
  'Zelle',
  'Cash',
  'Cashapp',
  'Check',
  'Cashier Check',
  'Card',
] as const

export type PaymentMethod = (typeof paymentMethodOptions)[number]

export const purchasePlaceOptions = [
  'Copart',
  'IAA',
  'Adesa',
  'Manheim',
  'Facebook',
] as const

export type PurchasePlace = (typeof purchasePlaceOptions)[number]

export function isPurchasePlace(value: string): value is PurchasePlace {
  return (purchasePlaceOptions as readonly string[]).includes(value)
}

export const billCategoryOptions = [
  'Rent',
  'Water',
  'Gas',
  'Electricity',
  'Internet',
] as const

export type BillCategory = (typeof billCategoryOptions)[number]

export const inspectionStatusOptions = ['Pending', 'Passed', 'Failed'] as const

export type InspectionStatus = (typeof inspectionStatusOptions)[number]
