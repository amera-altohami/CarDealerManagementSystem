import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { CarsTable } from './components/cars-table'
import { carsMockData } from '@/data/carsMockData'
import { useI18n } from '@/lib/i18n'

export function CarsManagement() {
  const { t } = useI18n()
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
              {t('carsManagement')}
            </h1>
            <p className='text-muted-foreground'>
              {t('carsManagementDesc')}
            </p>
          </div>
          <Button asChild>
            <Link to='/cars/new'>{t('addCar')}</Link>
          </Button>
        </div>
        <CarsTable data={carsMockData} />
      </Main>
    </>
  )
}
