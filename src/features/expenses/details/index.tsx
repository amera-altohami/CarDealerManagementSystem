import { Link } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getExpenseById } from '../components/expense-form'
import { getExpenseTypeLabel, getPaymentMethodLabel, useI18n } from '@/lib/i18n'

type ExpenseDetailsProps = {
  expenseId: string
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function ExpenseDetails({ expenseId }: ExpenseDetailsProps) {
  const expense = getExpenseById(expenseId)
  const { t, locale } = useI18n()

  if (!expense) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <div className='rounded-lg border p-6 text-center'>
          <h1 className='text-lg font-semibold'>{t('expenseNotFound')}</h1>
          <p className='mt-2 text-sm text-muted-foreground'>{t('expenseNotFoundDesc')}</p>
        </div>
      </Main>
    )
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <Card className='border-border/60'>
          <CardHeader className='space-y-2'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <CardTitle className='text-2xl'>{expense.carName}</CardTitle>
              <Badge variant='outline'>{getExpenseTypeLabel(expense.expenseType, locale)}</Badge>
            </div>
            <p className='text-muted-foreground'>
              {expense.date} • {getPaymentMethodLabel(expense.paymentMethod, locale)} • {t('paidBy')} {expense.paidBy}
            </p>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2'>
            <InfoBlock label={t('amount')} value={money.format(expense.amount)} />
            <InfoBlock label={t('invoice')} value={expense.invoiceName ?? '-'} />
            <InfoBlock label={t('notes')} value={expense.notes || '-'} />
            <div className='flex items-end justify-end gap-3 md:col-span-2'>
              <Button asChild variant='outline'>
                <Link to='/expenses'>{t('backToExpenses')}</Link>
              </Button>
              <Button asChild>
                <Link to='/expenses/$expenseId/edit' params={{ expenseId: expense.id }}>{t('editExpense')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border bg-muted/20 p-4'>
      <p className='text-xs uppercase tracking-wide text-muted-foreground'>{label}</p>
      <p className='mt-2 font-medium'>{value}</p>
    </div>
  )
}
