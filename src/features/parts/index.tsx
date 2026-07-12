import { useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SearchableCombobox } from '@/components/searchable-combobox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCarsQuery } from '@/features/cars/hooks/use-cars'
import { useCompaniesQuery } from '@/features/companies/hooks/use-companies'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import {
  usePartsQuery,
  usePartsSummaryQuery,
} from './hooks/use-parts'

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function PartsManagement() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [carId, setCarId] = useState('all')
  const [supplierId, setSupplierId] = useState('all')
  const [status, setStatus] = useState<'all' | 'installed' | 'pending'>('all')
  const [invoiceFilter, setInvoiceFilter] = useState('')
  const lastTapRef = useRef<{ partId: string; time: number }>({
    partId: '',
    time: 0,
  })

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      carId: carId === 'all' ? undefined : carId,
      supplierId: supplierId === 'all' ? undefined : supplierId,
      installed:
        status === 'all' ? undefined : status === 'installed' ? true : false,
    }),
    [carId, search, status, supplierId]
  )

  const partsQuery = usePartsQuery(filters)
  const summaryQuery = usePartsSummaryQuery()
  const carsQuery = useCarsQuery()
  const companiesQuery = useCompaniesQuery()

  useEffect(() => {
    if (partsQuery.isError) {
      toast.error(getFirestoreErrorMessage(partsQuery.error))
    }
  }, [partsQuery.error, partsQuery.isError])

  const parts = partsQuery.data ?? []
  const summary = summaryQuery.data
  const cars = carsQuery.data ?? []
  const companies = companiesQuery.data ?? []
  const visibleParts = useMemo(() => {
    const normalizedInvoiceFilter = invoiceFilter.trim().toLowerCase()

    if (!normalizedInvoiceFilter) {
      return parts
    }

    return parts.filter((part) =>
      (part.invoiceName ?? '')
        .toLowerCase()
        .includes(normalizedInvoiceFilter)
    )
  }, [invoiceFilter, parts])

  const carOptions = useMemo(() => {
    return [
      { value: 'all', label: t('allCars') },
      ...cars.map((car) => ({
        value: car.id,
        label: `${car.brand} ${car.model} ${car.year}`,
        description: car.vin,
      })),
    ]
  }, [cars, t])

  const supplierOptions = useMemo(() => {
    return companies.map((company) => ({
      id: company.id,
      label: company.name,
    }))
  }, [companies])

  const openPartDetails = (partId: string) => {
    navigate({ to: '/parts/$partId', params: { partId } })
  }

  const isInteractiveElement = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) {
      return false
    }

    return Boolean(
      target.closest('button, a, input, select, textarea, [role="button"]')
    )
  }

  const handleTouchEnd = (
    event: TouchEvent<HTMLTableRowElement>,
    partId: string
  ) => {
    if (isInteractiveElement(event.target)) {
      return
    }

    const now = event.timeStamp
    const isDoubleTap =
      lastTapRef.current.partId === partId && now - lastTapRef.current.time < 300

    lastTapRef.current = { partId, time: now }

    if (isDoubleTap) {
      openPartDetails(partId)
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
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>{t('partsManagement')}</h1>
            <p className='text-muted-foreground'>{t('partsManagementDesc')}</p>
          </div>
          <Button asChild>
            <Link to='/parts/new'>
              <Plus className='me-2 h-4 w-4' />
              {t('addPart')}
            </Link>
          </Button>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <SummaryCard
            label={t('totalParts')}
            value={String(summary?.totalParts ?? 0)}
          />
          <SummaryCard
            label={t('installedParts')}
            value={String(summary?.installedParts ?? 0)}
          />
          <SummaryCard
            label={t('notInstalledParts')}
            value={String(summary?.pendingParts ?? 0)}
          />
          <SummaryCard
            label={t('totalPartsCost')}
            value={money.format(summary?.totalCost ?? 0)}
          />
        </div>

        <Card className='border-border/60'>
          <CardHeader className='space-y-4'>
            <CardTitle>{t('partsList')}</CardTitle>
            <div className='grid gap-3 md:grid-cols-[1fr_220px_220px_220px_220px]'>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('searchParts')}
              />
              <Input
                value={invoiceFilter}
                onChange={(event) => setInvoiceFilter(event.target.value)}
                placeholder={locale === 'ar' ? 'فلتر الفاتورة' : 'Filter by invoice'}
              />
              <SearchableCombobox
                value={carId}
                onValueChange={setCarId}
                options={carOptions}
                placeholder={t('filterByCar')}
                searchPlaceholder={t('searchCars')}
                emptyText={t('noCarsFound')}
                className='w-full'
              />
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder={t('filterBySupplier')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('allSuppliers')}</SelectItem>
                  {supplierOptions.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as 'all' | 'installed' | 'pending')
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder={t('installationStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('allStatuses')}</SelectItem>
                  <SelectItem value='installed'>{t('installed')}</SelectItem>
                  <SelectItem value='pending'>{t('notInstalled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3 md:hidden'>
              {visibleParts.length ? (
                visibleParts.map((part) => (
                  <Card key={part.id} className='border-border/60'>
                    <CardContent className='space-y-3 p-4'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <p className='truncate font-medium'>{part.partName}</p>
                          <p className='text-sm text-muted-foreground'>
                            {part.relatedCarName ?? t('standaloneInventory')}
                          </p>
                        </div>
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
                      </div>
                      <div className='flex flex-wrap gap-2 text-sm'>
                        <span className='font-semibold'>
                          {money.format(part.price)}
                        </span>
                        <span className='text-muted-foreground'>
                          {part.supplierName}
                        </span>
                      </div>
                      <Badge variant='secondary' className='w-fit'>
                        {part.invoiceName ?? (locale === 'ar' ? 'بدون فاتورة' : 'No invoice')}
                      </Badge>
                      <p className='text-sm text-muted-foreground'>
                        {part.purchaseDate} - {part.invoiceName ?? t('uploadInvoice')}
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        <Button asChild variant='outline' size='sm'>
                          <Link to='/parts/$partId' params={{ partId: part.id }}>
                            {t('details')}
                          </Link>
                        </Button>
                        <Button asChild variant='ghost' size='sm'>
                          <Link
                            to='/parts/$partId/edit'
                            params={{ partId: part.id }}
                          >
                            {t('edit')}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className='rounded-md border p-4 text-center text-sm'>
                  {t('noPartsFound')}
                </div>
              )}
            </div>

            <div className='hidden overflow-hidden rounded-md border md:block'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('partName')}</TableHead>
                    <TableHead>{t('relatedCar')}</TableHead>
                    <TableHead>{t('price')}</TableHead>
                    <TableHead>{t('supplier')}</TableHead>
                    <TableHead>{t('purchaseDate')}</TableHead>
                    <TableHead>{t('installationStatus')}</TableHead>
                    <TableHead>{t('invoice')}</TableHead>
                    <TableHead className='text-end'>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className='h-24 text-center'>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : visibleParts.length ? (
                    visibleParts.map((part) => (
                      <TableRow
                        key={part.id}
                        className='cursor-pointer'
                        onDoubleClick={() => openPartDetails(part.id)}
                        onTouchEnd={(event) => handleTouchEnd(event, part.id)}
                      >
                        <TableCell className='font-medium'>
                          {part.partName}
                        </TableCell>
                        <TableCell>
                          {part.relatedCarName ?? t('standaloneInventory')}
                        </TableCell>
                        <TableCell>{money.format(part.price)}</TableCell>
                        <TableCell>{part.supplierName}</TableCell>
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
                          <Badge variant='secondary'>
                            {part.invoiceName ?? (locale === 'ar' ? 'بدون فاتورة' : 'No invoice')}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-end'>
                          <Button asChild variant='ghost' size='sm'>
                            <Link to='/parts/$partId' params={{ partId: part.id }}>
                              {t('details')}
                            </Link>
                          </Button>
                          <Button asChild variant='ghost' size='sm'>
                            <Link
                              to='/parts/$partId/edit'
                              params={{ partId: part.id }}
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
                        {t('noPartsFound')}
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
