import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  CarFront,
  HandCoins,
  Link2,
  Settings2,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CostSummaryCard } from '@/components/cost-summary-card'
import { StatusBadge } from '@/components/status-badge'
import { type Car } from '@/data/carsMockData'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth-store'
import { EditTitleModal } from '../components/edit-title-modal'
import { TitleBadge } from '../components/title-badge'
import { TitleHistoryTable } from '../components/title-history-table'
import { TitleManagementCard } from '../components/title-management-card'
import { type TitleUpdateValues } from '../types/title'

type CarDetailsProps = {
  car: Car
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function CarDetails({ car }: CarDetailsProps) {
  const { t, locale } = useI18n()
  const currentUser = useAuthStore((state) => state.auth.user)
  const [currentTitle, setCurrentTitle] = useState(car.currentTitle)
  const [titleHistory, setTitleHistory] = useState(car.titleHistory)
  const [titleModalOpen, setTitleModalOpen] = useState(false)

  const openTitleModal = () => {
    setTitleModalOpen(true)
  }

  const handleSaveTitle = (values: TitleUpdateValues) => {
    const today = new Date().toISOString().slice(0, 10)
    const updatedBy =
      currentUser?.email || currentUser?.accountNo || 'Current account'
    const previousTitleType = currentTitle.type
    const nextTitle = {
      type: values.titleType,
      lastUpdatedAt: today,
      updatedBy,
    }

    setCurrentTitle(nextTitle)
    setTitleHistory((current) => [
      {
        id: `title-${car.id}-${Date.now()}`,
        previousTitleType,
        newTitleType: values.titleType,
        changeDate: today,
        updatedBy,
        notes: values.notes.trim() || undefined,
      },
      ...current,
    ])
    setTitleModalOpen(false)
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
        <Card className='overflow-hidden border-border/60'>
          <CardContent className='grid gap-6 p-6 md:grid-cols-[320px_1fr]'>
            <img
              src={car.photo}
              alt={`${car.brand} ${car.model}`}
              className='h-64 w-full rounded-xl object-cover ring-1 ring-border'
            />
            <div className='space-y-5'>
              <div className='space-y-2'>
                <div className='flex flex-wrap items-center gap-3'>
                  <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
                    {car.brand} {car.model} {car.year}
                  </h1>
                  <StatusBadge status={car.status} />
                </div>
                <p className='text-muted-foreground'>
                  Lot {car.lotNumber} - VIN {car.vin}
                </p>
              </div>
              <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
                <InfoCard icon={<CarFront className='h-4 w-4' />} label={t('titleTypeValue')} value={<TitleBadge titleType={currentTitle.type} />} />
                <InfoCard icon={<ShieldCheck className='h-4 w-4' />} label={t('carfax')} value='Available' />
                <InfoCard icon={<HandCoins className='h-4 w-4' />} label={t('totalCost')} value={money.format(car.totalCost)} />
                <InfoCard icon={<Wrench className='h-4 w-4' />} label={t('sellingPrice')} value={money.format(car.sellingPrice)} />
                <InfoCard icon={<Users className='h-4 w-4' />} label={t('netProfit')} value={money.format(car.netProfit)} />
                <InfoCard icon={<Settings2 className='h-4 w-4' />} label={t('purchasePlace')} value={car.purchasePlace} />
              </div>
              <div className='flex flex-wrap gap-3'>
                <Button asChild>
                  <Link to='/cars/$carId/edit' params={{ carId: car.id }}>
                    {t('edit')}
                  </Link>
                </Button>
                <Button asChild variant='outline'>
                  {car.carfaxType === 'pdf' ? (
                    car.carfaxPdfUrl ? (
                      <a href={car.carfaxPdfUrl} target='_blank' rel='noreferrer'>
                        <Link2 className='me-2 h-4 w-4' />
                        {car.carfaxPdfName || t('carfax')}
                      </a>
                    ) : (
                      <span className='inline-flex items-center gap-2'>
                        <Link2 className='me-2 h-4 w-4' />
                        {car.carfaxPdfName || t('carfax')}
                      </span>
                    )
                  ) : (
                    <a href={car.carfaxLink} target='_blank' rel='noreferrer'>
                      <Link2 className='me-2 h-4 w-4' />
                      {t('carfax')}
                    </a>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList className='w-full flex-wrap justify-start'>
            <TabsTrigger value='overview'>{t('overview')}</TabsTrigger>
            <TabsTrigger value='expenses'>{t('expenses')}</TabsTrigger>
            <TabsTrigger value='parts'>{t('parts')}</TabsTrigger>
            <TabsTrigger value='inspection'>{t('inspection')}</TabsTrigger>
            <TabsTrigger value='partners'>{t('partners')}</TabsTrigger>
            <TabsTrigger value='documents'>{t('documents')}</TabsTrigger>
            <TabsTrigger value='title-management'>
              {locale === 'ar' ? 'إدارة الملكية' : 'Title Management'}
            </TabsTrigger>
            <TabsTrigger value='profit'>{t('profitSummary')}</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='grid gap-4 lg:grid-cols-2'>
            <Card className='border-border/60'>
              <CardHeader>
                <CardTitle>{t('carBasicInformation')}</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-3 text-sm'>
                <InfoRow label={t('brand')} value={car.brand} />
                <InfoRow label={t('model')} value={car.model} />
                <InfoRow label={t('year')} value={String(car.year)} />
                <InfoRow label='VIN' value={car.vin} />
                <InfoRow label={t('lotNumber')} value={car.lotNumber} />
                <InfoRow label={t('purchaseDate')} value={car.purchaseDate} />
                <InfoRow label={t('purchasePlace')} value={car.purchasePlace} />
                <InfoRow
                  label={t('carfax')}
                  value={
                    car.carfaxType === 'pdf'
                      ? car.carfaxPdfName || 'PDF uploaded'
                      : car.carfaxLink || 'Link'
                  }
                />
                <InfoRow label={t('status')} value={<StatusBadge status={car.status} />} />
              </CardContent>
            </Card>
            <Card className='border-border/60'>
              <CardHeader>
                <CardTitle>{t('notes')}</CardTitle>
              </CardHeader>
              <CardContent className='text-sm text-muted-foreground'>
                {car.notes}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='expenses' className='space-y-4'>
            <SimpleTable
              title={t('expenses')}
              headers={[t('brand'), t('purchaseDate'), t('totalCost')]}
              rows={car.expenses.map((expense) => [
                expense.label,
                expense.date,
                money.format(expense.amount),
              ])}
            />
          </TabsContent>

          <TabsContent value='parts' className='space-y-4'>
            <SimpleTable
              title={t('parts')}
              headers={[t('parts'), locale === 'ar' ? 'المورد' : 'Vendor', locale === 'ar' ? 'التكلفة' : 'Cost']}
              rows={car.parts.map((part) => [part.name, part.vendor, money.format(part.cost)])}
            />
          </TabsContent>

          <TabsContent value='inspection' className='space-y-4'>
            <SimpleTable
              title={t('inspection')}
              headers={[locale === 'ar' ? 'الجدول' : 'Schedule', locale === 'ar' ? 'الفاحص' : 'Inspector', t('status')]}
              rows={car.inspections.map((inspection) => [
                inspection.schedule,
                inspection.inspector,
                <StatusBadge key={inspection.id} status={inspection.status} />,
              ])}
            />
          </TabsContent>

          <TabsContent value='partners' className='space-y-4'>
            <SimpleTable
              title={t('partners')}
              headers={[locale === 'ar' ? 'الشريك' : 'Partner', locale === 'ar' ? 'الحصة' : 'Share', locale === 'ar' ? 'الاستثمار' : 'Investment']}
              rows={car.partners.map((partner) => [
                partner.name,
                partner.share,
                money.format(partner.investment),
              ])}
            />
          </TabsContent>

          <TabsContent value='documents' className='space-y-4'>
            <SimpleTable
              title={t('documents')}
              headers={[locale === 'ar' ? 'المستند' : 'Document', locale === 'ar' ? 'النوع' : 'Type', locale === 'ar' ? 'الرابط' : 'Link']}
              rows={car.documents.map((document) => [
                document.name,
                document.type,
                <span key={document.id} className='text-muted-foreground'>
                  Available
                </span>,
              ])}
            />
          </TabsContent>

          <TabsContent value='title-management' className='space-y-4'>
            <TitleManagementCard
              currentTitle={currentTitle}
              onEditTitle={openTitleModal}
              onAddNotes={openTitleModal}
            />
            <TitleHistoryTable history={titleHistory} />
          </TabsContent>

          <TabsContent value='profit' className='space-y-4'>
            <div className='grid gap-4 lg:grid-cols-[1fr_360px]'>
              <Card className='border-border/60'>
                <CardHeader>
                  <CardTitle>{t('profitSummary')}</CardTitle>
                </CardHeader>
                <CardContent className='grid gap-3 sm:grid-cols-3'>
                  <MetricCard label={t('totalCost')} value={money.format(car.totalCost)} />
                  <MetricCard label={t('sellingPrice')} value={money.format(car.sellingPrice)} />
                  <MetricCard label={t('netProfit')} value={money.format(car.netProfit)} highlight />
                </CardContent>
              </Card>
              <CostSummaryCard breakdown={car.costBreakdown} sellingPrice={car.sellingPrice} />
            </div>
          </TabsContent>
        </Tabs>
      </Main>

      <EditTitleModal
        open={titleModalOpen}
        onOpenChange={setTitleModalOpen}
        currentTitle={currentTitle}
        onSave={handleSaveTitle}
      />
    </>
  )
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
}) {
  return (
    <Card className='border-border/60'>
      <CardContent className='flex items-center gap-3 p-4'>
        <div className='rounded-md bg-muted p-2 text-muted-foreground'>{icon}</div>
        <div>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>
            {label}
          </p>
          <p className='font-medium'>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className='flex items-center justify-between gap-4 border-b pb-2 last:border-0 last:pb-0'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-medium text-right'>{value}</span>
    </div>
  )
}

function MetricCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        highlight && 'border-emerald-500/20 bg-emerald-500/5'
      )}
    >
      <p className='text-sm text-muted-foreground'>{label}</p>
      <p className='mt-2 text-lg font-semibold'>{value}</p>
    </div>
  )
}

function SimpleTable({
  title,
  headers,
  rows,
}: {
  title: string
  headers: string[]
  rows: ReactNode[][]
}) {
  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={`${title}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={`${title}-${rowIndex}-${cellIndex}`}>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
