import { useI18n } from '@/lib/i18n'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  const { t } = useI18n()

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('account')}
          </h1>
          <p className='text-muted-foreground'>
            Manage your account details and app preferences.
          </p>
        </div>

        <div className='mt-6 max-w-2xl'>
          <AccountForm />
        </div>
      </Main>
    </>
  )
}
