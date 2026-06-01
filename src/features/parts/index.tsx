import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { carsMockData } from '@/data/carsMockData'
import { companiesMockData, partsMockData } from '@/data/dealerOperationsMockData'
import { useI18n } from '@/lib/i18n'

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function PartsManagement() {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [carId, setCarId] = useState('all')
  const [supplierId, setSupplierId] = useState('all')
  const [status, setStatus] = useState<'all' | 'installed' | 'pending'>('all')

  const filteredParts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return partsMockData.filter((part) => {
      const matchesSearch = !query || [part.partName, part.supplierName, part.relatedCarName ?? '', part.invoiceName ?? ''].join(' ').toLowerCase().includes(query)
      const matchesCar = carId === 'all' || part.relatedCarId === carId
      const matchesSupplier = supplierId === 'all' || part.supplierId === supplierId
      const matchesStatus = status === 'all' || (status === 'installed' ? part.installed : !part.installed)
      return matchesSearch && matchesCar && matchesSupplier && matchesStatus
    })
  }, [carId, search, status, supplierId])

  const totalCost = partsMockData.reduce((sum, part) => sum + part.price, 0)
  const installedParts = partsMockData.filter((part) => part.installed).length
  const notInstalledParts = partsMockData.length - installedParts

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
          <SummaryCard label={t('totalParts')} value={String(partsMockData.length)} />
          <SummaryCard label={t('installedParts')} value={String(installedParts)} />
          <SummaryCard label={t('notInstalledParts')} value={String(notInstalledParts)} />
          <SummaryCard label={t('totalPartsCost')} value={money.format(totalCost)} />
        </div>

        <Card className='border-border/60'>
          <CardHeader className='space-y-4'>
            <CardTitle>{t('partsList')}</CardTitle>
            <div className='grid gap-3 md:grid-cols-[1fr_220px_220px_220px]'>
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchParts')} />
              <Select value={carId} onValueChange={setCarId}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder={t('filterByCar')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('allCars')}</SelectItem>
                  {carsMockData.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.brand} {car.model} {car.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder={t('filterBySupplier')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('allSuppliers')}</SelectItem>
                  {companiesMockData.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={(value) => setStatus(value as 'all' | 'installed' | 'pending')}>
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
            <div className='overflow-hidden rounded-md border'>
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
                  {filteredParts.length ? (
                    filteredParts.map((part) => (
                      <TableRow key={part.id}>
                        <TableCell className='font-medium'>{part.partName}</TableCell>
                        <TableCell>{part.relatedCarName ?? t('standaloneInventory')}</TableCell>
                        <TableCell>{money.format(part.price)}</TableCell>
                        <TableCell>{part.supplierName}</TableCell>
                        <TableCell>{part.purchaseDate}</TableCell>
                        <TableCell>
                          <Badge variant='outline' className={part.installed ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'}>
                            {part.installed ? t('installed') : t('notInstalled')}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-muted-foreground'>{part.invoiceName ?? t('uploadInvoice')}</TableCell>
                        <TableCell className='text-end'>
                          <Button asChild variant='ghost' size='sm'>
                            <Link to='/parts/$partId' params={{ partId: part.id }}>{t('details')}</Link>
                          </Button>
                          <Button asChild variant='ghost' size='sm'>
                            <Link to='/parts/$partId/edit' params={{ partId: part.id }}>{t('edit')}</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className='h-24 text-center'>{t('noPartsFound')}</TableCell>
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
