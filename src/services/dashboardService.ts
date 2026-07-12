import type { ExpenseType } from '@/types/dealer'
import { formatCarName, getCars, type Car, type CarStatus } from './carsService'
import { getExpenses, type Expense } from './expensesService'
import { getInspections, type Inspection } from './inspectionsService'
import { getAll as getNotifications, type NotificationDocument } from './notificationsService'
import { getPartnerContributions } from './partnerContributionsService'
import { getParts, type Part } from './partsService'
import { getProfitShares } from './profitSharesService'

type DashboardContext = {
  cars: Car[]
  expenses: Expense[]
  parts: Part[]
  inspections: Inspection[]
  notifications: NotificationDocument[]
}

export type DashboardTransaction = {
  id: string
  car: string
  type: string
  date: string
  status: CarStatus | string
  amount: number
}

export type DashboardAlert = {
  id: string
  title: string
  description: string
  severity: 'warning' | 'critical'
  car: string
}

export type CarsStats = {
  totalCars: number
  soldCars: number
  carsUnderRepair: number
  carsUnderShipping: number
  carsRequiringInspection: number
  purchasedCars: number
  readyForSaleCars: number
}

export type FinancialStats = {
  totalPurchasePrice: number
  totalSellingPrice: number
  totalExpenses: number
  totalPartsCost: number
  totalCost: number
  grossRevenue: number
  totalProfit: number
  totalPartnerContributions: number
  totalPartnerProfitShares: number
  totalLoss: number
}

export type OperationsStats = {
  totalParts: number
  installedParts: number
  pendingParts: number
  totalInspections: number
  pendingInspections: number
  failedInspections: number
}

export type DashboardSummary = {
  carsStats: CarsStats
  financialStats: FinancialStats
  operationsStats: OperationsStats
  expenseByType: Array<[ExpenseType, number]>
  latestTransactions: DashboardTransaction[]
  alerts: DashboardAlert[]
}

async function getDashboardContext(): Promise<DashboardContext> {
  const [cars, expenses, parts, inspections, notifications] = await Promise.all(
    [getCars(), getExpenses(), getParts(), getInspections(), getNotifications()]
  )

  return {
    cars,
    expenses,
    parts,
    inspections,
    notifications,
  }
}

function getCarMap(cars: Car[]) {
  return new Map(cars.map((car) => [car.id, car]))
}

function isCarRequiringInspection(car: Car, inspections: Inspection[]) {
  if (car.currentTitleType === 'Salvage' || car.titleType === 'Salvage') {
    return true
  }

  return inspections.some(
    (inspection) =>
      inspection.carId === car.id &&
      (inspection.status === 'Pending' || inspection.status === 'Failed')
  )
}

function getCarsStatsFromContext(context: DashboardContext): CarsStats {
  return {
    totalCars: context.cars.length,
    soldCars: context.cars.filter((car) => car.status === 'sold').length,
    carsUnderRepair: context.cars.filter((car) => car.status === 'repairing')
      .length,
    carsUnderShipping: context.cars.filter((car) => car.status === 'shipping')
      .length,
    carsRequiringInspection: context.cars.filter((car) =>
      isCarRequiringInspection(car, context.inspections)
    ).length,
    purchasedCars: context.cars.filter((car) => car.status === 'purchased')
      .length,
    readyForSaleCars: context.cars.filter(
      (car) => car.status === 'ready-for-sale'
    ).length,
  }
}

async function getFinancialStatsFromContext(
  context: DashboardContext
): Promise<FinancialStats> {
  const [contributions, profitShares] = await Promise.all([
    getPartnerContributions(),
    getProfitShares(),
  ])
  const totalPurchasePrice = context.cars.reduce(
    (sum, car) => sum + car.purchasePrice,
    0
  )
  const totalSellingPrice = context.cars.reduce(
    (sum, car) => sum + car.sellingPrice,
    0
  )
  const totalExpenses = context.expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )
  const totalPartsCost = context.parts.reduce(
    (sum, part) => sum + part.price,
    0
  )
  const totalCost = totalPurchasePrice + totalExpenses + totalPartsCost
  const totalPartnerProfitShares = profitShares.reduce(
    (sum, profitShare) => sum + profitShare.partnerProfitShare,
    0
  )
  const totalLoss = profitShares.reduce(
    (sum, profitShare) =>
      profitShare.partnerProfitShare < 0
        ? sum + Math.abs(profitShare.partnerProfitShare)
        : sum,
    0
  )

  return {
    totalPurchasePrice,
    totalSellingPrice,
    totalExpenses,
    totalPartsCost,
    totalCost,
    grossRevenue: totalSellingPrice,
    totalProfit: totalSellingPrice - totalCost,
    totalPartnerContributions: contributions.reduce(
      (sum, contribution) => sum + contribution.contributionAmount,
      0
    ),
    totalPartnerProfitShares,
    totalLoss,
  }
}

function getOperationsStatsFromContext(
  context: DashboardContext
): OperationsStats {
  return {
    totalParts: context.parts.length,
    installedParts: context.parts.filter((part) => part.installed).length,
    pendingParts: context.parts.filter((part) => !part.installed).length,
    totalInspections: context.inspections.length,
    pendingInspections: context.inspections.filter(
      (inspection) => inspection.status === 'Pending'
    ).length,
    failedInspections: context.inspections.filter(
      (inspection) => inspection.status === 'Failed'
    ).length,
  }
}

function getExpenseByTypeFromContext(context: DashboardContext) {
  const expenseByType = context.expenses.reduce<Record<string, number>>(
    (acc, expense) => {
      acc[expense.expenseType] =
        (acc[expense.expenseType] ?? 0) + expense.amount
      return acc
    },
    {}
  )

  return Object.entries(expenseByType)
    .sort(([, first], [, second]) => second - first)
    .slice(0, 4) as Array<[ExpenseType, number]>
}

function getLatestTransactionsFromContext(
  context: DashboardContext
): DashboardTransaction[] {
  const carMap = getCarMap(context.cars)

  return [...context.expenses]
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, 5)
    .map((expense) => {
      const car = expense.carId ? carMap.get(expense.carId) : undefined

      return {
        id: expense.id,
        car: car ? formatCarName(car) : expense.carName || '-',
        type: expense.expenseType,
        date: expense.date,
        status: car?.status ?? 'purchased',
        amount: expense.amount,
      }
    })
}

function getDaysSince(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return 0
  }

  const now = new Date()
  return Math.floor(
    (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24)
  )
}

function getDashboardAlertsFromContext(
  context: DashboardContext
): DashboardAlert[] {
  const alerts: DashboardAlert[] = []

  for (const notification of context.notifications) {
    if (notification.status !== 'Unread') {
      continue
    }

    alerts.push({
      id: notification.id,
      title: notification.title,
      description: notification.message,
      severity: notification.severity === 'Critical' ? 'critical' : 'warning',
      car: notification.related_car_name || notification.related_car_id || '-',
    })
  }

  for (const car of context.cars) {
    if (car.status !== 'sold') {
      const daysInInventory = getDaysSince(car.purchaseDate)

      if (daysInInventory >= 60) {
        alerts.push({
          id: `inventory-delay-${car.id}`,
          title: 'Inventory delay',
          description: `${formatCarName(car)} has been in inventory for ${daysInInventory} days.`,
          severity: daysInInventory >= 90 ? 'critical' : 'warning',
          car: formatCarName(car),
        })
      }
    }

    if (car.currentTitleType === 'Salvage' || car.titleType === 'Salvage') {
      const hasInspection = context.inspections.some(
        (inspection) => inspection.carId === car.id
      )

      if (!hasInspection) {
        alerts.push({
          id: `salvage-inspection-${car.id}`,
          title: 'Salvage car needs inspection',
          description: `${formatCarName(car)} is marked as Salvage and has no linked inspection yet.`,
          severity: 'warning',
          car: formatCarName(car),
        })
      }
    }
  }

  for (const inspection of context.inspections) {
    if (inspection.status === 'Pending') {
      alerts.push({
        id: `pending-inspection-${inspection.id}`,
        title: 'Pending inspection',
        description: `${inspection.carName} has a pending inspection.`,
        severity: 'warning',
        car: inspection.carName,
      })
    }

    if (inspection.status === 'Failed') {
      alerts.push({
        id: `failed-inspection-${inspection.id}`,
        title: 'Failed inspection',
        description: `${inspection.carName} has a failed inspection that needs follow-up.`,
        severity: 'critical',
        car: inspection.carName,
      })
    }
  }

  return alerts.slice(0, 8)
}

export async function getCarsStats(): Promise<CarsStats> {
  const context = await getDashboardContext()

  return getCarsStatsFromContext(context)
}

export async function getFinancialStats(): Promise<FinancialStats> {
  const context = await getDashboardContext()

  return getFinancialStatsFromContext(context)
}

export async function getLatestTransactions(): Promise<DashboardTransaction[]> {
  const context = await getDashboardContext()

  return getLatestTransactionsFromContext(context)
}

export async function getDashboardAlerts(): Promise<DashboardAlert[]> {
  const context = await getDashboardContext()

  return getDashboardAlertsFromContext(context)
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const context = await getDashboardContext()
  const [carsStats, financialStats] = await Promise.all([
    Promise.resolve(getCarsStatsFromContext(context)),
    getFinancialStatsFromContext(context),
  ])

  return {
    carsStats,
    financialStats,
    operationsStats: getOperationsStatsFromContext(context),
    expenseByType: getExpenseByTypeFromContext(context),
    latestTransactions: getLatestTransactionsFromContext(context),
    alerts: getDashboardAlertsFromContext(context),
  }
}
