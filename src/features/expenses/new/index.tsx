import { useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ExpenseForm } from '../components/expense-form'
import { useI18n } from '@/lib/i18n'

export function ExpenseCreate() {
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
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>{t('addExpense')}</h1>
          <p className='text-muted-foreground'>{t('expensesManagementDesc')}</p>
        </div>
        <ExpenseForm submitLabel={t('createExpense')} cancelHref='/expenses' onSubmit={() => navigate({ to: '/expenses' })} />
      </Main>
    </>
  )
}
