import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { type ExpenseType } from '@/data/dealerOperationsMockData'
import {
  getExpensesReport,
  reportExpenseTypes,
} from '@/services/reportsService'
import { ArrowLeft, ReceiptText, WalletCards } from 'lucide-react'
import { toast } from 'sonner'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { getExpenseTypeLabel, useI18n } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ExportButtons } from '../components/export-buttons'
import { ReportFilters } from '../components/report-filters'
import { ReportSummaryCards } from '../components/report-summary-cards'
import { ReportTable } from '../components/report-table'
import {
  formatCurrency,
  formatDate,
  isInsideDateRange,
} from '../data/formatters'
import { type ExpenseReportRow, type ReportFilterValues } from '../data/schema'

const initialFilters: ReportFilterValues = {
  startDate: '',
  endDate: '',
  carId: 'all',
  partnerId: 'all',
  expenseType: 'all',
  companyPlace: 'all',
  payer: 'all',
  status: 'all',
}

const expenseBadgeStyles: Record<ExpenseType, string> = {
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
}

export function ExpensesReport() {
  const { t, locale } = useI18n()
  const [filters, setFilters] = useState(initialFilters)
  const expensesReportQuery = useQuery({
    queryKey: ['reports', 'expenses'],
    queryFn: () => getExpensesReport(),
  })

  useEffect(() => {
    if (expensesReportQuery.isError) {
      toast.error(getFirestoreErrorMessage(expensesReportQuery.error))
    }
  }, [expensesReportQuery.error, expensesReportQuery.isError])

  const expenseTypeOptions = reportExpenseTypes.map((expenseType) => ({
    value: expenseType,
    label: getExpenseTypeLabel(expenseType, locale),
  }))
  const rows = expensesReportQuery.data?.rows ?? []
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesDate = isInsideDateRange(
          row.date,
          filters.startDate,
          filters.endDate
        )
        const matchesCar =
          filters.carId === 'all' || row.carId === filters.carId
        const matchesType =
          filters.expenseType === 'all' ||
          row.expenseType === filters.expenseType
        const matchesCompany =
          filters.companyPlace === 'all' ||
          row.companyPlace === filters.companyPlace
        const matchesPayer =
          filters.payer === 'all' || row.payer === filters.payer

        return (
          matchesDate &&
          matchesCar &&
          matchesType &&
          matchesCompany &&
          matchesPayer
        )
      }),
    [filters, rows]
  )
  const totalsByType = reportExpenseTypes.map((expenseType) => ({
    expenseType,
    amount: filteredRows
      .filter((row) => row.expenseType === expenseType)
      .reduce((sum, row) => sum + row.amount, 0),
  }))
  const totalExpenses = filteredRows.reduce((sum, row) => sum + row.amount, 0)

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
            <Button asChild variant='ghost' className='-ms-3'>
              <Link to='/reports'>
                <ArrowLeft className='h-4 w-4' />
                {t('backToReports')}
              </Link>
            </Button>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
              {t('expensesReport')}
            </h1>
            <p className='text-muted-foreground'>
              {t('expensesReportPageDesc')}
            </p>
          </div>
          <ExportButtons />
        </div>

        <ReportFilters
          fields={['dateRange', 'car', 'expenseType', 'companyPlace', 'payer']}
          value={filters}
          onChange={setFilters}
          cars={expensesReportQuery.data?.carOptions ?? []}
          expenseTypes={expenseTypeOptions}
          companyPlaces={expensesReportQuery.data?.companyPlaceOptions ?? []}
          payers={expensesReportQuery.data?.payerOptions ?? []}
        />

        <ReportSummaryCards
          items={[
            {
              label: t('totalExpenses'),
              value: formatCurrency(totalExpenses),
              icon: WalletCards,
            },
            ...reportExpenseTypes.map((expenseType) => ({
              label: getExpenseTypeLabel(expenseType, locale),
              value: formatCurrency(
                totalsByType.find((item) => item.expenseType === expenseType)
                  ?.amount ?? 0
              ),
              icon: ReceiptText,
            })),
          ]}
        />

        <ReportTable<ExpenseReportRow>
          title={t('expensesReport')}
          rows={filteredRows}
          emptyMessage={t('noExpensesFound')}
          columns={[
            {
              key: 'date',
              header: t('date'),
              render: (row) => formatDate(row.date),
            },
            {
              key: 'car',
              header: t('car'),
              render: (row) => row.car,
            },
            {
              key: 'type',
              header: t('expenseType'),
              render: (row) => (
                <Badge
                  variant='outline'
                  className={expenseBadgeStyles[row.expenseType]}
                >
                  {getExpenseTypeLabel(row.expenseType, locale)}
                </Badge>
              ),
            },
            {
              key: 'company',
              header: t('companyPlace'),
              render: (row) => row.companyPlace,
            },
            {
              key: 'payer',
              header: t('paidBy'),
              render: (row) => row.payer,
            },
            {
              key: 'method',
              header: t('paymentMethod'),
              render: (row) => row.paymentMethod,
            },
            {
              key: 'amount',
              header: t('amount'),
              className: 'text-end',
              render: (row) => formatCurrency(row.amount),
            },
          ]}
        />

        <ReportTable
          title={t('summaryByType')}
          rows={totalsByType}
          emptyMessage={t('noExpensesFound')}
          columns={[
            {
              key: 'type',
              header: t('expenseType'),
              render: (row) => getExpenseTypeLabel(row.expenseType, locale),
            },
            {
              key: 'amount',
              header: t('amount'),
              className: 'text-end',
              render: (row) => formatCurrency(row.amount),
            },
          ]}
        />
      </Main>
    </>
  )
}
