import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { getProfitReport } from '@/services/reportsService'
import {
  ArrowLeft,
  CircleDollarSign,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { toast } from 'sonner'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { StatusBadge } from '@/components/status-badge'
import { ThemeSwitch } from '@/components/theme-switch'
import { ExportButtons } from '../components/export-buttons'
import { ReportFilters } from '../components/report-filters'
import { ReportSummaryCards } from '../components/report-summary-cards'
import { ReportTable } from '../components/report-table'
import { formatCurrency, isInsideDateRange } from '../data/formatters'
import { type ProfitReportRow, type ReportFilterValues } from '../data/schema'

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

export function ProfitReport() {
  const { t } = useI18n()
  const [filters, setFilters] = useState(initialFilters)
  const profitReportQuery = useQuery({
    queryKey: ['reports', 'profit'],
    queryFn: () => getProfitReport(),
  })

  useEffect(() => {
    if (profitReportQuery.isError) {
      toast.error(getFirestoreErrorMessage(profitReportQuery.error))
    }
  }, [profitReportQuery.error, profitReportQuery.isError])

  const rows = profitReportQuery.data ?? []
  const statusOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.status))).map((status) => ({
        value: status,
        label: status,
      })),
    [rows]
  )
  const translatedStatusOptions = statusOptions.map((option) => ({
    ...option,
    label:
      option.value === 'purchased'
        ? t('purchasedStatus')
        : option.value === 'shipping'
          ? t('shippingStatus')
          : option.value === 'repairing'
            ? t('repairingStatus')
            : option.value === 'ready-for-sale'
              ? t('readyForSaleStatus')
              : t('soldStatus'),
  }))
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesDate = isInsideDateRange(
          row.purchaseDate,
          filters.startDate,
          filters.endDate
        )
        const matchesStatus =
          filters.status === 'all' || row.status === filters.status

        return matchesDate && matchesStatus
      }),
    [filters.endDate, filters.startDate, filters.status, rows]
  )
  const totalSales = filteredRows.reduce(
    (sum, row) => sum + row.sellingPrice,
    0
  )
  const totalCosts = filteredRows.reduce((sum, row) => sum + row.totalCost, 0)
  const netProfit = totalSales - totalCosts
  const maxAbsProfit = Math.max(
    ...filteredRows.map((row) => Math.abs(row.netProfit)),
    1
  )

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
              {t('profitReport')}
            </h1>
            <p className='text-muted-foreground'>{t('profitReportPageDesc')}</p>
          </div>
          <ExportButtons />
        </div>

        <ReportFilters
          fields={['dateRange', 'status']}
          value={filters}
          onChange={setFilters}
          statuses={translatedStatusOptions}
        />

        <ReportSummaryCards
          items={[
            {
              label: t('totalSales'),
              value: formatCurrency(totalSales),
              icon: CircleDollarSign,
            },
            {
              label: t('totalCosts'),
              value: formatCurrency(totalCosts),
              icon: WalletCards,
            },
            {
              label: netProfit >= 0 ? t('netProfit') : t('netLoss'),
              value: formatCurrency(netProfit),
              icon: TrendingUp,
              tone:
                netProfit >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
            },
          ]}
        />

        <Card className='border-border/60'>
          <CardHeader>
            <CardTitle className='text-base'>{t('profitTrend')}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {filteredRows.length ? (
              filteredRows.map((row) => (
                <div key={row.id} className='grid gap-2'>
                  <div className='flex items-center justify-between gap-3 text-sm'>
                    <span className='truncate font-medium'>{row.car}</span>
                    <span
                      className={
                        row.netProfit >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {formatCurrency(row.netProfit)}
                    </span>
                  </div>
                  <div className='h-2 overflow-hidden rounded-full bg-muted'>
                    <div
                      className={
                        row.netProfit >= 0
                          ? 'h-full rounded-full bg-emerald-500'
                          : 'h-full rounded-full bg-red-500'
                      }
                      style={{
                        width: `${Math.max(
                          8,
                          (Math.abs(row.netProfit) / maxAbsProfit) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className='py-8 text-center text-muted-foreground'>
                {t('noReportDataFound')}
              </p>
            )}
          </CardContent>
        </Card>

        <ReportTable<ProfitReportRow>
          title={t('profitReport')}
          rows={filteredRows}
          emptyMessage={t('noReportDataFound')}
          columns={[
            {
              key: 'car',
              header: t('car'),
              render: (row) => row.car,
            },
            {
              key: 'status',
              header: t('status'),
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'totalCost',
              header: t('totalCost'),
              render: (row) => formatCurrency(row.totalCost),
            },
            {
              key: 'sellingPrice',
              header: t('sellingPrice'),
              render: (row) => formatCurrency(row.sellingPrice),
            },
            {
              key: 'netProfit',
              header: t('profitLoss'),
              className: 'text-end',
              render: (row) => (
                <span
                  className={
                    row.netProfit >= 0
                      ? 'font-medium text-emerald-600 dark:text-emerald-400'
                      : 'font-medium text-red-600 dark:text-red-400'
                  }
                >
                  {formatCurrency(row.netProfit)}
                </span>
              ),
            },
          ]}
        />
      </Main>
    </>
  )
}
