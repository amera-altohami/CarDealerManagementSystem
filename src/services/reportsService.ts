import type { ExpenseType } from '@/types/dealer'
import type {
  Partner,
  PartnerContribution,
  ProfitShare,
} from '@/features/partners/data/schema'
import type {
  CarPartnerReportRow,
  ExpenseReportRow,
  PartnerReportRow,
  ProfitReportRow,
  ReportCar,
  ReportFilterValues,
  ReportOption,
} from '@/features/reports/data/schema'
import { formatCarName, getCars, type Car } from './carsService'
import { getAllCompanies } from './companiesService'
import { getExpenses, type Expense } from './expensesService'
import { getPartnerContributions } from './partnerContributionsService'
import { getPartners } from './partnersService'
import { getProfitShares } from './profitSharesService'

type CostBreakdownKey = keyof ReportCar['costBreakdown']

type ReportContext = {
  cars: Car[]
  expenses: Expense[]
  partners: Partner[]
  contributions: PartnerContribution[]
  profitShares: ProfitShare[]
  carMap: Map<string, Car>
  partnerMap: Map<string, Partner>
  companyNameMap: Map<string, string>
}

export type CarReportResult = {
  cars: ReportCar[]
  carOptions: ReportOption[]
  partnerRowsByCarId: Record<string, CarPartnerReportRow[]>
}

export type ExpensesReportResult = {
  rows: ExpenseReportRow[]
  carOptions: ReportOption[]
  expenseTypeOptions: ReportOption[]
  companyPlaceOptions: ReportOption[]
  payerOptions: ReportOption[]
}

export type PartnerReportSummary = {
  partner?: Partner
  rows: PartnerReportRow[]
  totalContribution: number
  totalProfit: number
  totalLoss: number
  finalBalance: number
}

export type PartnerReportResult = {
  partners: Partner[]
  partnerOptions: ReportOption[]
  summariesByPartnerId: Record<string, PartnerReportSummary>
}

export type ReportSummary = {
  carsCount: number
  totalSales: number
  totalCosts: number
  netProfit: number
  totalExpenses: number
  totalContributions: number
  totalPartnerProfit: number
  totalPartnerLoss: number
  totalPartnerBalance: number
}

export type ExpenseByTypeRow = {
  expenseType: ExpenseType
  amount: number
}

export type PartnerBalanceRow = {
  partnerId: string
  partner: string
  totalContribution: number
  totalProfit: number
  totalLoss: number
  finalBalance: number
}

export const reportExpenseTypes: ExpenseType[] = [
  'Purchase',
  'Shipping',
  'Repair',
  'Parts',
  'Labor',
  'Inspection',
  'Fees',
  'Bills',
  'Other',
]

const expenseTypeCostKeys: Record<ExpenseType, CostBreakdownKey> = {
  Purchase: 'purchase',
  Shipping: 'shipping',
  Repair: 'repair',
  Parts: 'parts',
  Labor: 'labor',
  Inspection: 'inspection',
  Fees: 'fees',
  Bills: 'bills',
  Other: 'other',
}

async function getReportContext(): Promise<ReportContext> {
  const [cars, expenses, partners, contributions, profitShares, companies] =
    await Promise.all([
      getCars(),
      getExpenses(),
      getPartners(),
      getPartnerContributions(),
      getProfitShares(),
      getAllCompanies(),
    ])

  return {
    cars,
    expenses,
    partners,
    contributions,
    profitShares,
    carMap: new Map(cars.map((car) => [car.id, car])),
    partnerMap: new Map(partners.map((partner) => [partner.id, partner])),
    companyNameMap: new Map(
      companies.map((company) => [company.id, company.name])
    ),
  }
}

function getExpenseRowsForCar(expenses: Expense[], carId: string) {
  return expenses.filter((expense) => expense.carId === carId)
}

function getCostBreakdown(car: Car, expenses: Expense[]) {
  const costBreakdown: ReportCar['costBreakdown'] = {
    purchase: car.purchasePrice,
    shipping: 0,
    inspection: 0,
    repair: 0,
    parts: 0,
    labor: 0,
    fees: 0,
    bills: 0,
    other: 0,
  }

  for (const expense of expenses) {
    const costKey = expenseTypeCostKeys[expense.expenseType]

    if (costKey === 'purchase') {
      continue
    }

    costBreakdown[costKey] += expense.amount
  }

  return costBreakdown
}

function getReportCar(
  car: Car,
  expenses: Expense[],
  companyNameMap: Map<string, string>
): ReportCar {
  const carExpenses = getExpenseRowsForCar(expenses, car.id)
  const totalExpenses = carExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )
  const totalCost = car.purchasePrice + totalExpenses
  const purchasePlace =
    companyNameMap.get(car.purchasePlaceId) ||
    car.purchasePlace ||
    car.purchasePlaceId ||
    '-'

  return {
    id: car.id,
    name: formatCarName(car),
    brand: car.brand,
    model: car.model,
    year: car.year,
    vin: car.vin,
    lotNumber: car.lotNumber,
    titleType: car.currentTitleType || car.titleType,
    status: car.status,
    purchaseDate: car.purchaseDate,
    purchasePlace,
    costBreakdown: getCostBreakdown(car, carExpenses),
    totalCost,
    sellingPrice: car.sellingPrice,
    netProfit: car.sellingPrice - totalCost,
  }
}

function getReportCars(context: ReportContext) {
  return context.cars.map((car) =>
    getReportCar(car, context.expenses, context.companyNameMap)
  )
}

function getProfitShareForContribution(
  profitShares: ProfitShare[],
  contribution: PartnerContribution
) {
  return profitShares.find(
    (profitShare) =>
      profitShare.carId === contribution.carId &&
      profitShare.partnerId === contribution.partnerId
  )
}

function getCarPartnerRows(
  context: ReportContext,
  reportCars: ReportCar[]
): Record<string, CarPartnerReportRow[]> {
  const reportCarMap = new Map(reportCars.map((car) => [car.id, car]))
  const rowsByCarId: Record<string, CarPartnerReportRow[]> = {}

  for (const contribution of context.contributions) {
    const car = reportCarMap.get(contribution.carId)

    if (!car) {
      continue
    }

    const partner = context.partnerMap.get(contribution.partnerId)
    const profitShare = getProfitShareForContribution(
      context.profitShares,
      contribution
    )
    const percentage =
      contribution.investmentPercentage || profitShare?.partnerPercentage || 0
    const partnerProfitShare =
      profitShare?.partnerProfitShare ?? (car.netProfit * percentage) / 100

    rowsByCarId[contribution.carId] = [
      ...(rowsByCarId[contribution.carId] ?? []),
      {
        id: contribution.id,
        partner: partner?.name ?? contribution.partnerId,
        contribution: contribution.contributionAmount,
        percentage,
        partnerProfitShare,
      },
    ]
  }

  return rowsByCarId
}

function isInsideDateRange(date: string, startDate?: string, endDate?: string) {
  if (startDate && date < startDate) return false
  if (endDate && date > endDate) return false

  return true
}

function applyProfitFilters(
  rows: ProfitReportRow[],
  filters?: Partial<ReportFilterValues>
) {
  if (!filters) return rows

  return rows.filter((row) => {
    const matchesDate = isInsideDateRange(
      row.purchaseDate,
      filters.startDate,
      filters.endDate
    )
    const matchesStatus =
      !filters.status ||
      filters.status === 'all' ||
      row.status === filters.status

    return matchesDate && matchesStatus
  })
}

function applyExpenseFilters(
  rows: ExpenseReportRow[],
  filters?: Partial<ReportFilterValues>
) {
  if (!filters) return rows

  return rows.filter((row) => {
    const matchesDate = isInsideDateRange(
      row.date,
      filters.startDate,
      filters.endDate
    )
    const matchesCar =
      !filters.carId || filters.carId === 'all' || row.carId === filters.carId
    const matchesType =
      !filters.expenseType ||
      filters.expenseType === 'all' ||
      row.expenseType === filters.expenseType
    const matchesCompany =
      !filters.companyPlace ||
      filters.companyPlace === 'all' ||
      row.companyPlace === filters.companyPlace
    const matchesPayer =
      !filters.payer || filters.payer === 'all' || row.payer === filters.payer

    return (
      matchesDate && matchesCar && matchesType && matchesCompany && matchesPayer
    )
  })
}

function getUniqueOptions(values: string[]): ReportOption[] {
  return Array.from(new Set(values.filter(Boolean)))
    .sort((left, right) => left.localeCompare(right))
    .map((value) => ({ value, label: value }))
}

function getExpenseCompanyPlace(expense: Expense, context: ReportContext) {
  const car = expense.carId ? context.carMap.get(expense.carId) : undefined

  if (!car) {
    return '-'
  }

  return (
    context.companyNameMap.get(car.purchasePlaceId) ||
    car.purchasePlace ||
    car.purchasePlaceId ||
    '-'
  )
}

function getExpenseReportRows(context: ReportContext): ExpenseReportRow[] {
  return context.expenses.map((expense) => {
    const car = expense.carId ? context.carMap.get(expense.carId) : undefined

    return {
      id: expense.id,
      date: expense.date,
      carId: expense.carId ?? '',
      car: car ? formatCarName(car) : expense.carName || '-',
      expenseType: expense.expenseType,
      companyPlace: getExpenseCompanyPlace(expense, context),
      payer: expense.paidBy,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
    }
  })
}

function getProfitReportRowsFromCars(
  reportCars: ReportCar[]
): ProfitReportRow[] {
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

function getPartnerRows(
  context: ReportContext,
  reportCars: ReportCar[],
  partnerId: string
): PartnerReportRow[] {
  const reportCarMap = new Map(reportCars.map((car) => [car.id, car]))

  return context.contributions
    .filter((contribution) => contribution.partnerId === partnerId)
    .map((contribution) => {
      const car = reportCarMap.get(contribution.carId)
      const profitShare = getProfitShareForContribution(
        context.profitShares,
        contribution
      )
      const carProfitLoss = profitShare?.netProfit ?? car?.netProfit ?? 0
      const percentage =
        contribution.investmentPercentage || profitShare?.partnerPercentage || 0

      return {
        id: contribution.id,
        carId: contribution.carId,
        car: car?.name ?? contribution.carName,
        contribution: contribution.contributionAmount,
        percentage,
        carProfitLoss,
        partnerShare:
          profitShare?.partnerProfitShare ?? (carProfitLoss * percentage) / 100,
        contributionDate: contribution.contributionDate,
      }
    })
}

function getPartnerSummaryFromRows(
  partner: Partner | undefined,
  rows: PartnerReportRow[]
): PartnerReportSummary {
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

export async function getCarReport(
  filters?: Partial<ReportFilterValues>
): Promise<CarReportResult> {
  const context = await getReportContext()
  const allReportCars = getReportCars(context)
  const cars =
    filters?.carId && filters.carId !== 'all'
      ? allReportCars.filter((car) => car.id === filters.carId)
      : allReportCars

  return {
    cars,
    carOptions: allReportCars.map((car) => ({
      value: car.id,
      label: car.name,
    })),
    partnerRowsByCarId: getCarPartnerRows(context, allReportCars),
  }
}

export async function getProfitReport(
  filters?: Partial<ReportFilterValues>
): Promise<ProfitReportRow[]> {
  const context = await getReportContext()
  const rows = getProfitReportRowsFromCars(getReportCars(context))

  return applyProfitFilters(rows, filters)
}

export async function getExpensesReport(
  filters?: Partial<ReportFilterValues>
): Promise<ExpensesReportResult> {
  const context = await getReportContext()
  const allRows = getExpenseReportRows(context)
  const rows = applyExpenseFilters(allRows, filters)

  return {
    rows,
    carOptions: context.cars.map((car) => ({
      value: car.id,
      label: formatCarName(car),
    })),
    expenseTypeOptions: reportExpenseTypes.map((expenseType) => ({
      value: expenseType,
      label: expenseType,
    })),
    companyPlaceOptions: getUniqueOptions(
      allRows.map((expense) => expense.companyPlace)
    ),
    payerOptions: getUniqueOptions(allRows.map((expense) => expense.payer)),
  }
}

export async function getPartnerReport(
  filters?: Partial<ReportFilterValues>
): Promise<PartnerReportResult> {
  const context = await getReportContext()
  const reportCars = getReportCars(context)
  const summariesByPartnerId: Record<string, PartnerReportSummary> = {}
  const partners =
    filters?.partnerId && filters.partnerId !== 'all'
      ? context.partners.filter((partner) => partner.id === filters.partnerId)
      : context.partners

  for (const partner of partners) {
    const rows = getPartnerRows(context, reportCars, partner.id).filter((row) =>
      isInsideDateRange(
        row.contributionDate,
        filters?.startDate,
        filters?.endDate
      )
    )

    summariesByPartnerId[partner.id] = getPartnerSummaryFromRows(partner, rows)
  }

  return {
    partners,
    partnerOptions: context.partners.map((partner) => ({
      value: partner.id,
      label: partner.name,
    })),
    summariesByPartnerId,
  }
}

export async function getReportSummary(
  filters?: Partial<ReportFilterValues>
): Promise<ReportSummary> {
  const [profitRows, expensesReport, partnerBalances] = await Promise.all([
    getProfitReport(filters),
    getExpensesReport(filters),
    getPartnerBalances(filters),
  ])
  const totalSales = profitRows.reduce((sum, row) => sum + row.sellingPrice, 0)
  const totalCosts = profitRows.reduce((sum, row) => sum + row.totalCost, 0)
  const totalPartnerProfit = partnerBalances.reduce(
    (sum, row) => sum + row.totalProfit,
    0
  )
  const totalPartnerLoss = partnerBalances.reduce(
    (sum, row) => sum + row.totalLoss,
    0
  )

  return {
    carsCount: profitRows.length,
    totalSales,
    totalCosts,
    netProfit: totalSales - totalCosts,
    totalExpenses: expensesReport.rows.reduce(
      (sum, row) => sum + row.amount,
      0
    ),
    totalContributions: partnerBalances.reduce(
      (sum, row) => sum + row.totalContribution,
      0
    ),
    totalPartnerProfit,
    totalPartnerLoss,
    totalPartnerBalance: partnerBalances.reduce(
      (sum, row) => sum + row.finalBalance,
      0
    ),
  }
}

export async function getExpensesByType(
  filters?: Partial<ReportFilterValues>
): Promise<ExpenseByTypeRow[]> {
  const expensesReport = await getExpensesReport(filters)

  return reportExpenseTypes.map((expenseType) => ({
    expenseType,
    amount: expensesReport.rows
      .filter((row) => row.expenseType === expenseType)
      .reduce((sum, row) => sum + row.amount, 0),
  }))
}

export async function getProfitByCar(
  filters?: Partial<ReportFilterValues>
): Promise<ProfitReportRow[]> {
  return getProfitReport(filters)
}

export async function getPartnerBalances(
  filters?: Partial<ReportFilterValues>
): Promise<PartnerBalanceRow[]> {
  const partnerReport = await getPartnerReport(filters)

  return partnerReport.partners.map((partner) => {
    const summary = partnerReport.summariesByPartnerId[partner.id]

    return {
      partnerId: partner.id,
      partner: partner.name,
      totalContribution: summary?.totalContribution ?? 0,
      totalProfit: summary?.totalProfit ?? 0,
      totalLoss: summary?.totalLoss ?? 0,
      finalBalance: summary?.finalBalance ?? 0,
    }
  })
}
