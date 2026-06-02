import { type ReactNode } from 'react'
import { type CarStatus } from '@/data/carsMockData'
import {
  type ExpenseType,
  type PaymentMethod,
} from '@/data/dealerOperationsMockData'
import { type LucideIcon } from 'lucide-react'

export type ReportKind = 'car' | 'profit' | 'expenses' | 'partner'

export type ReportFilterValues = {
  startDate: string
  endDate: string
  carId: string
  partnerId: string
  expenseType: string
  companyPlace: string
  payer: string
  status: string
}

export type ReportOption = {
  value: string
  label: string
}

export type ReportSummaryItem = {
  label: string
  value: string
  icon?: LucideIcon
  tone?: string
}

export type ReportColumn<T> = {
  key: string
  header: ReactNode
  className?: string
  render: (row: T) => ReactNode
}

export type ReportCar = {
  id: string
  name: string
  brand: string
  model: string
  year: number
  vin: string
  lotNumber: string
  titleType: string
  status: CarStatus
  purchaseDate: string
  purchasePlace: string
  costBreakdown: {
    purchase: number
    shipping: number
    inspection: number
    repair: number
    parts: number
    labor: number
    fees: number
    other: number
  }
  totalCost: number
  sellingPrice: number
  netProfit: number
}

export type CarPartnerReportRow = {
  id: string
  partner: string
  contribution: number
  percentage: number
  partnerProfitShare: number
}

export type ProfitReportRow = {
  id: string
  car: string
  status: CarStatus
  purchaseDate: string
  totalCost: number
  sellingPrice: number
  netProfit: number
}

export type ExpenseReportRow = {
  id: string
  date: string
  carId: string
  car: string
  expenseType: ExpenseType
  companyPlace: string
  payer: string
  amount: number
  paymentMethod: PaymentMethod
}

export type PartnerReportRow = {
  id: string
  carId: string
  car: string
  contribution: number
  percentage: number
  carProfitLoss: number
  partnerShare: number
  contributionDate: string
}
