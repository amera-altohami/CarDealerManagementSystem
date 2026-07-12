import { useMemo, useRef, useState, type TouchEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  carStatusOptions,
  formatCarName,
  type Car,
  type CarStatus,
} from '@/services/carsService'
import { getParts } from '@/services/partsService'
import type { Part } from '@/services/partsService'
import { EllipsisVertical, Pencil, Trash2, Eye } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { StatusBadge } from '@/components/status-badge'
import { useDeleteCarMutation } from '../hooks/use-cars'

type CarsTableProps = {
  data: Car[]
  error?: boolean
  isLoading?: boolean
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function CarsTable({
  data,
  error = false,
  isLoading = false,
}: CarsTableProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<CarStatus | 'all'>('all')
  const [carToDelete, setCarToDelete] = useState<Car | null>(null)
  const deleteCarMutation = useDeleteCarMutation()
  const partsQuery = useQuery({
    queryKey: ['cars-table', 'parts'] as const,
    queryFn: () => getParts(),
  })
  const lastTapRef = useRef<{ carId: string; time: number }>({
    carId: '',
    time: 0,
  })

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return data.filter((car) => {
      const matchesSearch =
        !query ||
        [car.brand, car.model, car.vin, car.mileage]
          .join(' ')
          .toLowerCase()
          .includes(query)
      const matchesStatus = status === 'all' || car.status === status

      return matchesSearch && matchesStatus
    })
  }, [data, search, status])

  const totalCostByCarId = useMemo(() => {
    return (partsQuery.data ?? []).reduce((map: Map<string, number>, part: Part) => {
      if (!part.relatedCarId) {
        return map
      }

      map.set(part.relatedCarId, (map.get(part.relatedCarId) ?? 0) + part.price)
      return map
    }, new Map<string, number>())
  }, [partsQuery.data])

  const openCarDetails = (carId: string) => {
    navigate({ to: '/cars/$carId', params: { carId } })
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
    carId: string
  ) => {
    if (isInteractiveElement(event.target)) {
      return
    }

    const now = event.timeStamp
    const isDoubleTap =
      lastTapRef.current.carId === carId && now - lastTapRef.current.time < 300

    lastTapRef.current = { carId, time: now }

    if (isDoubleTap) {
      openCarDetails(carId)
    }
  }

  return (
    <>
      <Card className='border-border/60'>
        <CardHeader className='space-y-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='grid flex-1 gap-2 sm:max-w-sm'>
              <CardTitle className='text-base'>{t('carsManagement')}</CardTitle>
              <p className='text-sm text-muted-foreground'>{t('searchCars')}</p>
            </div>
          </div>
          <div className='grid gap-3 md:grid-cols-[1fr_220px]'>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('searchCars')}
            />
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as CarStatus | 'all')}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{t('allStatuses')}</SelectItem>
                {carStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.value === 'purchased'
                      ? t('purchasedStatus')
                      : option.value === 'shipping'
                        ? t('shippingStatus')
                        : option.value === 'repairing'
                          ? t('repairingStatus')
                          : option.value === 'ready-for-sale'
                            ? t('readyForSaleStatus')
                            : t('soldStatus')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className='overflow-hidden rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('carImage')}</TableHead>
                  <TableHead>{t('brand')}</TableHead>
                  <TableHead>{t('model')}</TableHead>
                  <TableHead>{t('year')}</TableHead>
                  <TableHead>{t('vin')}</TableHead>
                  <TableHead>{t('mileage')}</TableHead>
                  <TableHead>{t('purchasePrice')}</TableHead>
                  <TableHead>{t('totalCost')}</TableHead>
                  <TableHead>{t('sellingPrice')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className='text-end'>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className='h-24 text-center'>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={11} className='h-24 text-center'>
                      Failed to load cars.
                    </TableCell>
                  </TableRow>
                ) : filteredRows.length ? (
                  filteredRows.map((car) => (
                    <TableRow
                      key={car.id}
                      className='cursor-pointer'
                      onDoubleClick={() => openCarDetails(car.id)}
                      onTouchEnd={(event) => handleTouchEnd(event, car.id)}
                    >
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <img
                            src={car.photo}
                            alt={`${car.brand} ${car.model}`}
                            className='h-14 w-20 rounded-md object-cover ring-1 ring-border'
                          />
                        </div>
                      </TableCell>
                      <TableCell className='font-medium'>{car.brand}</TableCell>
                      <TableCell>{car.model}</TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell className='font-mono text-xs'>
                        {car.vin}
                      </TableCell>
                      <TableCell>{car.mileage}</TableCell>
                      <TableCell>{money.format(car.purchasePrice)}</TableCell>
                      <TableCell>
                        {money.format(
                          car.purchasePrice +
                            (totalCostByCarId.get(car.id) ?? 0)
                        )}
                      </TableCell>
                      <TableCell>{money.format(car.sellingPrice)}</TableCell>
                      <TableCell>
                        <StatusBadge status={car.status} />
                      </TableCell>
                      <TableCell className='text-end'>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              className='h-8 w-8 p-0 data-[state=open]:bg-muted'
                            >
                              <EllipsisVertical className='h-4 w-4' />
                              <span className='sr-only'>{t('openMenu')}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-40'>
                            <DropdownMenuItem asChild>
                              <Link
                                to='/cars/$carId'
                                params={{ carId: car.id }}
                              >
                                {t('view')}
                                <Eye className='ms-auto h-4 w-4' />
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                to='/cars/$carId/edit'
                                params={{ carId: car.id }}
                              >
                                {t('edit')}
                                <Pencil className='ms-auto h-4 w-4' />
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className='text-red-500!'
                              onClick={() => setCarToDelete(car)}
                            >
                              {t('delete')}
                              <Trash2 className='ms-auto h-4 w-4' />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className='h-24 text-center'>
                      {t('noCarsFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!carToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setCarToDelete(null)
          }
        }}
        title={t('deleteCar')}
        desc={
          <span>
            {t('deleteCarConfirmPrefix')}{' '}
            <strong>{carToDelete ? formatCarName(carToDelete) : ''}</strong>?
          </span>
        }
        destructive
        confirmText={t('delete')}
        isLoading={deleteCarMutation.isPending}
        handleConfirm={async () => {
          if (!carToDelete) {
            return
          }

          try {
            await deleteCarMutation.mutateAsync(carToDelete.id)
            setCarToDelete(null)
          } catch {
            // The mutation already shows the matching toast.
          }
        }}
      />
    </>
  )
}
