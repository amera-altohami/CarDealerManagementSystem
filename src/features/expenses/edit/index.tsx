import { useNavigate } from '@tanstack/react-router'
import { useI18n } from '@/lib/i18n'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ExpenseForm } from '../components/expense-form'
import {
  useExpenseQuery,
  useUpdateExpenseMutation,
} from '../hooks/use-expenses'

type ExpenseEditProps = {
  expenseId: string
}

export function ExpenseEdit({ expenseId }: ExpenseEditProps) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const expenseQuery = useExpenseQuery(expenseId)
  const updateExpenseMutation = useUpdateExpenseMutation()
  const expense = expenseQuery.data

  if (expenseQuery.isLoading) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <div className='rounded-lg border p-6 text-center'>
          <h1 className='text-lg font-semibold'>Loading...</h1>
        </div>
      </Main>
    )
  }

  if (!expense) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <div className='rounded-lg border p-6 text-center'>
          <h1 className='text-lg font-semibold'>{t('expenseNotFound')}</h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            {t('expenseNotFoundDesc')}
          </p>
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
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('editExpense')}
          </h1>
          <p className='text-muted-foreground'>{t('expensesManagementDesc')}</p>
        </div>
        <ExpenseForm
          defaultValues={{
            carId: expense.carId ?? '',
            expenseType: expense.expenseType,
            amount: expense.amount,
            paidBy: expense.paidBy,
            paymentMethod: expense.paymentMethod,
            date: expense.date,
            notes: expense.notes ?? '',
            invoiceName: expense.invoiceName ?? '',
          }}
          submitLabel={t('saveChanges')}
          cancelHref='/expenses'
          onSubmit={async (values) => {
            await updateExpenseMutation.mutateAsync({
              id: expense.id,
              data: values,
            })
            navigate({ to: '/expenses' })
          }}
        />
      </Main>
    </>
  )
}
