import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  FileText,
  HandCoins,
  Link2,
  Package,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CostSummaryCard } from '@/components/cost-summary-card'
import { StatusBadge } from '@/components/status-badge'
import { cn } from '@/lib/utils'
import { getExpenseTypeLabel, getPaymentMethodLabel, useI18n } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth-store'
import { calculateCarExpenseSummary, getExpensesByCarId, getInspectionsByCarId, getPartsByCarId, type Expense, type Part } from '@/data/dealerOperationsMockData'
import { type Car } from '@/data/carsMockData'
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
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.auth.user)
  const [currentTitle, setCurrentTitle] = useState(car.currentTitle)
  const [titleHistory, setTitleHistory] = useState(car.titleHistory)
  const [titleModalOpen, setTitleModalOpen] = useState(false)

  const expenses = getExpensesByCarId(car.id)
  const parts = getPartsByCarId(car.id)
  const inspections = getInspectionsByCarId(car.id)
  const expenseSummary = calculateCarExpenseSummary(car.id)
  const totalProfit = car.sellingPrice - expenseSummary.totalCost
  const salvageInspectionRequired = currentTitle.type === 'Salvage'
  const currentMonthKey = new Date().toISOString().slice(0, 7)
  const thisMonthExpenses = expenses.filter((expense) =>
    expense.date.startsWith(currentMonthKey)
  )
  const highestExpenseType = Object.entries(expenseSummary)
    .filter(([key]) => key !== 'totalCost')
    .sort(([, a], [, b]) => b - a)[0]?.[0]
  const highestExpenseTypeLabel = highestExpenseType
    ? getExpenseTypeLabel(highestExpenseType as Expense['expenseType'], locale === 'ar' ? 'ar' : 'en')
    : '-'

  const openTitleModal = () => setTitleModalOpen(true)

  const convertToRebuiltTitle = () => {
    handleSaveTitle({
      titleType: 'Rebuilt',
      notes: t('rebuildTitleNotes'),
    })
  }

  const handleSaveTitle = (values: TitleUpdateValues) => {
    const today = new Date().toISOString().slice(0, 10)
    const updatedBy =
      currentUser?.email || currentUser?.accountNo || t('currentAccount')
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

    if (values.titleType === 'Salvage') {
      navigate({
        to: '/inspections/new',
        search: { carId: car.id },
      })
    }
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
          <CardContent className='grid gap-6 p-6 lg:grid-cols-[320px_1fr]'>
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
                  <TitleBadge titleType={currentTitle.type} />
                </div>
                <p className='text-muted-foreground'>
                  {t('lotNumber')} {car.lotNumber} - {t('vin')} {car.vin}
                </p>
              </div>

              <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                <InfoCard
                  icon={<HandCoins className='h-4 w-4' />}
                  label={t('purchasePrice')}
                  value={money.format(car.purchasePrice)}
                />
                <InfoCard
                  icon={<ReceiptText className='h-4 w-4' />}
                  label={t('sellingPrice')}
                  value={money.format(car.sellingPrice)}
                />
                <InfoCard
                  icon={<Sparkles className='h-4 w-4' />}
                  label={t('totalCost')}
                  value={money.format(expenseSummary.totalCost)}
                />
                <InfoCard
                  icon={totalProfit >= 0 ? <TrendingUp className='h-4 w-4' /> : <TrendingDown className='h-4 w-4' />}
                  label={t('netProfit')}
                  value={
                    <span
                      className={cn(
                        'font-semibold',
                        totalProfit >= 0
                          ? 'text-emerald-600 dark:text-emerald-300'
                          : 'text-red-600 dark:text-red-300'
                      )}
                    >
                      {money.format(totalProfit)}
                    </span>
                  }
                />
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
            <TabsTrigger value='title'>{t('titleManagement')}</TabsTrigger>
            <TabsTrigger value='expenses'>{t('expenses')}</TabsTrigger>
            <TabsTrigger value='parts'>{t('parts')}</TabsTrigger>
            <TabsTrigger value='inspection'>{t('inspection')}</TabsTrigger>
            <TabsTrigger value='documents'>{t('documents')}</TabsTrigger>
            <TabsTrigger value='timeline'>{t('timeline')}</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='grid gap-4 xl:grid-cols-[1.1fr_0.9fr]'>
            <Card className='border-border/60'>
              <CardHeader>
                <CardTitle>{t('carInformation')}</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-3 text-sm'>
                <InfoRow label={t('brand')} value={car.brand} />
                <InfoRow label={t('model')} value={car.model} />
                <InfoRow label={t('year')} value={String(car.year)} />
                <InfoRow label={t('vin')} value={car.vin} />
                <InfoRow label={t('lotNumber')} value={car.lotNumber} />
                <InfoRow label={t('purchaseDate')} value={car.purchaseDate} />
                <InfoRow label={t('purchasePlace')} value={car.purchasePlace} />
                <InfoRow
                  label={t('carfax')}
                  value={
                    car.carfaxType === 'pdf'
                      ? car.carfaxPdfName || t('pdfUploaded')
                      : car.carfaxLink || t('link')
                  }
                />
                <InfoRow
                  label={t('status')}
                  value={<StatusBadge status={car.status} />}
                />
              </CardContent>
            </Card>

            <div className='space-y-4'>
              <CostSummaryCard
                breakdown={expenseSummary}
                purchasePrice={car.purchasePrice}
                sellingPrice={car.sellingPrice}
              />
              <Card className='border-border/60'>
              <CardHeader>
                <CardTitle>{t('quickMetrics')}</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-3 sm:grid-cols-2'>
                  <SummaryCard label={t('expenseCount')} value={String(expenses.length)} />
                  <SummaryCard label={t('partsCount')} value={String(parts.length)} />
                  <SummaryCard label={t('inspectionsCount')} value={String(inspections.length)} />
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
              canConvertToRebuilt={inspections.some((inspection) => inspection.status === 'Passed')}
            />
            <TitleHistoryTable history={titleHistory} />
          </TabsContent>

          <TabsContent value='expenses' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
              <SummaryCard title={t('totalExpenses')} value={money.format(expenseSummary.totalCost)} icon={<ReceiptText className='h-4 w-4' />} />
              <SummaryCard title={t('thisMonthExpenses')} value={money.format(thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0))} icon={<Sparkles className='h-4 w-4' />} />
              <SummaryCard title={t('highestExpenseType')} value={highestExpenseTypeLabel} icon={<AlertTriangle className='h-4 w-4' />} />
              <SummaryCard title={t('expensesCount')} value={String(expenses.length)} icon={<FileText className='h-4 w-4' />} />
            </div>
            <ExpenseTable expenses={expenses} />
            <CostSummaryCard
              breakdown={expenseSummary}
              purchasePrice={car.purchasePrice}
              sellingPrice={car.sellingPrice}
            />
          </TabsContent>

          <TabsContent value='parts' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
              <SummaryCard title={t('totalParts')} value={String(parts.length)} icon={<Package className='h-4 w-4' />} />
              <SummaryCard title={t('installed')} value={String(parts.filter((part) => part.installed).length)} icon={<ShieldCheck className='h-4 w-4' />} />
              <SummaryCard title={t('pending')} value={String(parts.filter((part) => !part.installed).length)} icon={<Wrench className='h-4 w-4' />} />
              <SummaryCard title={t('partsCost')} value={money.format(parts.reduce((sum, part) => sum + part.price, 0))} icon={<HandCoins className='h-4 w-4' />} />
            </div>
            <PartsTable parts={parts} />
          </TabsContent>

          <TabsContent value='inspection' className='space-y-4'>
            {salvageInspectionRequired ? (
              <>
                <Card className='border-amber-500/20 bg-amber-500/5'>
                  <CardContent className='space-y-4 p-4'>
                    <div className='space-y-1'>
                      <p className='font-medium'>{t('inspectionRequiredForSalvage')}</p>
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

          <TabsContent value='documents' className='space-y-4'>
            <DocumentsCard car={car} expenses={expenses} parts={parts} inspections={inspections} />
          </TabsContent>

          <TabsContent value='timeline' className='space-y-4'>
            <TitleHistoryTable history={titleHistory} />
            <Card className='border-border/60'>
              <CardHeader>
                <CardTitle>{t('recentOperationalActivity')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {[...expenses.slice(0, 2), ...parts.slice(0, 2), ...inspections.slice(0, 2)].map((item, index) => (
                  <div key={index} className='flex items-center justify-between rounded-lg border px-4 py-3'>
                    <div>
                      <p className='font-medium'>
                        {'expenseType' in item
                          ? `${item.expenseType} ${t('expense')}`
                          : 'installed' in item
                            ? `${t('part')}: ${item.partName}`
                            : `${t('inspectionItem')}: ${item.status}`}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {'date' in item ? item.date : ''}
                      </p>
                    </div>
                    <Badge variant='outline'>
                      {'amount' in item
                        ? money.format(item.amount)
                        : 'price' in item
                          ? money.format(item.price)
                          : item.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
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
          <div className='rounded-md bg-muted p-2 text-muted-foreground'>{icon}</div>
        ) : null}
        <div>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>
            {heading}
          </p>
          <p className='font-semibold'>{value}</p>
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
      <span className='max-w-[60%] text-right font-medium'>{value}</span>
    </div>
  )
}

function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  const { t } = useI18n()

  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle>{t('expenses')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('expenseType')}</TableHead>
                <TableHead>{t('amount')}</TableHead>
                <TableHead>{t('paidBy')}</TableHead>
                <TableHead>{t('paymentMethod')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('invoice')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell><ExpenseBadge expenseType={expense.expenseType} /></TableCell>
                  <TableCell>{money.format(expense.amount)}</TableCell>
                  <TableCell>{expense.paidBy}</TableCell>
                  <TableCell><PaymentBadge method={expense.paymentMethod} /></TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell className='text-muted-foreground'>{expense.invoiceName ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function PartsTable({ parts }: { parts: Part[] }) {
  const { t } = useI18n()

  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle>{t('parts')}</CardTitle>
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
              {parts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className='font-medium'>{part.partName}</TableCell>
                  <TableCell>{part.supplierName}</TableCell>
                  <TableCell>{money.format(part.price)}</TableCell>
                  <TableCell>{part.purchaseDate}</TableCell>
                  <TableCell>
                    <Badge variant='outline' className={part.installed ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'}>
                      {part.installed ? t('installed') : t('notInstalled')}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>{part.invoiceName ?? '-'}</TableCell>
                </TableRow>
              ))}
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
  inspections: ReturnType<typeof getInspectionsByCarId>
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
                <p className='font-medium'>{inspection.date} {t('at')} {inspection.time}</p>
                <p className='text-sm text-muted-foreground'>{inspection.place}</p>
              </div>
              <StatusBadge status={inspection.status} />
            </div>
            <p className='mt-3 text-sm text-muted-foreground'>{inspection.notes}</p>
            <div className='mt-3 flex flex-wrap gap-2'>
              {inspection.files.map((file) => <Badge key={file} variant='secondary'>{file}</Badge>)}
              {inspection.receipts.map((file) => <Badge key={file} variant='secondary'>{file}</Badge>)}
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
  expenses,
  parts,
  inspections,
}: {
  car: Car
  expenses: Expense[]
  parts: Part[]
  inspections: ReturnType<typeof getInspectionsByCarId>
}) {
  const { t } = useI18n()
  const documentNames = [
    ...car.documents.map((document) => document.name),
    ...expenses.map((expense) => expense.invoiceName).filter(Boolean) as string[],
    ...parts.map((part) => part.invoiceName).filter(Boolean) as string[],
    ...inspections.flatMap((inspection) => [...inspection.files, ...inspection.receipts, ...inspection.beforeImages, ...inspection.afterImages]),
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

function ExpenseBadge({ expenseType }: { expenseType: Expense['expenseType'] }) {
  const { locale } = useI18n()
  const className = {
    Purchase: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    Shipping: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    Repair: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    Parts: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    Labor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    Inspection: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300',
    Fees: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
    Other: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
  }[expenseType]

  return (
    <Badge variant='outline' className={className}>
      {getExpenseTypeLabel(expenseType, locale === 'ar' ? 'ar' : 'en')}
    </Badge>
  )
}

function PaymentBadge({ method }: { method: Expense['paymentMethod'] }) {
  const { locale } = useI18n()
  const className = {
    Zelle: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    Cash: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    Card: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  }[method]

  return (
    <Badge variant='outline' className={className}>
      {getPaymentMethodLabel(method, locale === 'ar' ? 'ar' : 'en')}
    </Badge>
  )
}
