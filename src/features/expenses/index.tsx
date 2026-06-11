import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { carsMockData } from '@/data/carsMockData'
import {
  expenseTypeOptions,
  expensesMockData,
  type ExpenseType,
  type PaymentMethod,
} from '@/data/dealerOperationsMockData'
import { Plus } from 'lucide-react'
import { getExpenseTypeLabel, getPaymentMethodLabel, useI18n } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

const expenseTypes: Array<'all' | ExpenseType> = ['all', ...expenseTypeOptions]
const paymentMethods: Array<'all' | PaymentMethod> = [
  'all',
  'Zelle',
  'Cash',
  'Card',
]

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function ExpensesManagement() {
  const { t, locale } = useI18n()
  const [search, setSearch] = useState('')
  const [carId, setCarId] = useState('all')
  const [expenseType, setExpenseType] = useState<'all' | ExpenseType>('all')
  const [paymentMethod, setPaymentMethod] = useState<'all' | PaymentMethod>(
    'all'
  )
  const [date, setDate] = useState('')

  const carOptions = carsMockData.map((car) => ({
    id: car.id,
    label: `${car.brand} ${car.model} ${car.year}`,
  }))

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase()
    return expensesMockData.filter((expense) => {
      const matchesSearch =
        !query ||
        [
          expense.carName,
          expense.expenseType,
          expense.paidBy,
          expense.notes,
          expense.invoiceName ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
      const matchesCar = carId === 'all' || expense.carId === carId
      const matchesType =
        expenseType === 'all' || expense.expenseType === expenseType
      const matchesPayment =
        paymentMethod === 'all' || expense.paymentMethod === paymentMethod
      const matchesDate = !date || expense.date === date
      return (
        matchesSearch &&
        matchesCar &&
        matchesType &&
        matchesPayment &&
        matchesDate
      )
    })
  }, [carId, date, expenseType, paymentMethod, search])

  const totalExpenses = expensesMockData.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )
  const thisMonthKey = new Date().toISOString().slice(0, 7)
  const thisMonthExpenses = expensesMockData
    .filter((expense) => expense.date.startsWith(thisMonthKey))
    .reduce((sum, expense) => sum + expense.amount, 0)
  const highestExpenseType =
    Object.entries(
      expensesMockData.reduce<Record<string, number>>((acc, expense) => {
        acc[expense.expenseType] =
          (acc[expense.expenseType] ?? 0) + expense.amount
        return acc
      }, {})
    ).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'N/A'
  const highestExpenseTypeLabel =
    highestExpenseType === 'N/A'
      ? highestExpenseType
      : getExpenseTypeLabel(highestExpenseType as ExpenseType, locale)

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
              {t('expensesManagement')}
            </h1>
            <p className='text-muted-foreground'>
              {t('expensesManagementDesc')}
            </p>
          </div>
          <Button asChild>
            <Link to='/expenses/new'>
              <Plus className='me-2 h-4 w-4' />
              {t('addExpense')}
            </Link>
          </Button>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <SummaryCard
            label={t('totalExpenses')}
            value={money.format(totalExpenses)}
          />
          <SummaryCard
            label={t('thisMonthExpenses')}
            value={money.format(thisMonthExpenses)}
          />
          <SummaryCard
            label={t('highestExpenseType')}
            value={highestExpenseTypeLabel}
          />
          <SummaryCard
            label={t('expensesCount')}
            value={String(expensesMockData.length)}
          />
        </div>

        <Card className='border-border/60'>
          <CardHeader className='space-y-4'>
            <CardTitle>{t('expensesList')}</CardTitle>
            <div className='grid gap-3 md:grid-cols-[1fr_180px_180px_180px_160px]'>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('searchExpenses')}
              />
              <Select value={carId} onValueChange={setCarId}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder={t('filterByCar')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('allCars')}</SelectItem>
                  {carOptions.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={expenseType}
                onValueChange={(value) =>
                  setExpenseType(value as 'all' | ExpenseType)
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder={t('expenseType')} />
                </SelectTrigger>
                <SelectContent>
                  {expenseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === 'all'
                        ? t('allTypes')
                        : getExpenseTypeLabel(type, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as 'all' | PaymentMethod)
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder={t('paymentMethod')} />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method === 'all'
                        ? t('allMethods')
                        : getPaymentMethodLabel(method, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type='date'
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('car')}</TableHead>
                    <TableHead>{t('expenseType')}</TableHead>
                    <TableHead>{t('amount')}</TableHead>
                    <TableHead>{t('paidBy')}</TableHead>
                    <TableHead>{t('paymentMethod')}</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('invoice')}</TableHead>
                    <TableHead className='text-end'>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length ? (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className='font-medium'>
                          {expense.carName}
                        </TableCell>
                        <TableCell>
                          <ExpenseBadge expenseType={expense.expenseType} />
                        </TableCell>
                        <TableCell>{money.format(expense.amount)}</TableCell>
                        <TableCell>{expense.paidBy}</TableCell>
                        <TableCell>
                          <PaymentBadge method={expense.paymentMethod} />
                        </TableCell>
                        <TableCell>{expense.date}</TableCell>
                        <TableCell className='text-muted-foreground'>
                          {expense.invoiceName ?? t('uploadInvoice')}
                        </TableCell>
                        <TableCell className='text-end'>
                          <Button asChild variant='ghost' size='sm'>
                            <Link
                              to='/expenses/$expenseId'
                              params={{ expenseId: expense.id }}
                            >
                              {t('details')}
                            </Link>
                          </Button>
                          <Button asChild variant='ghost' size='sm'>
                            <Link
                              to='/expenses/$expenseId/edit'
                              params={{ expenseId: expense.id }}
                            >
                              {t('edit')}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className='h-24 text-center'>
                        {t('noExpensesFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className='border-border/60'>
      <CardContent className='p-4'>
        <p className='text-sm text-muted-foreground'>{label}</p>
        <p className='mt-2 text-2xl font-bold tracking-tight'>{value}</p>
      </CardContent>
    </Card>
  )
}

function ExpenseBadge({ expenseType }: { expenseType: ExpenseType }) {
  const { locale } = useI18n()
  const className = {
    Purchase: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    Shipping:
      'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    Repair:
      'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    Parts:
      'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    Labor:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    Inspection:
      'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300',
    Fees: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
    Other: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
  }[expenseType]

  return (
    <Badge variant='outline' className={className}>
      {getExpenseTypeLabel(expenseType, locale)}
    </Badge>
  )
}

function PaymentBadge({ method }: { method: PaymentMethod }) {
  const { locale } = useI18n()
  const className = {
    Zelle: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    Cash: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    Card: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  }[method]

  return (
    <Badge variant='outline' className={className}>
      {getPaymentMethodLabel(method, locale)}
    </Badge>
  )
}
