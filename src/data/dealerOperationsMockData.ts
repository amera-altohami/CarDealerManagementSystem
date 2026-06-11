import { carsMockData, type Car } from '@/data/carsMockData'

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

export type PaymentMethod = 'Zelle' | 'Cash' | 'Card'

export type FinancialActorType = 'Investor' | 'Partner'

export type FinancialActor = {
  id: string
  name: string
  type: FinancialActorType
}

export type CompanyType =
  | 'Auction'
  | 'Shipping'
  | 'Repair Shop'
  | 'Parts Store'
  | 'DMV/BMV'
  | 'Inspection Center'

export type Company = {
  id: string
  name: string
  type: CompanyType
  phoneNumber: string
  address: string
  email?: string
}

export type Expense = {
  id: string
  carId: string
  carName: string
  expenseType: ExpenseType
  amount: number
  paidBy: string
  paymentMethod: PaymentMethod
  date: string
  notes: string
  invoiceName?: string
  invoiceUrl?: string
}

export type Part = {
  id: string
  partName: string
  price: number
  supplierId?: string
  supplierName: string
  purchaseDate: string
  installed: boolean
  relatedCarId?: string | null
  relatedCarName?: string
  invoiceName?: string
  invoiceUrl?: string
}

export type InspectionStatus = 'Pending' | 'Passed' | 'Failed'

export type Inspection = {
  id: string
  carId: string
  carName: string
  date: string
  time: string
  placeId?: string
  place: string
  status: InspectionStatus
  notes: string
  files: string[]
  receipts: string[]
  beforeImages: string[]
  afterImages: string[]
  reminderSent: boolean
}

export const financialActorsMockData: FinancialActor[] = [
  {
    id: 'financial-001',
    name: 'North Yard Partners',
    type: 'Partner',
  },
  {
    id: 'financial-002',
    name: 'Alpha Capital',
    type: 'Investor',
  },
  {
    id: 'financial-003',
    name: 'Premium Auto Fund',
    type: 'Investor',
  },
  {
    id: 'financial-004',
    name: 'West Coast Investors',
    type: 'Investor',
  },
  {
    id: 'financial-005',
    name: 'Maya S.',
    type: 'Partner',
  },
  {
    id: 'financial-006',
    name: 'Sara K.',
    type: 'Partner',
  },
  {
    id: 'financial-007',
    name: 'Nadia F.',
    type: 'Partner',
  },
]

export const companiesMockData: Company[] = [
  {
    id: 'company-001',
    name: 'Dallas Auto Auction',
    type: 'Auction',
    phoneNumber: '(214) 555-0198',
    address: '1200 Market Center Blvd, Dallas, TX',
  },
  {
    id: 'company-002',
    name: 'Phoenix Transport Co.',
    type: 'Shipping',
    phoneNumber: '(602) 555-0112',
    address: '88 East Jefferson St, Phoenix, AZ',
  },
  {
    id: 'company-003',
    name: 'Metro Body Shop',
    type: 'Repair Shop',
    phoneNumber: '(312) 555-0144',
    address: '2500 W Diversey Ave, Chicago, IL',
  },
  {
    id: 'company-004',
    name: 'OEM Parts Depot',
    type: 'Parts Store',
    phoneNumber: '(800) 555-0107',
    address: '410 Industrial Pkwy, Atlanta, GA',
  },
  {
    id: 'company-005',
    name: 'Clark County DMV',
    type: 'DMV/BMV',
    phoneNumber: '(702) 555-0133',
    address: '570 N Nellis Blvd, Las Vegas, NV',
  },
  {
    id: 'company-006',
    name: 'Quality Inspection Center',
    type: 'Inspection Center',
    phoneNumber: '(310) 555-0180',
    address: '9100 Aviation Blvd, Los Angeles, CA',
  },
  {
    id: 'company-007',
    name: 'North Yard Shipping',
    type: 'Shipping',
    phoneNumber: '(404) 555-0194',
    address: '4550 Fulton Industrial Blvd, Atlanta, GA',
  },
]

export const expensesMockData: Expense[] = [
  {
    id: 'expense-001',
    carId: 'car-001',
    carName: 'Toyota Camry 2020',
    expenseType: 'Purchase',
    amount: 9800,
    paidBy: 'North Yard Partners',
    paymentMethod: 'Zelle',
    date: '2026-03-18',
    notes: 'Auction purchase payment',
    invoiceName: 'auction-invoice-toyota-camry.pdf',
  },
  {
    id: 'expense-002',
    carId: 'car-001',
    carName: 'Toyota Camry 2020',
    expenseType: 'Repair',
    amount: 1700,
    paidBy: 'Maya S.',
    paymentMethod: 'Card',
    date: '2026-04-01',
    notes: 'Front bumper and paint work',
    invoiceName: 'repair-invoice-camry.jpg',
  },
  {
    id: 'expense-003',
    carId: 'car-002',
    carName: 'Honda Civic 2019',
    expenseType: 'Shipping',
    amount: 520,
    paidBy: 'Alpha Capital',
    paymentMethod: 'Cash',
    date: '2026-04-04',
    notes: 'Transport from auction yard',
    invoiceName: 'shipping-receipt-civic.pdf',
  },
  {
    id: 'expense-004',
    carId: 'car-003',
    carName: 'BMW X5 2021',
    expenseType: 'Parts',
    amount: 900,
    paidBy: 'Sara K.',
    paymentMethod: 'Card',
    date: '2026-03-15',
    notes: 'OEM sensors and molding kit',
    invoiceName: 'parts-bmw-x5.pdf',
  },
  {
    id: 'expense-005',
    carId: 'car-003',
    carName: 'BMW X5 2021',
    expenseType: 'Inspection',
    amount: 220,
    paidBy: 'Premium Auto Fund',
    paymentMethod: 'Zelle',
    date: '2026-05-01',
    notes: 'Pre-sale inspection',
    invoiceName: 'inspection-bmw-x5.pdf',
  },
  {
    id: 'expense-006',
    carId: 'car-004',
    carName: 'Ford Explorer 2018',
    expenseType: 'Labor',
    amount: 400,
    paidBy: 'West Coast Investors',
    paymentMethod: 'Card',
    date: '2026-01-06',
    notes: 'Transmission labor',
    invoiceName: 'labor-ford-explorer.pdf',
  },
  {
    id: 'expense-007',
    carId: 'car-005',
    carName: 'Mercedes-Benz C-Class 2022',
    expenseType: 'Fees',
    amount: 250,
    paidBy: 'Nadia F.',
    paymentMethod: 'Zelle',
    date: '2026-05-11',
    notes: 'Auction and filing fees',
    invoiceName: 'fees-mercedes-c-class.pdf',
  },
  {
    id: 'expense-008',
    carId: 'car-005',
    carName: 'Mercedes-Benz C-Class 2022',
    expenseType: 'Other',
    amount: 150,
    paidBy: 'Nadia F.',
    paymentMethod: 'Cash',
    date: '2026-05-13',
    notes: 'Photography and listing prep',
    invoiceName: 'misc-mercedes-c-class.jpg',
  },
]

export const partsMockData: Part[] = [
  {
    id: 'part-001',
    partName: 'Front Bumper',
    price: 540,
    supplierId: 'company-004',
    supplierName: 'OEM Parts Depot',
    purchaseDate: '2026-03-24',
    installed: true,
    relatedCarId: 'car-001',
    relatedCarName: 'Toyota Camry 2020',
    invoiceName: 'front-bumper-camry.pdf',
  },
  {
    id: 'part-002',
    partName: 'Headlight Set',
    price: 160,
    supplierId: 'company-004',
    supplierName: 'OEM Parts Depot',
    purchaseDate: '2026-03-25',
    installed: false,
    relatedCarId: 'car-001',
    relatedCarName: 'Toyota Camry 2020',
    invoiceName: 'headlight-camry.jpg',
  },
  {
    id: 'part-003',
    partName: 'Brake Pads',
    price: 120,
    supplierId: 'company-004',
    supplierName: 'OEM Parts Depot',
    purchaseDate: '2026-04-06',
    installed: true,
    relatedCarId: 'car-002',
    relatedCarName: 'Honda Civic 2019',
    invoiceName: 'brake-pads-civic.pdf',
  },
  {
    id: 'part-004',
    partName: 'Rear Sensor',
    price: 410,
    supplierId: 'company-004',
    supplierName: 'OEM Parts Depot',
    purchaseDate: '2026-03-03',
    installed: true,
    relatedCarId: 'car-003',
    relatedCarName: 'BMW X5 2021',
    invoiceName: 'rear-sensor-bmw.pdf',
  },
  {
    id: 'part-005',
    partName: 'Inventory Mirror Assembly',
    price: 95,
    supplierId: 'company-004',
    supplierName: 'OEM Parts Depot',
    purchaseDate: '2026-05-18',
    installed: false,
    relatedCarId: null,
    invoiceName: 'mirror-assembly.pdf',
  },
]

export const inspectionsMockData: Inspection[] = [
  {
    id: 'inspection-001',
    carId: 'car-001',
    carName: 'Toyota Camry 2020',
    date: '2026-05-22',
    time: '10:30 AM',
    placeId: 'company-006',
    place: 'Quality Inspection Center',
    status: 'Pending',
    notes: 'Required before listing',
    files: ['inspection-order.pdf'],
    receipts: ['inspection-receipt.jpg'],
    beforeImages: ['camry-before-1.jpg'],
    afterImages: [],
    reminderSent: true,
  },
  {
    id: 'inspection-001b',
    carId: 'car-001',
    carName: 'Toyota Camry 2020',
    date: '2026-05-30',
    time: '03:15 PM',
    placeId: 'company-006',
    place: 'Quality Inspection Center',
    status: 'Passed',
    notes: 'Sample passed inspection added for testing the Rebuilt button.',
    files: ['camry-passed-inspection.pdf'],
    receipts: ['camry-passed-receipt.jpg'],
    beforeImages: ['camry-before-passed.jpg'],
    afterImages: ['camry-after-passed.jpg'],
    reminderSent: false,
  },
  {
    id: 'inspection-002',
    carId: 'car-003',
    carName: 'BMW X5 2021',
    date: '2026-05-21',
    time: '02:00 PM',
    placeId: 'company-006',
    place: 'Quality Inspection Center',
    status: 'Passed',
    notes: 'Full check passed after rebuild conversion',
    files: ['bmw-x5-inspection.pdf'],
    receipts: ['bmw-x5-receipt.pdf'],
    beforeImages: ['bmw-before.jpg'],
    afterImages: ['bmw-after.jpg'],
    reminderSent: false,
  },
  {
    id: 'inspection-003',
    carId: 'car-005',
    carName: 'Mercedes-Benz C-Class 2022',
    date: '2026-05-23',
    time: '09:00 AM',
    placeId: 'company-006',
    place: 'Quality Inspection Center',
    status: 'Failed',
    notes: 'Headlamp replacement needed before recheck',
    files: ['mercedes-inspection.pdf'],
    receipts: ['mercedes-receipt.pdf'],
    beforeImages: ['mercedes-before.jpg'],
    afterImages: [],
    reminderSent: true,
  },
]

export function getCarById(carId: string) {
  return carsMockData.find((car) => car.id === carId)
}

export function getCompanyById(companyId: string) {
  return companiesMockData.find((company) => company.id === companyId)
}

export function getExpenseById(expenseId: string) {
  return expensesMockData.find((expense) => expense.id === expenseId)
}

export function getPartById(partId: string) {
  return partsMockData.find((part) => part.id === partId)
}

export function getInspectionById(inspectionId: string) {
  return inspectionsMockData.find(
    (inspection) => inspection.id === inspectionId
  )
}

export function getExpensesByCarId(carId: string) {
  return expensesMockData.filter((expense) => expense.carId === carId)
}

export function getPartsByCarId(carId: string) {
  return partsMockData.filter((part) => part.relatedCarId === carId)
}

export function getInspectionsByCarId(carId: string) {
  return inspectionsMockData.filter((inspection) => inspection.carId === carId)
}

export function calculateCarExpenseSummary(carId: string) {
  const expenses = getExpensesByCarId(carId)
  const summary = {
    purchase: 0,
    shipping: 0,
    repair: 0,
    parts: 0,
    labor: 0,
    inspection: 0,
    fees: 0,
    other: 0,
  }

  expenses.forEach((expense) => {
    summary[expense.expenseType.toLowerCase() as keyof typeof summary] +=
      expense.amount
  })

  const totalCost = Object.values(summary).reduce(
    (sum, value) => sum + value,
    0
  )

  return {
    ...summary,
    totalCost,
  }
}

export function calculateCarProfit(
  car: Pick<Car, 'sellingPrice' | 'purchasePrice'> & { totalCost: number }
) {
  return car.sellingPrice - car.totalCost
}

export function getDashboardTotals() {
  const totalPurchasePrice = carsMockData.reduce(
    (sum, car) => sum + car.purchasePrice,
    0
  )
  const totalSellingPrice = carsMockData.reduce(
    (sum, car) => sum + car.sellingPrice,
    0
  )
  const totalExpenses = expensesMockData.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )
  const totalProfit = totalSellingPrice - totalExpenses
  const totalParts = partsMockData.length
  const installedParts = partsMockData.filter((part) => part.installed).length
  const pendingParts = totalParts - installedParts
  const salvageCars = carsMockData.filter(
    (car) => car.titleType === 'Salvage'
  ).length
  const totalInspections = inspectionsMockData.length
  const pendingInspections = inspectionsMockData.filter(
    (inspection) => inspection.status === 'Pending'
  ).length
  const failedInspections = inspectionsMockData.filter(
    (inspection) => inspection.status === 'Failed'
  ).length

  return {
    totalPurchasePrice,
    totalSellingPrice,
    totalExpenses,
    totalProfit,
    totalParts,
    installedParts,
    pendingParts,
    salvageCars,
    totalInspections,
    pendingInspections,
    failedInspections,
  }
}
