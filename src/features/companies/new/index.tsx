import { useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CompanyForm } from '../components/company-form'
import { useI18n } from '@/lib/i18n'

export function CompanyCreate() {
  const navigate = useNavigate()
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
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>{t('addCompany')}</h1>
          <p className='text-muted-foreground'>{t('companiesManagementDesc')}</p>
        </div>
        <CompanyForm submitLabel={t('createCompany')} cancelHref='/companies' onSubmit={() => navigate({ to: '/companies' })} />
      </Main>
    </>
  )
}
