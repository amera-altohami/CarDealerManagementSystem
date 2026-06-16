export const companyTypes = [
  'Auction',
  'Shipping',
  'Repair Shop',
  'Parts Store',
  'DMV/BMV',
  'Inspection Center',
] as const

export type CompanyType = (typeof companyTypes)[number]
