import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '@/services/dashboardService'
import {
  BarChart3,
  CarFront,
  CircleDollarSign,
  Wrench,
  Truck,
  AlertTriangle,
  Scale,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { getExpenseTypeLabel, useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertsList } from '@/components/alerts-list'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { StatCard } from '@/components/stat-card'
import { ThemeSwitch } from '@/components/theme-switch'
import { LatestTransactions } from './components/latest-transactions'

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function Dashboard() {
  const { t, locale } = useI18n()
  const dashboardQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  })

  useEffect(() => {
    if (dashboardQuery.isError) {
      toast.error(getFirestoreErrorMessage(dashboardQuery.error))
    }
  }, [dashboardQuery.error, dashboardQuery.isError])

  const carsStats = dashboardQuery.data?.carsStats ?? {
    totalCars: 0,
    soldCars: 0,
    carsUnderRepair: 0,
    carsUnderShipping: 0,
    carsRequiringInspection: 0,
    purchasedCars: 0,
    readyForSaleCars: 0,
  }
  const financialStats = dashboardQuery.data?.financialStats ?? {
    totalPurchasePrice: 0,
    totalSellingPrice: 0,
    totalExpenses: 0,
    totalPartsCost: 0,
    totalCost: 0,
    grossRevenue: 0,
    totalProfit: 0,
    totalPartnerContributions: 0,
    totalPartnerProfitShares: 0,
    totalLoss: 0,
  }
  const operationsStats = dashboardQuery.data?.operationsStats ?? {
    totalParts: 0,
    installedParts: 0,
    pendingParts: 0,
    totalInspections: 0,
    pendingInspections: 0,
    failedInspections: 0,
  }
  const expenseByType = dashboardQuery.data?.expenseByType ?? []
  const latestTransactions = dashboardQuery.data?.latestTransactions ?? []
  const alerts = dashboardQuery.data?.alerts ?? []

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              {t('dashboard')}
            </h1>
            <p className='text-muted-foreground'>{t('carsManagementDesc')}</p>
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <StatCard
            title={t('totalCars')}
            value={String(carsStats.totalCars)}
            icon={<CarFront className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('soldCars')}
            value={String(carsStats.soldCars)}
            icon={
              <CircleDollarSign className='h-4 w-4 text-muted-foreground' />
            }
          />
          <StatCard
            title={t('carsUnderRepair')}
            value={String(carsStats.carsUnderRepair)}
            icon={<Wrench className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('carsUnderShipping')}
            value={String(carsStats.carsUnderShipping)}
            icon={<Truck className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('carsRequiringInspection')}
            value={String(carsStats.carsRequiringInspection)}
            icon={<AlertTriangle className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('totalProfit')}
            value={money.format(financialStats.totalProfit)}
            icon={<BarChart3 className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('totalExpenses')}
            value={money.format(financialStats.totalExpenses)}
            icon={<Scale className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('totalCost')}
            value={money.format(financialStats.totalCost)}
            icon={<CircleDollarSign className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('currentCapital')}
            value={money.format(financialStats.totalPurchasePrice)}
            icon={<Wallet className='h-4 w-4 text-muted-foreground' />}
          />
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.9fr]'>
          <LatestTransactions transactions={latestTransactions} />
          <AlertsList alerts={alerts} />
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <Card className='border-border/60'>
            <CardHeader>
              <CardTitle>{t('expensesByType')}</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-3 sm:grid-cols-2'>
              {expenseByType.map(([type, amount]) => (
                <MiniMetric
                  key={type}
                  label={getExpenseTypeLabel(
                    type as Parameters<typeof getExpenseTypeLabel>[0],
                    locale
                  )}
                  value={money.format(amount)}
                />
              ))}
            </CardContent>
          </Card>
          <Card className='border-border/60'>
            <CardHeader>
              <CardTitle>{t('inventoryAndOperations')}</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4 sm:grid-cols-2'>
              <MiniMetric
                label={t('totalParts')}
                value={String(operationsStats.totalParts)}
              />
              <MiniMetric
                label={t('installedParts')}
                value={String(operationsStats.installedParts)}
              />
              <MiniMetric
                label={t('pendingParts')}
                value={String(operationsStats.pendingParts)}
              />
              <MiniMetric
                label={t('pendingInspections')}
                value={String(operationsStats.pendingInspections)}
              />
              <MiniMetric
                label={t('failedInspections')}
                value={String(operationsStats.failedInspections)}
              />
              <MiniMetric
                label={t('carsRequiringInspection')}
                value={String(carsStats.carsRequiringInspection)}
              />
            </CardContent>
          </Card>
        </div>

        <Card className='mt-6 border-border/60'>
          <CardHeader>
            <CardTitle>{t('portfolioSnapshot')}</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <MiniMetric
              label={t('purchasedVehicles')}
              value={String(carsStats.purchasedCars)}
            />
            <MiniMetric
              label={t('readyForSale')}
              value={String(carsStats.readyForSaleCars)}
            />
            <MiniMetric
              label={t('inspectionPending')}
              value={String(carsStats.carsRequiringInspection)}
            />
            <MiniMetric label={t('alertsOpen')} value={String(alerts.length)} />
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border p-4'>
      <p className='text-sm text-muted-foreground'>{label}</p>
      <p className='mt-2 text-xl font-semibold'>{value}</p>
    </div>
  )
}
