import { carsMockData, formatCarName } from '@/data/carsMockData'
import {
  expensesMockData,
  type ExpenseType,
} from '@/data/dealerOperationsMockData'
import {
  partnerContributionsMock,
  partnersMockData,
} from '@/features/partners/data/partnersMockData'
import {
  type CarPartnerReportRow,
  type ExpenseReportRow,
  type PartnerReportRow,
  type ProfitReportRow,
  type ReportCar,
} from './schema'

const extraReportCars: ReportCar[] = [
  {
    id: 'mock-loss-001',
    name: 'Ford Fusion 2018',
    brand: 'Ford',
    model: 'Fusion',
    year: 2018,
    vin: '3FA6P0HD4JR123006',
    lotNumber: 'LOT-2406',
    titleType: 'Rebuilt',
    status: 'sold',
    purchaseDate: '2026-01-10',
    purchasePlace: 'Detroit Insurance Auction',
    costBreakdown: {
      purchase: 6900,
      shipping: 420,
      inspection: 180,
      repair: 0,
      parts: 0,
      labor: 0,
      fees: 0,
      other: 1000,
    },
    totalCost: 8500,
    sellingPrice: 8000,
    netProfit: -500,
  },
]

const extraReportExpenses: ExpenseReportRow[] = [
  {
    id: 'report-expense-009',
    date: '2026-01-10',
    carId: 'mock-loss-001',
    car: 'Ford Fusion 2018',
    expenseType: 'Purchase',
    companyPlace: 'Detroit Insurance Auction',
    payer: 'Workshop Team',
    amount: 6900,
    paymentMethod: 'Cash',
  },
  {
    id: 'report-expense-010',
    date: '2026-01-14',
    carId: 'mock-loss-001',
    car: 'Ford Fusion 2018',
    expenseType: 'Shipping',
    companyPlace: 'North Yard Shipping',
    payer: 'Workshop Team',
    amount: 420,
    paymentMethod: 'Card',
  },
  {
    id: 'report-expense-011',
    date: '2026-01-22',
    carId: 'mock-loss-001',
    car: 'Ford Fusion 2018',
    expenseType: 'Inspection',
    companyPlace: 'Quality Inspection Center',
    payer: 'Workshop Team',
    amount: 180,
    paymentMethod: 'Zelle',
  },
]

export const reportExpenseTypes: ExpenseType[] = [
  'Purchase',
  'Shipping',
  'Repair',
  'Parts',
  'Labor',
  'Inspection',
  'Fees',
  'Other',
]

export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(value: string) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function getInspectionCost(carId: string) {
  return expensesMockData
    .filter(
      (expense) =>
        expense.carId === carId && expense.expenseType === 'Inspection'
    )
    .reduce((sum, expense) => sum + expense.amount, 0)
}

function normalizeCarCosts(car: (typeof carsMockData)[number]): ReportCar {
  const inspection = getInspectionCost(car.id)
  const baseBreakdown = {
    purchase: car.costBreakdown.purchase,
    shipping: car.costBreakdown.shipping,
    inspection,
    repair: car.costBreakdown.repair,
    parts: car.costBreakdown.parts,
    labor: car.costBreakdown.labor,
    fees: car.costBreakdown.fees,
    other: car.costBreakdown.other,
  }
  const totalCost = Object.values(baseBreakdown).reduce(
    (sum, value) => sum + value,
    0
  )

  return {
    id: car.id,
    name: formatCarName(car),
    brand: car.brand,
    model: car.model,
    year: car.year,
    vin: car.vin,
    lotNumber: car.lotNumber,
    titleType: car.currentTitle.type,
    status: car.status,
    purchaseDate: car.purchaseDate,
    purchasePlace: car.purchasePlace,
    costBreakdown: baseBreakdown,
    totalCost,
    sellingPrice: car.sellingPrice,
    netProfit: car.sellingPrice - totalCost,
  }
}

export const reportCars: ReportCar[] = [
  ...carsMockData.map(normalizeCarCosts),
  ...extraReportCars,
]

export const carOptions = reportCars.map((car) => ({
  value: car.id,
  label: car.name,
}))

export const partnerOptions = partnersMockData.map((partner) => ({
  value: partner.id,
  label: partner.name,
}))

export function getReportCarById(carId: string) {
  return reportCars.find((car) => car.id === carId)
}

function getExpenseCompanyPlace(expense: (typeof expensesMockData)[number]) {
  const car = getReportCarById(expense.carId)

  if (expense.expenseType === 'Purchase') return car?.purchasePlace ?? '-'
  if (expense.expenseType === 'Shipping') return 'North Yard Shipping'
  if (expense.expenseType === 'Repair') return 'Metro Body Shop'
  if (expense.expenseType === 'Parts') return 'OEM Parts Depot'
  if (expense.expenseType === 'Inspection') return 'Quality Inspection Center'
  if (expense.expenseType === 'Fees') return car?.purchasePlace ?? '-'

  return car?.purchasePlace ?? 'Operations Desk'
}

export const expensesReportRows: ExpenseReportRow[] = [
  ...expensesMockData.map((expense) => ({
    id: expense.id,
    date: expense.date,
    carId: expense.carId,
    car: expense.carName,
    expenseType: expense.expenseType,
    companyPlace: getExpenseCompanyPlace(expense),
    payer: expense.paidBy,
    amount: expense.amount,
    paymentMethod: expense.paymentMethod,
  })),
  ...extraReportExpenses,
]

export const companyPlaceOptions = Array.from(
  new Set(expensesReportRows.map((expense) => expense.companyPlace))
).map((companyPlace) => ({
  value: companyPlace,
  label: companyPlace,
}))

export const payerOptions = Array.from(
  new Set(expensesReportRows.map((expense) => expense.payer))
).map((payer) => ({
  value: payer,
  label: payer,
}))

export const statusOptions = Array.from(
  new Set(reportCars.map((car) => car.status))
).map((status) => ({
  value: status,
  label: status,
}))

export function getCarPartnerRows(carId: string): CarPartnerReportRow[] {
  const car = getReportCarById(carId)

  if (!car) return []

  return partnerContributionsMock
    .filter((contribution) => contribution.carId === carId)
    .map((contribution) => {
      const partner = partnersMockData.find(
        (item) => item.id === contribution.partnerId
      )

      return {
        id: contribution.id,
        partner: partner?.name ?? contribution.partnerId,
        contribution: contribution.contributionAmount,
        percentage: contribution.investmentPercentage,
        partnerProfitShare:
          (car.netProfit * contribution.investmentPercentage) / 100,
      }
    })
}

export function getProfitReportRows(): ProfitReportRow[] {
  return reportCars.map((car) => ({
    id: car.id,
    car: car.name,
    status: car.status,
    purchaseDate: car.purchaseDate,
    totalCost: car.totalCost,
    sellingPrice: car.sellingPrice,
    netProfit: car.netProfit,
  }))
}

export function getPartnerReportRows(partnerId: string): PartnerReportRow[] {
  return partnerContributionsMock
    .filter((contribution) => contribution.partnerId === partnerId)
    .map((contribution) => {
      const car = getReportCarById(contribution.carId)
      const carProfitLoss = car?.netProfit ?? 0

      return {
        id: contribution.id,
        carId: contribution.carId,
        car: car?.name ?? contribution.carName,
        contribution: contribution.contributionAmount,
        percentage: contribution.investmentPercentage,
        carProfitLoss,
        partnerShare: (carProfitLoss * contribution.investmentPercentage) / 100,
        contributionDate: contribution.contributionDate,
      }
    })
}

export function getPartnerReportSummary(partnerId: string) {
  const partner = partnersMockData.find((item) => item.id === partnerId)
  const rows = getPartnerReportRows(partnerId)
  const totalContribution = rows.reduce((sum, row) => sum + row.contribution, 0)
  const totalProfit = rows.reduce(
    (sum, row) => (row.partnerShare > 0 ? sum + row.partnerShare : sum),
    0
  )
  const totalLoss = rows.reduce(
    (sum, row) =>
      row.partnerShare < 0 ? sum + Math.abs(row.partnerShare) : sum,
    0
  )

  return {
    partner,
    rows,
    totalContribution,
    totalProfit,
    totalLoss,
    finalBalance: totalContribution + totalProfit - totalLoss,
  }
}

export function isInsideDateRange(
  date: string,
  startDate: string,
  endDate: string
) {
  if (startDate && date < startDate) return false
  if (endDate && date > endDate) return false

  return true
}
