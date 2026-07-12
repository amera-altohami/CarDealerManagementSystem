import { useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { HandCoins, Link2, Package, ShieldCheck, TrendingDown, TrendingUp, Wrench } from 'lucide-react'
import { type Car } from '@/services/carsService'
import { getPartsByCarId, type Part } from '@/services/partsService'
import { useAuthStore } from '@/stores/auth-store'
import { useI18n, type MessageKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { StatusBadge } from '@/components/status-badge'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  type PartnerContribution,
  type ProfitShare,
} from '@/features/partners/data/schema'
import { useCompanyQuery } from '@/features/companies/hooks/use-companies'
import { EditTitleModal } from '../components/edit-title-modal'
import { TitleBadge } from '../components/title-badge'
import { TitleHistoryTable } from '../components/title-history-table'
import { TitleManagementCard } from '../components/title-management-card'
import { type CurrentTitle, type TitleHistoryEntry, type TitleUpdateValues } from '../types/title'
import {
  useCreateTitleHistoryMutation,
  useTitleHistoryQuery,
} from '../hooks/use-title-history'
import { useInspectionsQuery } from '@/features/inspections/hooks/use-inspections'
import { type Inspection } from '@/services/inspectionsService'
import {
  useContributionsByCarQuery,
  usePartnersQuery,
  useProfitSharesByCarQuery,
} from '@/features/partners/hooks/use-partners'
import {
  useCarDeleteCheckQuery,
  useCarQuery,
  useDeleteCarMutation,
} from '../hooks/use-cars'

type CarDetailsProps = {
  carId: string
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const profitShareStatusStyles: Record<ProfitShare['status'], string> = {
  Pending:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Paid: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Loss: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
}

const profitShareStatusLabelKeys: Record<ProfitShare['status'], MessageKey> = {
  Pending: 'pendingStatus',
  Paid: 'paidStatus',
  Loss: 'lossStatus',
}

function getInspectionSortKey(inspection: Inspection) {
  const createdAt = inspection.createdAt
  if (createdAt instanceof Date) {
    return createdAt.getTime()
  }

  if (typeof createdAt === 'string') {
    const parsed = Date.parse(createdAt)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  if (createdAt && typeof createdAt === 'object' && 'toMillis' in createdAt && typeof createdAt.toMillis === 'function') {
    return createdAt.toMillis()
  }

  if (inspection.updatedAt instanceof Date) {
    return inspection.updatedAt.getTime()
  }

  if (typeof inspection.updatedAt === 'string') {
    const parsed = Date.parse(inspection.updatedAt)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  return Date.parse(`${inspection.date}T${inspection.time}:00.000Z`)
}

function getTitleHistorySortKey(entry: {
  createdAt?: unknown
  updatedAt?: unknown
  changeDate: string
}) {
  if (entry.createdAt instanceof Date) {
    return entry.createdAt.getTime()
  }

  if (typeof entry.createdAt === 'string') {
    const parsed = Date.parse(entry.createdAt)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  if (entry.createdAt && typeof entry.createdAt === 'object' && 'toMillis' in entry.createdAt && typeof entry.createdAt.toMillis === 'function') {
    return entry.createdAt.toMillis()
  }

  if (entry.updatedAt instanceof Date) {
    return entry.updatedAt.getTime()
  }

  if (typeof entry.updatedAt === 'string') {
    const parsed = Date.parse(entry.updatedAt)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  if (entry.updatedAt && typeof entry.updatedAt === 'object' && 'toMillis' in entry.updatedAt && typeof entry.updatedAt.toMillis === 'function') {
    return entry.updatedAt.toMillis()
  }

  const parsedChangeDate = Date.parse(`${entry.changeDate}T00:00:00.000Z`)
  return Number.isNaN(parsedChangeDate) ? 0 : parsedChangeDate
}

export function CarDetails({ carId }: CarDetailsProps) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.auth.profile)
  const carQuery = useCarQuery(carId)
  const carDeleteCheckQuery = useCarDeleteCheckQuery(carId)
  const deleteCarMutation = useDeleteCarMutation()
  const inspectionsQuery = useInspectionsQuery({ carId })
  const titleHistoryQuery = useTitleHistoryQuery({ carId })
  const createTitleHistoryMutation = useCreateTitleHistoryMutation()
  const partsQuery = useQuery({
    queryKey: ['car-details', 'parts', carId] as const,
    queryFn: () => getPartsByCarId(carId),
    enabled: Boolean(carId),
  })
  const contributionsQuery = useContributionsByCarQuery(carId)
  const profitSharesQuery = useProfitSharesByCarQuery(carId)
  const partnersQuery = usePartnersQuery()
  const car = carQuery.data
  const purchasePlaceQuery = useCompanyQuery(car?.purchasePlaceId ?? '')
  const [titleModalOpen, setTitleModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  if (carQuery.isLoading) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <div className='rounded-lg border p-6 text-center'>
          <h1 className='text-lg font-semibold'>Loading...</h1>
        </div>
      </Main>
    )
  }

  if (carQuery.isError) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <div className='rounded-lg border p-6 text-center'>
          <h1 className='text-lg font-semibold'>{t('carNotFound')}</h1>
          <p className='mt-2 text-sm text-destructive'>
            {getFirestoreErrorMessage(carQuery.error)}
          </p>
        </div>
      </Main>
    )
  }

  if (!car) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <div className='rounded-lg border p-6 text-center'>
          <h1 className='text-lg font-semibold'>{t('carNotFound')}</h1>
          <p className='mt-2 text-sm text-muted-foreground'>{t('carNotFoundDesc')}</p>
        </div>
      </Main>
    )
  }

  const currentTitle: CurrentTitle = {
    type: car.currentTitleType,
    lastUpdatedAt: car.titleLastUpdatedAt,
    updatedBy: car.titleUpdatedBy,
  }
  const titleHistory: TitleHistoryEntry[] = (titleHistoryQuery.data ?? []).map((entry) => ({
    id: entry.id,
    previousTitleType: entry.previousTitleType,
    newTitleType: entry.newTitleType,
    changeDate: entry.changeDate,
    updatedBy: entry.updatedBy,
    notes: entry.notes,
  }))
  const latestSalvageHistory = [...(titleHistoryQuery.data ?? [])]
    .filter((entry) => entry.newTitleType === 'Salvage')
    .sort((first, second) => getTitleHistorySortKey(second) - getTitleHistorySortKey(first))[0]
  const parts = partsQuery.data ?? []
  const inspections = inspectionsQuery.data ?? []
  const partsTotalCost = parts.reduce((sum, part) => sum + part.price, 0)
  const totalCost = car.purchasePrice + partsTotalCost
  const latestInspection = [...inspections].sort(
    (first, second) => getInspectionSortKey(second) - getInspectionSortKey(first)
  )[0]
  const latestInspectionAfterSalvage =
    latestSalvageHistory &&
    latestInspection &&
    latestInspection.status === 'Passed' &&
    getInspectionSortKey(latestInspection) >
      getTitleHistorySortKey(latestSalvageHistory ?? { changeDate: '1970-01-01' })
  const salvageInspectionRequired = currentTitle.type === 'Salvage'
  const carPartnerContributions = contributionsQuery.data ?? []
  const carProfitShares = profitSharesQuery.data ?? []
  const partnerNameById = new Map(
    (partnersQuery.data ?? []).map((partner) => [partner.id, partner.name])
  )
  const purchasePlaceName =
    purchasePlaceQuery.data?.name?.trim() || car.purchasePlace
  const canDelete = carDeleteCheckQuery.data?.canDelete ?? false
  const deleteBlockedReason = canDelete
    ? null
    : locale === 'ar'
      ? 'لا يمكن حذف هذه السيارة لأنها مرتبطة بسجلات أخرى.'
      : 'Cannot delete this car because it has related records.'

  const openTitleModal = () => setTitleModalOpen(true)

  const handleSaveTitle = async (values: TitleUpdateValues) => {
    const today = new Date().toISOString().slice(0, 10)
    const updatedBy =
      currentUser?.email || currentUser?.fullName || t('currentAccount')
    await createTitleHistoryMutation.mutateAsync({
      carId: car.id,
      previousTitleType: currentTitle.type,
      newTitleType: values.titleType,
      changeDate: today,
      updatedBy,
      notes: values.notes.trim() || undefined,
    })
    setTitleModalOpen(false)

    if (values.titleType === 'Salvage') {
      navigate({
        to: '/inspections/new',
        search: { carId: car.id },
      })
    }
  }

  const convertToRebuiltTitle = () => {
    void handleSaveTitle({
      titleType: 'Rebuilt',
      notes: t('rebuildTitleNotes'),
    })
  }
  const partsByInvoice = useMemo(() => groupPartsByInvoice(parts), [parts])

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
          <CardContent className='grid gap-6 p-4 sm:p-6 lg:grid-cols-[320px_1fr]'>
            <img
              src={car.photo}
              alt={`${car.brand} ${car.model}`}
              className='h-56 w-full rounded-xl object-cover ring-1 ring-border sm:h-64'
            />

            <div className='space-y-5'>
              <div className='space-y-2'>
                <div className='flex flex-wrap items-center gap-3'>
                  <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
                    {car.brand} {car.model} {car.year}
                  </h1>
                  <StatusBadge status={car.status} />
                  <TitleBadge titleType={currentTitle.type} />
                </div>
                <p className='text-muted-foreground'>
                  {t('mileage')} {car.mileage} - {t('vin')} {car.vin}
                </p>
              </div>

              <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                <InfoCard
                  icon={<HandCoins className='h-4 w-4' />}
                  label={t('purchasePrice')}
                  value={money.format(car.purchasePrice)}
                />
                <InfoCard
                  icon={<HandCoins className='h-4 w-4' />}
                  label={t('totalCost')}
                  value={money.format(totalCost)}
                />
                <InfoCard
                  icon={<Package className='h-4 w-4' />}
                  label={t('sellingPrice')}
                  value={money.format(car.sellingPrice)}
                />
                <InfoCard
                  icon={<HandCoins className='h-4 w-4' />}
                  label={t('partsCost')}
                  value={money.format(partsTotalCost)}
                />
                <InfoCard
                  icon={
                    car.sellingPrice - totalCost >= 0 ? (
                      <TrendingUp className='h-4 w-4' />
                    ) : (
                      <TrendingDown className='h-4 w-4' />
                    )
                  }
                  label={t('netProfit')}
                  value={
                    <span
                      className={cn(
                        'font-semibold',
                        car.sellingPrice - totalCost >= 0
                          ? 'text-emerald-600 dark:text-emerald-300'
                          : 'text-red-600 dark:text-red-300'
                      )}
                    >
                      {money.format(car.sellingPrice - totalCost)}
                    </span>
                  }
                />
              </div>

              <div className='flex flex-col gap-3 sm:flex-row'>
                <Button asChild className='w-full sm:w-auto'>
                  <Link to='/cars/$carId/edit' params={{ carId: car.id }}>
                    {t('edit')}
                  </Link>
                </Button>
                <Button
                  variant='destructive'
                  className='w-full sm:w-auto'
                  disabled={
                    carDeleteCheckQuery.isLoading || deleteCarMutation.isPending
                  }
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  {t('delete')}
                </Button>
                {car.carfaxType !== 'none' ? (
                  <Button asChild variant='outline' className='w-full sm:w-auto'>
                    {car.carfaxType === 'pdf' ? (
                      car.carfaxPdfUrl ? (
                        <a
                          href={car.carfaxPdfUrl}
                          target='_blank'
                          rel='noreferrer'
                        >
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
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList className='w-full'>
            <TabsTrigger value='overview'>{t('overview')}</TabsTrigger>
            <TabsTrigger value='title'>{t('titleManagement')}</TabsTrigger>
            <TabsTrigger value='parts'>{t('parts')}</TabsTrigger>
            <TabsTrigger value='inspection'>{t('inspection')}</TabsTrigger>
            <TabsTrigger value='partners'>{t('partners')}</TabsTrigger>
            <TabsTrigger value='documents'>{t('documents')}</TabsTrigger>
          </TabsList>

          <TabsContent
            value='overview'
            className='grid gap-4 xl:grid-cols-[1.1fr_0.9fr]'
          >
            <Card className='border-border/60'>
              <CardHeader>
                <CardTitle>{t('carInformation')}</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-3 text-sm'>
                <InfoRow label={t('brand')} value={car.brand} />
                <InfoRow label={t('model')} value={car.model} />
                <InfoRow label={t('year')} value={String(car.year)} />
                <InfoRow label={t('vin')} value={car.vin} />
                <InfoRow label={t('mileage')} value={car.mileage} />
                <InfoRow label={t('purchaseDate')} value={car.purchaseDate} />
                <InfoRow label={t('purchasePlace')} value={purchasePlaceName} />
                <InfoRow
                  label={t('carfax')}
                  value={
                    car.carfaxType === 'pdf'
                      ? car.carfaxPdfName || t('pdfUploaded')
                      : car.carfaxType === 'link'
                        ? car.carfaxLink || t('link')
                        : t('carfaxLater')
                  }
                />
                <InfoRow
                  label={t('status')}
                  value={<StatusBadge status={car.status} />}
                />
              </CardContent>
            </Card>

            <div className='space-y-4'>
              <Card className='border-border/60'>
                <CardHeader>
                  <CardTitle>{t('quickMetrics')}</CardTitle>
                </CardHeader>
                <CardContent className='grid gap-3 sm:grid-cols-2'>
                  <SummaryCard
                    label={t('partsCount')}
                    value={String(parts.length)}
                  />
                  <SummaryCard
                    label={t('partnersCount')}
                    value={String(carPartnerContributions.length)}
                  />
                  <SummaryCard
                    label={t('inspectionsCount')}
                    value={String(inspections.length)}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='title' className='space-y-4'>
              <TitleManagementCard
                currentTitle={currentTitle}
                onEditTitle={openTitleModal}
                onAddNotes={openTitleModal}
                onConvertToRebuilt={convertToRebuiltTitle}
                canConvertToRebuilt={Boolean(latestInspectionAfterSalvage)}
              />
            <TitleHistoryTable history={titleHistory} />
          </TabsContent>

          <TabsContent value='parts' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
              <SummaryCard
                title={t('totalParts')}
                value={String(parts.length)}
                icon={<Package className='h-4 w-4' />}
              />
              <SummaryCard
                title={t('installed')}
                value={String(parts.filter((part) => part.installed).length)}
                icon={<ShieldCheck className='h-4 w-4' />}
              />
              <SummaryCard
                title={t('pending')}
                value={String(parts.filter((part) => !part.installed).length)}
                icon={<Wrench className='h-4 w-4' />}
              />
              <SummaryCard
                title={t('partsCost')}
                value={money.format(partsTotalCost)}
                icon={<HandCoins className='h-4 w-4' />}
              />
            </div>
            <PartsReceiptGroups groups={partsByInvoice} />
          </TabsContent>

          <TabsContent value='inspection' className='space-y-4'>
            {inspectionsQuery.isError ? (
              <Card className='border-destructive/20 bg-destructive/5'>
                <CardContent className='space-y-2 p-4'>
                  <p className='font-medium text-destructive'>
                    {t('inspectionDetails')}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {getFirestoreErrorMessage(inspectionsQuery.error)}
                  </p>
                </CardContent>
              </Card>
            ) : salvageInspectionRequired ? (
              <>
                <Card className='border-amber-500/20 bg-amber-500/5'>
                  <CardContent className='space-y-4 p-4'>
                    <div className='space-y-1'>
                      <p className='font-medium'>
                        {t('inspectionRequiredForSalvage')}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {t('inspectionRequiredHelp')}
                      </p>
                    </div>
                    <div className='flex flex-wrap gap-3'>
                      <Button asChild variant='secondary'>
                        <Link to='/inspections/new' search={{ carId: car.id }}>
                          {t('addInspection')}
                        </Link>
                      </Button>
                      <Button variant='outline'>{t('sendReminder')}</Button>
                    </div>
                  </CardContent>
                </Card>
                <InspectionTimeline inspections={inspections} />
              </>
            ) : (
              <Card className='border-border/60'>
                <CardContent className='p-6 text-sm text-muted-foreground'>
                  {t('inspectionWorkflowAvailable')}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value='partners' className='space-y-4'>
            <PartnerInvestmentsTable
              contributions={carPartnerContributions}
              profitShares={carProfitShares}
              partnerNameById={partnerNameById}
            />
          </TabsContent>

          <TabsContent value='documents' className='space-y-4'>
            <DocumentsCard car={car} parts={parts} inspections={inspections} />
          </TabsContent>
        </Tabs>
      </Main>

      <EditTitleModal
        open={titleModalOpen}
        onOpenChange={setTitleModalOpen}
        currentTitle={currentTitle}
        onSave={handleSaveTitle}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('deleteCar')}
        desc={
          canDelete
            ? locale === 'ar'
              ? (
                <span>
                  هل أنت متأكد من حذف <strong>{car.brand} {car.model} {car.year}</strong>؟
                  <br />
                  هذا الإجراء سيحذف السيارة فقط ولا يمكن التراجع عنه.
                </span>
                )
              : (
                <span>
                  Are you sure you want to delete <strong>{car.brand} {car.model} {car.year}</strong>?
                  This action will delete only the car record and cannot be undone.
                </span>
                )
            : deleteBlockedReason ?? ''
        }
        destructive
        confirmText={t('delete')}
        cancelBtnText={t('cancel')}
        disabled={!canDelete}
        isLoading={carDeleteCheckQuery.isLoading || deleteCarMutation.isPending}
        handleConfirm={async () => {
          try {
            await deleteCarMutation.mutateAsync(car.id)
            setDeleteDialogOpen(false)
            navigate({ to: '/cars' })
          } catch {
            // The mutation hook already shows the warning or error toast.
          }
        }}
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
        <div className='rounded-md bg-muted p-2 text-muted-foreground'>
          {icon}
        </div>
        <div>
          <p className='text-xs tracking-wide text-muted-foreground uppercase'>
            {label}
          </p>
          <p className='font-medium'>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryCard({
  title,
  label,
  value,
  icon,
}: {
  title?: string
  label?: string
  value: string
  icon?: ReactNode
}) {
  const heading = label ?? title ?? ''

  return (
    <Card className='border-border/60'>
      <CardContent className='flex items-center gap-3 p-4'>
        {icon ? (
          <div className='rounded-md bg-muted p-2 text-muted-foreground'>
            {icon}
          </div>
        ) : null}
        <div>
          <p className='text-xs tracking-wide text-muted-foreground uppercase'>
            {heading}
          </p>
          <p className='font-semibold'>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className='flex flex-col gap-1 border-b pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='max-w-full break-words text-start font-medium sm:max-w-[60%] sm:text-end'>
        {value}
      </span>
    </div>
  )
}

type PartsReceiptGroup = {
  id: string
  invoiceName: string | null
  parts: Part[]
  totalCost: number
}

function groupPartsByInvoice(parts: Part[]): PartsReceiptGroup[] {
  const groups = new Map<string, PartsReceiptGroup>()

  for (const part of parts) {
    const invoiceName = part.invoiceName?.trim() || null
    const id = invoiceName ?? '__no_invoice__'
    const existing = groups.get(id)

    if (existing) {
      existing.parts.push(part)
      existing.totalCost += part.price
      continue
    }

    groups.set(id, {
      id,
      invoiceName,
      parts: [part],
      totalCost: part.price,
    })
  }

  return [...groups.values()]
}

function PartsReceiptGroups({ groups }: { groups: PartsReceiptGroup[] }) {
  const { t, locale } = useI18n()
  const missingInvoiceLabel = locale === 'ar' ? 'بدون فاتورة' : 'No invoice'

  if (!groups.length) {
    return (
      <Card className='border-border/60'>
        <CardHeader>
          <CardTitle>{t('parts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
            {t('noPartsFound')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {groups.map((group) => (
        <Card key={group.id} className='border-border/60'>
          <CardHeader className='space-y-2'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <CardTitle className='text-base sm:text-lg'>
                {group.invoiceName ?? missingInvoiceLabel}
              </CardTitle>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge variant='secondary'>
                  {group.parts.length}
                </Badge>
                <Badge variant='outline'>
                  {money.format(group.totalCost)}
                </Badge>
              </div>
            </div>
            <p className='text-sm text-muted-foreground'>
              {group.invoiceName
                ? group.invoiceName
                : t('standaloneInventory')}
            </p>
          </CardHeader>
          <CardContent>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('partName')}</TableHead>
                    <TableHead>{t('supplier')}</TableHead>
                    <TableHead>{t('price')}</TableHead>
                    <TableHead>{t('purchaseDate')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('invoice')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.parts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell className='font-medium'>
                        {part.partName}
                      </TableCell>
                      <TableCell>{part.supplierName}</TableCell>
                      <TableCell>{money.format(part.price)}</TableCell>
                      <TableCell>{part.purchaseDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={
                            part.installed
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                              : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          }
                        >
                          {part.installed ? t('installed') : t('notInstalled')}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {part.invoiceName ?? '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PartnerInvestmentsTable({
  contributions,
  profitShares,
  partnerNameById,
}: {
  contributions: PartnerContribution[]
  profitShares: ProfitShare[]
  partnerNameById: Map<string, string>
}) {
  const { t } = useI18n()

  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle>{t('partnersInvestments')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('partner')}</TableHead>
                <TableHead>{t('totalContribution')}</TableHead>
                <TableHead>{t('percentage')}</TableHead>
                <TableHead>{t('partnerProfitShare')}</TableHead>
                <TableHead>{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributions.length ? (
                contributions.map((contribution) => {
                  const profitShare = profitShares.find(
                    (item) => item.partnerId === contribution.partnerId
                  )
                  const status = profitShare?.status ?? 'Pending'

                  return (
                    <TableRow key={contribution.id}>
                      <TableCell>
                        <Link
                          to='/partners/$partnerId'
                          params={{ partnerId: contribution.partnerId }}
                          className='font-medium underline-offset-4 hover:underline'
                        >
                          {partnerNameById.get(contribution.partnerId) ??
                            contribution.partnerId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {money.format(contribution.contributionAmount)}
                      </TableCell>
                      <TableCell>
                        {contribution.investmentPercentage}%
                      </TableCell>
                      <TableCell
                        className={cn(
                          'font-medium',
                          (profitShare?.partnerProfitShare ?? 0) >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {money.format(profitShare?.partnerProfitShare ?? 0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={profitShareStatusStyles[status]}
                        >
                          {t(profitShareStatusLabelKeys[status])}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center'>
                    {t('noContributionsFound')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function InspectionTimeline({
  inspections,
}: {
  inspections: Inspection[]
}) {
  const { t } = useI18n()

  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle>{t('inspectionHistory')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {inspections.map((inspection) => (
          <div key={inspection.id} className='rounded-lg border p-4'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div>
                <p className='font-medium'>
                  {inspection.date} {t('at')} {inspection.time}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {inspection.placeName}
                </p>
              </div>
              <StatusBadge status={inspection.status} />
            </div>
            <p className='mt-3 text-sm text-muted-foreground'>
              {inspection.notes}
            </p>
            <div className='mt-3 flex flex-wrap gap-2'>
              {inspection.files.map((file) => (
                <Badge key={file} variant='secondary'>
                  {file}
                </Badge>
              ))}
              {inspection.receipts.map((file) => (
                <Badge key={file} variant='secondary'>
                  {file}
                </Badge>
              ))}
            </div>
          </div>
        ))}
        {!inspections.length ? (
          <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
            {t('noInspectionsYet')}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function DocumentsCard({
  car,
  parts,
  inspections,
}: {
  car: Car
  parts: Part[]
  inspections: Inspection[]
}) {
  const { t } = useI18n()
  const carDocuments = (car as Car & { documents?: Array<{ name: string }> })
    .documents ?? []
  const documentNames = [
    ...carDocuments.map((document) => document.name),
    ...(parts.map((part) => part.invoiceName).filter(Boolean) as string[]),
    ...inspections.flatMap((inspection) => [
      ...inspection.files,
      ...inspection.receipts,
      ...inspection.beforeImages,
      ...inspection.afterImages,
    ]),
  ]

  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle>{t('filesAndDocuments')}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-wrap gap-2'>
        {documentNames.length ? (
          documentNames.map((name) => (
            <Badge key={name} variant='secondary' className='px-3 py-1.5'>
              {name}
            </Badge>
          ))
        ) : (
          <div className='rounded-lg border border-dashed p-6 text-sm text-muted-foreground'>
            {t('noUploadedFilesYet')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

