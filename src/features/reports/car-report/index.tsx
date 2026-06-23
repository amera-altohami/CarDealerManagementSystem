import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { type ExpenseType } from '@/data/dealerOperationsMockData'
import { getCarReport, reportExpenseTypes } from '@/services/reportsService'
import {
  ArrowLeft,
  CircleDollarSign,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { toast } from 'sonner'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { getExpenseTypeLabel, useI18n } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { StatusBadge } from '@/components/status-badge'
import { ThemeSwitch } from '@/components/theme-switch'
import { ExportButtons } from '../components/export-buttons'
import { ReportFilters } from '../components/report-filters'
import { ReportPreviewCard } from '../components/report-preview-card'
import { ReportSummaryCards } from '../components/report-summary-cards'
import { ReportTable } from '../components/report-table'
import { formatCurrency, formatDate, formatNumber } from '../data/formatters'
import {
  type CarPartnerReportRow,
  type ReportCar,
  type ReportFilterValues,
} from '../data/schema'

const expenseTypeCostKeys: Record<
  ExpenseType,
  keyof ReportCar['costBreakdown']
> = {
  Purchase: 'purchase',
  Shipping: 'shipping',
  Repair: 'repair',
  Parts: 'parts',
  Labor: 'labor',
  Inspection: 'inspection',
  Fees: 'fees',
  Other: 'other',
}

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

export function CarReport() {
  const { t, locale } = useI18n()
  const [filters, setFilters] = useState(initialFilters)
  const carReportQuery = useQuery({
    queryKey: ['reports', 'car'],
    queryFn: () => getCarReport(),
  })

  useEffect(() => {
    if (carReportQuery.isError) {
      toast.error(getFirestoreErrorMessage(carReportQuery.error))
    }
  }, [carReportQuery.error, carReportQuery.isError])

  const selectedCar = useMemo(() => {
    const cars = carReportQuery.data?.cars ?? []

    if (filters.carId === 'all') {
      return cars[0]
    }

    return cars.find((car) => car.id === filters.carId)
  }, [carReportQuery.data?.cars, filters.carId])

  const partnerRows = useMemo(
    () =>
      selectedCar
        ? (carReportQuery.data?.partnerRowsByCarId[selectedCar.id] ?? [])
        : [],
    [carReportQuery.data?.partnerRowsByCarId, selectedCar]
  )

  const costRows = selectedCar
    ? [
        ...reportExpenseTypes.map((expenseType) => ({
          label: getExpenseTypeLabel(expenseType, locale),
          value: selectedCar.costBreakdown[expenseTypeCostKeys[expenseType]],
        })),
        { label: t('totalCost'), value: selectedCar.totalCost },
      ]
    : []

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
              {t('carReport')}
            </h1>
            <p className='text-muted-foreground'>{t('carReportPageDesc')}</p>
          </div>
          <ExportButtons />
        </div>

        <ReportFilters
          fields={['car']}
          value={filters}
          onChange={setFilters}
          cars={carReportQuery.data?.carOptions ?? []}
        />

        {selectedCar ? (
          <>
            <ReportSummaryCards
              items={[
                {
                  label: t('totalCost'),
                  value: formatCurrency(selectedCar.totalCost),
                  icon: WalletCards,
                },
                {
                  label: t('sellingPrice'),
                  value: formatCurrency(selectedCar.sellingPrice),
                  icon: CircleDollarSign,
                },
                {
                  label:
                    selectedCar.netProfit >= 0 ? t('netProfit') : t('netLoss'),
                  value: formatCurrency(selectedCar.netProfit),
                  icon: TrendingUp,
                  tone:
                    selectedCar.netProfit >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400',
                },
              ]}
            />

            <ReportPreviewCard
              title={selectedCar.name}
              description={`${t('generatedReportPreview')} ${formatDate(
                selectedCar.purchaseDate
              )}`}
              actions={<ExportButtons />}
            >
              <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
                <InfoItem label={t('brand')} value={selectedCar.brand} />
                <InfoItem label={t('model')} value={selectedCar.model} />
                <InfoItem label={t('year')} value={String(selectedCar.year)} />
                <InfoItem label={t('vin')} value={selectedCar.vin} />
                <InfoItem
                  label={t('lotNumber')}
                  value={selectedCar.lotNumber}
                />
                <InfoItem
                  label={t('purchasePlace')}
                  value={selectedCar.purchasePlace}
                />
                <div className='space-y-2'>
                  <p className='text-sm text-muted-foreground'>
                    {t('titleType')}
                  </p>
                  <Badge variant='outline'>{selectedCar.titleType}</Badge>
                </div>
                <div className='space-y-2'>
                  <p className='text-sm text-muted-foreground'>{t('status')}</p>
                  <StatusBadge status={selectedCar.status} />
                </div>
              </div>
            </ReportPreviewCard>

            <ReportTable
              title={t('costSummary')}
              rows={costRows}
              emptyMessage={t('noReportDataFound')}
              columns={[
                {
                  key: 'label',
                  header: t('type'),
                  render: (row) => row.label,
                },
                {
                  key: 'value',
                  header: t('amount'),
                  className: 'text-end',
                  render: (row) => formatCurrency(row.value),
                },
              ]}
            />

            <ReportTable<CarPartnerReportRow>
              title={t('partners')}
              rows={partnerRows}
              emptyMessage={t('noPartnersFound')}
              columns={[
                {
                  key: 'partner',
                  header: t('partner'),
                  render: (row) => row.partner,
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
                  key: 'share',
                  header: t('partnerProfitShare'),
                  className: 'text-end',
                  render: (row) => (
                    <span
                      className={
                        row.partnerProfitShare >= 0
                          ? 'font-medium text-emerald-600 dark:text-emerald-400'
                          : 'font-medium text-red-600 dark:text-red-400'
                      }
                    >
                      {formatCurrency(row.partnerProfitShare)}
                    </span>
                  ),
                },
              ]}
            />
          </>
        ) : (
          <Card className='border-border/60'>
            <CardContent className='p-8 text-center text-muted-foreground'>
              {t('noCarSelected')}
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className='space-y-1'>
      <p className='text-sm text-muted-foreground'>{label}</p>
      <p className='font-medium'>{value}</p>
    </div>
  )
}
