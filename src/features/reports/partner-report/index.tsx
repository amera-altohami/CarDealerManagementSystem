import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { getPartnerReport } from '@/services/reportsService'
import {
  ArrowLeft,
  CircleDollarSign,
  HandCoins,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { useI18n } from '@/lib/i18n'
import { getDisplayNameInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  formatNumber,
  isInsideDateRange,
} from '../data/formatters'
import { type PartnerReportRow, type ReportFilterValues } from '../data/schema'

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

export function PartnerReport() {
  const { t } = useI18n()
  const [filters, setFilters] = useState(initialFilters)
  const partnerReportQuery = useQuery({
    queryKey: ['reports', 'partner'],
    queryFn: () => getPartnerReport(),
  })

  useEffect(() => {
    if (partnerReportQuery.isError) {
      toast.error(getFirestoreErrorMessage(partnerReportQuery.error))
    }
  }, [partnerReportQuery.error, partnerReportQuery.isError])

  const partnerOptions = partnerReportQuery.data?.partnerOptions ?? []
  const selectedPartnerId =
    filters.partnerId === 'all' ? partnerOptions[0]?.value : filters.partnerId
  const reportSummary = selectedPartnerId
    ? partnerReportQuery.data?.summariesByPartnerId[selectedPartnerId]
    : undefined
  const reportRows = reportSummary?.rows ?? []
  const filteredRows = useMemo(
    () =>
      reportRows.filter((row) =>
        isInsideDateRange(
          row.contributionDate,
          filters.startDate,
          filters.endDate
        )
      ),
    [filters.endDate, filters.startDate, reportRows]
  )
  const totalContribution = filteredRows.reduce(
    (sum, row) => sum + row.contribution,
    0
  )
  const totalProfit = filteredRows.reduce(
    (sum, row) => (row.partnerShare > 0 ? sum + row.partnerShare : sum),
    0
  )
  const totalLoss = filteredRows.reduce(
    (sum, row) =>
      row.partnerShare < 0 ? sum + Math.abs(row.partnerShare) : sum,
    0
  )
  const partner = reportSummary?.partner
  const bankCashTotal = reportSummary?.bankCashTotal ?? 0
  const netProfitShare = reportSummary?.netProfitShare ?? totalProfit - totalLoss
  const overallBalance = reportSummary?.overallBalance ?? bankCashTotal + netProfitShare

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
              {t('partnerReport')}
            </h1>
            <p className='text-muted-foreground'>
              {t('partnerReportPageDesc')}
            </p>
          </div>
          <ExportButtons />
        </div>

        <ReportFilters
          fields={['partner', 'dateRange']}
          value={filters}
          onChange={setFilters}
          partners={partnerOptions}
        />

        {partner ? (
          <>
            <Card className='border-border/60'>
              <CardHeader>
                <CardTitle className='text-base'>
                  {t('partnerProfile')}
                </CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-12 w-12 rounded-md'>
                    <AvatarFallback className='rounded-md bg-muted font-semibold'>
                      {getDisplayNameInitials(partner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-semibold'>{partner.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      {partner.email || partner.phone || partner.id}
                    </p>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <Badge variant='outline'>
                    {t('investmentPercentage')}: {partner.investmentPercentage}%
                  </Badge>
                  <Badge variant='outline'>
                    {t('bankBalance')}: {formatCurrency(reportSummary?.bankAmount ?? 0)}
                  </Badge>
                  <Badge variant='outline'>
                    {t('cashBalance')}: {formatCurrency(reportSummary?.cashAmount ?? 0)}
                  </Badge>
                  <Badge variant='outline'>
                    {t('bankCashTotal')}: {formatCurrency(bankCashTotal)}
                  </Badge>
                  <Badge variant='outline'>{partner.status}</Badge>
                </div>
              </CardContent>
            </Card>

            <ReportSummaryCards
              items={[
                {
                  label: t('bankBalance'),
                  value: formatCurrency(reportSummary?.bankAmount ?? 0),
                  icon: HandCoins,
                },
                {
                  label: t('cashBalance'),
                  value: formatCurrency(reportSummary?.cashAmount ?? 0),
                  icon: Wallet,
                },
                {
                  label: t('bankCashTotal'),
                  value: formatCurrency(bankCashTotal),
                  icon: CircleDollarSign,
                },
                {
                  label: t('netProfitShare'),
                  value: formatCurrency(netProfitShare),
                  icon: TrendingUp,
                  tone: 'text-emerald-600 dark:text-emerald-400',
                },
                {
                  label: t('overallBalance'),
                  value: formatCurrency(overallBalance),
                  icon: CircleDollarSign,
                },
                {
                  label: t('totalContributions'),
                  value: formatCurrency(totalContribution),
                  icon: HandCoins,
                },
                {
                  label: t('totalLoss'),
                  value: formatCurrency(totalLoss),
                  icon: TrendingDown,
                  tone: 'text-red-600 dark:text-red-400',
                },
              ]}
            />

            <ReportTable<PartnerReportRow>
              title={t('partnerReport')}
              rows={filteredRows}
              emptyMessage={t('noReportDataFound')}
              columns={[
                {
                  key: 'car',
                  header: t('car'),
                  render: (row) => row.car,
                },
                {
                  key: 'date',
                  header: t('date'),
                  render: (row) => formatDate(row.contributionDate),
                },
                {
                  key: 'contribution',
                  header: t('contributionAmount'),
                  render: (row) => formatCurrency(row.contribution),
                },
                {
                  key: 'percentage',
                  header: t('percentage'),
                  render: (row) => `${formatNumber(row.percentage)}%`,
                },
                {
                  key: 'carProfit',
                  header: t('carProfitLoss'),
                  render: (row) => (
                    <span
                      className={
                        row.carProfitLoss >= 0
                          ? 'font-medium text-emerald-600 dark:text-emerald-400'
                          : 'font-medium text-red-600 dark:text-red-400'
                      }
                    >
                      {formatCurrency(row.carProfitLoss)}
                    </span>
                  ),
                },
                {
                  key: 'share',
                  header: t('partnerProfitShare'),
                  className: 'text-end',
                  render: (row) => (
                    <span
                      className={
                        row.partnerShare >= 0
                          ? 'font-medium text-emerald-600 dark:text-emerald-400'
                          : 'font-medium text-red-600 dark:text-red-400'
                      }
                    >
                      {formatCurrency(row.partnerShare)}
                    </span>
                  ),
                },
              ]}
            />
          </>
        ) : (
          <Card className='border-border/60'>
            <CardContent className='p-8 text-center text-muted-foreground'>
              {t('noPartnerSelected')}
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}
