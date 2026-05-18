import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Link } from '@tanstack/react-router'
import { Info } from 'lucide-react'
import { CarsTable } from './components/cars-table'
import { carsMockData } from '@/data/carsMockData'
import { useI18n } from '@/lib/i18n'

export function CarsManagement() {
  const { t, locale } = useI18n()
  const hintText =
    locale === 'ar'
      ? 'انقر مرتين على صف السيارة لفتح التفاصيل. على الهاتف، اضغط مرتين على الصف.'
      : 'Double click a car row to open its details. On mobile, double tap the row.'
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
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
                {t('carsManagement')}
              </h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 rounded-full text-muted-foreground'
                  >
                    <Info className='h-4 w-4' />
                    <span className='sr-only'>{hintText}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{hintText}</TooltipContent>
              </Tooltip>
            </div>
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
