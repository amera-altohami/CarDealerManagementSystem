import type { CurrentTitle, TitleHistoryEntry } from '@/features/cars/types/title'

export type CarStatus =
  | 'purchased'
  | 'shipping'
  | 'repairing'
  | 'ready-for-sale'
  | 'sold'

export type CarTitleType = 'Clean' | 'Salvage' | 'Rebuilt' | 'Parts Only'

export type CarExpense = {
  id: string
  label: string
  amount: number
  date: string
}

export type CarPart = {
  id: string
  name: string
  vendor: string
  cost: number
}

export type CarInspection = {
  id: string
  schedule: string
  inspector: string
  status: 'Pending' | 'Completed' | 'Delayed'
}

export type CarPartner = {
  id: string
  name: string
  share: string
  investment: number
}

export type CarDocument = {
  id: string
  name: string
  type: 'Carfax' | 'PDF' | 'Receipt' | 'Title'
}

export type Car = {
  id: string
  brand: string
  model: string
  year: number
  vin: string
  lotNumber: string
  status: CarStatus
  titleType: CarTitleType
  currentTitle: CurrentTitle
  titleHistory: TitleHistoryEntry[]
  purchaseDate: string
  purchasePlace: string
  carfaxType: 'link' | 'pdf'
  carfaxLink: string
  carfaxPdfName: string
  carfaxPdfUrl: string
  notes: string
  photo: string
  totalCost: number
  sellingPrice: number
  netProfit: number
  costBreakdown: {
    purchase: number
    shipping: number
    repair: number
    parts: number
    labor: number
    fees: number
    other: number
  }
  expenses: CarExpense[]
  parts: CarPart[]
  inspections: CarInspection[]
  partners: CarPartner[]
  documents: CarDocument[]
}

export type Transaction = {
  id: string
  car: string
  type: string
  amount: number
  date: string
  status: 'Completed' | 'Pending' | 'Delayed'
}

export type AlertItem = {
  id: string
  title: string
  description: string
  severity: 'warning' | 'critical'
  car: string
}

export const carStatusOptions: Array<{ value: CarStatus; label: string }> = [
  { value: 'purchased', label: 'Purchased' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'repairing', label: 'Repairing' },
  { value: 'ready-for-sale', label: 'Ready For Sale' },
  { value: 'sold', label: 'Sold' },
]

export const titleTypeOptions: CarTitleType[] = [
  'Clean',
  'Salvage',
  'Rebuilt',
  'Parts Only',
]

export const carsMockData: Car[] = [
  {
    id: 'car-001',
    brand: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: '4T1BF1FK5LU123001',
    lotNumber: 'LOT-2401',
    status: 'repairing',
    titleType: 'Clean',
    currentTitle: {
      type: 'Clean',
      lastUpdatedAt: '2026-04-15',
      updatedBy: 'Maya S.',
    },
    titleHistory: [
      {
        id: 'title-001-1',
        previousTitleType: 'Clean',
        newTitleType: 'Clean',
        changeDate: '2026-03-18',
        updatedBy: 'System',
        notes: 'Initial title recorded at purchase.',
      },
    ],
    purchaseDate: '2026-03-18',
    purchasePlace: 'Dallas Auto Auction',
    carfaxType: 'pdf',
    carfaxLink: '',
    carfaxPdfName: 'toyota-camry-2020-carfax.pdf',
    carfaxPdfUrl: '',
    notes: 'Front bumper replacement pending. Mechanical inspection completed.',
    photo: '/images/car-placeholder.svg',
    totalCost: 13250,
    sellingPrice: 16890,
    netProfit: 3640,
    costBreakdown: {
      purchase: 9800,
      shipping: 650,
      repair: 1700,
      parts: 700,
      labor: 200,
      fees: 150,
      other: 50,
    },
    expenses: [
      { id: 'exp-1', label: 'Auction Purchase', amount: 9800, date: '2026-03-18' },
      { id: 'exp-2', label: 'Transport', amount: 650, date: '2026-03-20' },
      { id: 'exp-3', label: 'Body Repair', amount: 1700, date: '2026-04-01' },
    ],
    parts: [
      { id: 'part-1', name: 'Front Bumper', vendor: 'OEM Depot', cost: 540 },
      { id: 'part-2', name: 'Headlight Set', vendor: 'AutoZone', cost: 160 },
    ],
    inspections: [
      { id: 'insp-1', schedule: '2026-05-22', inspector: 'Hassan A.', status: 'Pending' },
      { id: 'insp-2', schedule: '2026-05-29', inspector: 'Workshop QA', status: 'Delayed' },
    ],
    partners: [
      { id: 'partner-1', name: 'North Yard Partners', share: '45%', investment: 4800 },
      { id: 'partner-2', name: 'Workshop Team', share: '15%', investment: 1600 },
    ],
    documents: [
      { id: 'doc-1', name: 'Carfax Report', type: 'Carfax' },
      { id: 'doc-2', name: 'Purchase Receipt', type: 'Receipt' },
    ],
  },
  {
    id: 'car-002',
    brand: 'Honda',
    model: 'Civic',
    year: 2019,
    vin: '19XFC2F69KE123002',
    lotNumber: 'LOT-2402',
    status: 'shipping',
    titleType: 'Clean',
    currentTitle: {
      type: 'Clean',
      lastUpdatedAt: '2026-04-05',
      updatedBy: 'Ali R.',
    },
    titleHistory: [
      {
        id: 'title-002-1',
        previousTitleType: 'Clean',
        newTitleType: 'Clean',
        changeDate: '2026-04-02',
        updatedBy: 'System',
        notes: 'Initial title recorded at purchase.',
      },
    ],
    purchaseDate: '2026-04-02',
    purchasePlace: 'Phoenix Auction Center',
    carfaxType: 'link',
    carfaxLink: 'https://example.com/carfax/honda-civic-2019.pdf',
    carfaxPdfName: '',
    carfaxPdfUrl: '',
    notes: 'Arriving this week. Ready for intake and photography.',
    photo: '/images/car-placeholder.svg',
    totalCost: 10950,
    sellingPrice: 13950,
    netProfit: 3000,
    costBreakdown: {
      purchase: 8200,
      shipping: 520,
      repair: 900,
      parts: 500,
      labor: 250,
      fees: 450,
      other: 130,
    },
    expenses: [
      { id: 'exp-4', label: 'Auction Purchase', amount: 8200, date: '2026-04-02' },
      { id: 'exp-5', label: 'Shipping', amount: 520, date: '2026-04-04' },
    ],
    parts: [
      { id: 'part-3', name: 'Brake Pads', vendor: 'Parts Mart', cost: 120 },
    ],
    inspections: [
      { id: 'insp-3', schedule: '2026-05-20', inspector: 'Yousef K.', status: 'Pending' },
    ],
    partners: [
      { id: 'partner-3', name: 'Alpha Capital', share: '60%', investment: 6200 },
    ],
    documents: [
      { id: 'doc-3', name: 'Carfax Report', type: 'Carfax' },
    ],
  },
  {
    id: 'car-003',
    brand: 'BMW',
    model: 'X5',
    year: 2021,
    vin: '5UXCR6C58M9C12303',
    lotNumber: 'LOT-2403',
    status: 'ready-for-sale',
    titleType: 'Clean',
    currentTitle: {
      type: 'Rebuilt',
      lastUpdatedAt: '2026-05-02',
      updatedBy: 'Sara K.',
    },
    titleHistory: [
      {
        id: 'title-003-1',
        previousTitleType: 'Clean',
        newTitleType: 'Salvage',
        changeDate: '2026-02-16',
        updatedBy: 'Auction Desk',
        notes: 'Salvage title issued after insurance review.',
      },
      {
        id: 'title-003-2',
        previousTitleType: 'Salvage',
        newTitleType: 'Rebuilt',
        changeDate: '2026-05-02',
        updatedBy: 'Sara K.',
        notes: 'Converted after repairs and inspection.',
      },
    ],
    purchaseDate: '2026-02-14',
    purchasePlace: 'Chicago Dealer Exchange',
    carfaxType: 'pdf',
    carfaxLink: '',
    carfaxPdfName: 'bmw-x5-2021-carfax.pdf',
    carfaxPdfUrl: '',
    notes: 'Fully detailed, photographed, and listed for sale.',
    photo: '/images/car-placeholder.svg',
    totalCost: 28740,
    sellingPrice: 32990,
    netProfit: 4250,
    costBreakdown: {
      purchase: 24400,
      shipping: 700,
      repair: 1800,
      parts: 900,
      labor: 500,
      fees: 300,
      other: 140,
    },
    expenses: [
      { id: 'exp-6', label: 'Auction Purchase', amount: 24400, date: '2026-02-14' },
      { id: 'exp-7', label: 'Interior Repair', amount: 1800, date: '2026-03-08' },
      { id: 'exp-8', label: 'Detailing', amount: 500, date: '2026-04-12' },
    ],
    parts: [
      { id: 'part-4', name: 'Rear Sensor', vendor: 'BMW Parts', cost: 410 },
      { id: 'part-5', name: 'Molding Kit', vendor: 'Euro Supply', cost: 490 },
    ],
    inspections: [
      { id: 'insp-4', schedule: '2026-05-21', inspector: 'Quality Bay 2', status: 'Completed' },
    ],
    partners: [
      { id: 'partner-4', name: 'Premium Auto Fund', share: '50%', investment: 14000 },
      { id: 'partner-5', name: 'Retail Team', share: '10%', investment: 2800 },
    ],
    documents: [
      { id: 'doc-4', name: 'Title Scan', type: 'Title' },
      { id: 'doc-5', name: 'Carfax Report', type: 'Carfax' },
    ],
  },
  {
    id: 'car-004',
    brand: 'Ford',
    model: 'Explorer',
    year: 2018,
    vin: '1FM5K8D89JGB12304',
    lotNumber: 'LOT-2404',
    status: 'sold',
    titleType: 'Rebuilt',
    currentTitle: {
      type: 'Rebuilt',
      lastUpdatedAt: '2026-04-28',
      updatedBy: 'Omar H.',
    },
    titleHistory: [
      {
        id: 'title-004-1',
        previousTitleType: 'Salvage',
        newTitleType: 'Rebuilt',
        changeDate: '2026-04-28',
        updatedBy: 'Omar H.',
        notes: 'Converted after structural repairs were completed.',
      },
    ],
    purchaseDate: '2025-12-09',
    purchasePlace: 'Atlanta Insurance Auction',
    carfaxType: 'link',
    carfaxLink: 'https://example.com/carfax/ford-explorer-2018.pdf',
    carfaxPdfName: '',
    carfaxPdfUrl: '',
    notes: 'Sold last week and awaiting customer pickup documents.',
    photo: '/images/car-placeholder.svg',
    totalCost: 15410,
    sellingPrice: 18950,
    netProfit: 3540,
    costBreakdown: {
      purchase: 11500,
      shipping: 780,
      repair: 1600,
      parts: 860,
      labor: 400,
      fees: 200,
      other: 70,
    },
    expenses: [
      { id: 'exp-9', label: 'Auction Purchase', amount: 11500, date: '2025-12-09' },
      { id: 'exp-10', label: 'Shipping', amount: 780, date: '2025-12-12' },
      { id: 'exp-11', label: 'Transmission Repair', amount: 1600, date: '2026-01-06' },
    ],
    parts: [
      { id: 'part-6', name: 'Transmission Mount', vendor: 'Ford OEM', cost: 310 },
    ],
    inspections: [
      { id: 'insp-5', schedule: '2026-05-01', inspector: 'Final QA', status: 'Completed' },
    ],
    partners: [
      { id: 'partner-6', name: 'West Coast Investors', share: '35%', investment: 5400 },
    ],
    documents: [
      { id: 'doc-6', name: 'Customer Contract', type: 'PDF' },
      { id: 'doc-7', name: 'Title Document', type: 'Title' },
    ],
  },
  {
    id: 'car-005',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2022,
    vin: 'W1KAF4HB0NR123005',
    lotNumber: 'LOT-2405',
    status: 'purchased',
    titleType: 'Clean',
    currentTitle: {
      type: 'Clean',
      lastUpdatedAt: '2026-05-10',
      updatedBy: 'Nadia F.',
    },
    titleHistory: [
      {
        id: 'title-005-1',
        previousTitleType: 'Clean',
        newTitleType: 'Clean',
        changeDate: '2026-03-10',
        updatedBy: 'System',
        notes: 'Initial title recorded at purchase.',
      },
    ],
    purchaseDate: '2026-05-11',
    purchasePlace: 'Los Angeles Auto Hub',
    carfaxType: 'pdf',
    carfaxLink: '',
    carfaxPdfName: 'mercedes-c-class-2022-carfax.pdf',
    carfaxPdfUrl: '',
    notes: 'Recently purchased. Needs intake inspection and shipping arrangement.',
    photo: '/images/car-placeholder.svg',
    totalCost: 41800,
    sellingPrice: 46900,
    netProfit: 5100,
    costBreakdown: {
      purchase: 38900,
      shipping: 0,
      repair: 1200,
      parts: 500,
      labor: 800,
      fees: 250,
      other: 150,
    },
    expenses: [
      { id: 'exp-12', label: 'Auction Purchase', amount: 38900, date: '2026-05-11' },
    ],
    parts: [],
    inspections: [
      { id: 'insp-6', schedule: '2026-05-23', inspector: 'Intake Team', status: 'Pending' },
    ],
    partners: [
      { id: 'partner-7', name: 'Luxury Fleet Partners', share: '70%', investment: 29300 },
    ],
    documents: [
      { id: 'doc-8', name: 'Auction Receipt', type: 'Receipt' },
    ],
  },
]

export const latestTransactionsMock: Transaction[] = [
  {
    id: 'tx-001',
    car: 'Toyota Camry 2020',
    type: 'Repair payment',
    amount: 1700,
    date: '2026-05-17',
    status: 'Completed',
  },
  {
    id: 'tx-002',
    car: 'BMW X5 2021',
    type: 'Final sale',
    amount: 32990,
    date: '2026-05-16',
    status: 'Completed',
  },
  {
    id: 'tx-003',
    car: 'Honda Civic 2019',
    type: 'Shipping invoice',
    amount: 520,
    date: '2026-05-15',
    status: 'Pending',
  },
]

export const delayedCarsMock: AlertItem[] = [
  {
    id: 'alert-001',
    title: 'Inspection overdue',
    description: 'Toyota Camry 2020 needs a follow-up inspection before sale.',
    severity: 'critical',
    car: 'Toyota Camry 2020',
  },
  {
    id: 'alert-002',
    title: 'Shipping delay',
    description: 'Honda Civic 2019 shipment has not been updated for 3 days.',
    severity: 'warning',
    car: 'Honda Civic 2019',
  },
  {
    id: 'alert-003',
    title: 'Repair schedule slip',
    description: 'Mercedes-Benz C-Class 2022 needs repair slot confirmation.',
    severity: 'warning',
    car: 'Mercedes-Benz C-Class 2022',
  },
]

export function getCarById(carId: string) {
  return carsMockData.find((car) => car.id === carId)
}

export function formatCarName(car: Pick<Car, 'brand' | 'model' | 'year'>) {
  return `${car.brand} ${car.model} ${car.year}`
}
