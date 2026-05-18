import { BarChart3, CarFront, CircleDollarSign, Wrench, Truck, AlertTriangle, Scale, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AlertsList } from '@/components/alerts-list'
import { StatCard } from '@/components/stat-card'
import { delayedCarsMock, latestTransactionsMock, carsMockData } from '@/data/carsMockData'
import { useI18n } from '@/lib/i18n'
import { LatestTransactions } from './components/latest-transactions'

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function Dashboard() {
  const { t } = useI18n()
  const totalCars = carsMockData.length
  const soldCars = carsMockData.filter((car) => car.status === 'sold').length
  const carsUnderRepair = carsMockData.filter((car) => car.status === 'repairing').length
  const carsUnderShipping = carsMockData.filter((car) => car.status === 'shipping').length
  const carsRequiringInspection = carsMockData.filter((car) =>
    car.inspections.some((inspection) => inspection.status !== 'Completed')
  ).length
  const totalProfit = carsMockData.reduce((sum, car) => sum + car.netProfit, 0)
  const totalExpenses = carsMockData.reduce((sum, car) => sum + car.totalCost, 0)
  const currentCapital = totalExpenses

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
            <h1 className='text-2xl font-bold tracking-tight'>{t('dashboard')}</h1>
            <p className='text-muted-foreground'>
              {t('carsManagementDesc')}
            </p>
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <StatCard
            title={t('totalCars')}
            value={String(totalCars)}
            icon={<CarFront className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('soldCars')}
            value={String(soldCars)}
            icon={<CircleDollarSign className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('carsUnderRepair')}
            value={String(carsUnderRepair)}
            icon={<Wrench className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('carsUnderShipping')}
            value={String(carsUnderShipping)}
            icon={<Truck className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('carsRequiringInspection')}
            value={String(carsRequiringInspection)}
            icon={<AlertTriangle className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('totalProfit')}
            value={money.format(totalProfit)}
            icon={<BarChart3 className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('totalExpenses')}
            value={money.format(totalExpenses)}
            icon={<Scale className='h-4 w-4 text-muted-foreground' />}
          />
          <StatCard
            title={t('currentCapital')}
            value={money.format(currentCapital)}
            icon={<Wallet className='h-4 w-4 text-muted-foreground' />}
          />
        </div>

        <div className='grid gap-4 lg:grid-cols-[1.3fr_0.9fr]'>
          <LatestTransactions transactions={latestTransactionsMock} />
          <AlertsList alerts={delayedCarsMock} />
        </div>

        <Card className='border-border/60'>
          <CardHeader>
            <CardTitle>{t('portfolioSnapshot')}</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <MiniMetric label={t('purchasedVehicles')} value={String(carsMockData.filter((car) => car.status === 'purchased').length)} />
            <MiniMetric label={t('readyForSale')} value={String(carsMockData.filter((car) => car.status === 'ready-for-sale').length)} />
            <MiniMetric label={t('inspectionPending')} value={String(carsRequiringInspection)} />
            <MiniMetric label={t('alertsOpen')} value={String(delayedCarsMock.length)} />
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
