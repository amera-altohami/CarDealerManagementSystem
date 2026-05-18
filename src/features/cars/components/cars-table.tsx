import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { EllipsisVertical, Pencil, Trash2, Eye } from 'lucide-react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { carStatusOptions, formatCarName, type Car, type CarStatus } from '@/data/carsMockData'
import { useI18n } from '@/lib/i18n'

type CarsTableProps = {
  data: Car[]
}

export function CarsTable({ data }: CarsTableProps) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<CarStatus | 'all'>('all')
  const [rows, setRows] = useState(data)
  const [carToDelete, setCarToDelete] = useState<Car | null>(null)

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return rows.filter((car) => {
      const matchesSearch =
        !query ||
        [car.brand, car.model, car.vin, car.lotNumber]
          .join(' ')
          .toLowerCase()
          .includes(query)
      const matchesStatus = status === 'all' || car.status === status

      return matchesSearch && matchesStatus
    })
  }, [rows, search, status])

  return (
    <>
      <Card className='border-border/60'>
        <CardHeader className='space-y-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='grid flex-1 gap-2 sm:max-w-sm'>
              <CardTitle className='text-base'>{t('carsManagement')}</CardTitle>
              <p className='text-sm text-muted-foreground'>
                {t('searchCars')}
              </p>
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
                    {option.label}
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
                  <TableHead>VIN</TableHead>
                  <TableHead>{t('lotNumber')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className='text-end'>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length ? (
                  filteredRows.map((car) => (
                    <TableRow key={car.id}>
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
                      <TableCell className='font-mono text-xs'>{car.vin}</TableCell>
                      <TableCell>{car.lotNumber}</TableCell>
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
                              <span className='sr-only'>Open menu</span>
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
                    <TableCell colSpan={8} className='h-24 text-center'>
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
        title='Delete car'
        desc={
          <span>
            Are you sure you want to delete{' '}
            <strong>{carToDelete ? formatCarName(carToDelete) : ''}</strong>?
          </span>
        }
        destructive
        confirmText='Delete'
        handleConfirm={() => {
          if (!carToDelete) {
            return
          }

          setRows((currentRows) =>
            currentRows.filter((car) => car.id !== carToDelete.id)
          )
          setCarToDelete(null)
        }}
      />
    </>
  )
}
