import { useNavigate, useSearch } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { InspectionForm } from '../components/inspection-form'
import { useI18n } from '@/lib/i18n'

export function InspectionCreate() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { carId } = useSearch({ from: '/_authenticated/inspections/new' })

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>{t('addInspection')}</h1>
          <p className='text-muted-foreground'>{t('inspectionsManagementDesc')}</p>
        </div>
        <InspectionForm
          defaultValues={{ carId: carId ?? '' }}
          submitLabel={t('createInspection')}
          cancelHref='/inspections'
          onSubmit={() => navigate({ to: '/inspections' })}
        />
      </Main>
    </>
  )
}
