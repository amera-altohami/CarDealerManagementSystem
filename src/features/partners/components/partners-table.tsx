import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useI18n, type MessageKey } from '@/lib/i18n'
import { getDisplayNameInitials, cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import { partnerStatusOptions, type Partner } from '../data/schema'

type PartnersTableProps = {
  data: Partner[]
  isLoading?: boolean
  onEdit: (partner: Partner) => void
  onDelete: (partner: Partner) => void
  onToggleStatus: (partner: Partner) => void
}

type StatusFilter = Partner['status'] | 'all'
type PercentageFilter = 'all' | '0-25' | '25-50' | '50-75' | '75-100'

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const statusStyles: Record<Partner['status'], string> = {
  Active:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Inactive:
    'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
}

const statusLabelKeys: Record<Partner['status'], MessageKey> = {
  Active: 'activeStatus',
  Inactive: 'inactiveStatus',
}

function matchesPercentageRange(percentage: number, filter: PercentageFilter) {
  if (filter === 'all') return true
  const [min, max] = filter.split('-').map(Number)
  return percentage >= min && percentage <= max
}

export function PartnersTable({
  data,
  isLoading = false,
  onEdit,
  onDelete,
  onToggleStatus,
}: PartnersTableProps) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [percentage, setPercentage] = useState<PercentageFilter>('all')

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return data.filter((partner) => {
      const matchesSearch =
        !query ||
        [partner.name, partner.email, partner.phone]
          .join(' ')
          .toLowerCase()
          .includes(query)
      const matchesStatus = status === 'all' || partner.status === status
      const matchesPercentage = matchesPercentageRange(
        partner.investmentPercentage,
        percentage
      )

      return matchesSearch && matchesStatus && matchesPercentage
    })
  }, [data, percentage, search, status])

  return (
    <Card className='border-border/60'>
      <CardHeader className='space-y-4'>
        <div className='flex flex-wrap items-center gap-3'>
          <div className='grid flex-1 gap-2 sm:max-w-sm'>
            <CardTitle className='text-base'>
              {t('partnersInvestments')}
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              {t('partnersTableDesc')}
            </p>
          </div>
        </div>
        <div className='grid gap-3 xl:grid-cols-[1fr_220px_220px]'>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('searchPartners')}
          />
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as StatusFilter)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('allStatuses')}</SelectItem>
              {partnerStatusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(statusLabelKeys[option])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={percentage}
            onValueChange={(value) => setPercentage(value as PercentageFilter)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={t('percentageFilter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('allPercentages')}</SelectItem>
              <SelectItem value='0-25'>0% - 25%</SelectItem>
              <SelectItem value='25-50'>25% - 50%</SelectItem>
              <SelectItem value='50-75'>50% - 75%</SelectItem>
              <SelectItem value='75-100'>75% - 100%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('partner')}</TableHead>
                <TableHead>{t('contact')}</TableHead>
                <TableHead>{t('investmentPercentage')}</TableHead>
                <TableHead>{t('totalContribution')}</TableHead>
                <TableHead>{t('profit')}</TableHead>
                <TableHead>{t('loss')}</TableHead>
                <TableHead>{t('finalBalance')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className='text-end'>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className='h-24 text-center'>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRows.length ? (
                filteredRows.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-9 w-9 rounded-md'>
                          <AvatarFallback className='rounded-md bg-muted text-xs font-semibold'>
                            {getDisplayNameInitials(partner.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0'>
                          <p className='truncate font-medium'>{partner.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='space-y-1'>
                        <p>{partner.email || '-'}</p>
                        <p className='text-xs text-muted-foreground'>
                          {partner.phone || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{partner.investmentPercentage}%</TableCell>
                    <TableCell>
                      {money.format(partner.totalContribution)}
                    </TableCell>
                    <TableCell className='font-medium text-emerald-600 dark:text-emerald-400'>
                      {money.format(partner.totalProfit)}
                    </TableCell>
                    <TableCell className='font-medium text-red-600 dark:text-red-400'>
                      {partner.totalLoss > 0
                        ? `-${money.format(partner.totalLoss)}`
                        : money.format(0)}
                    </TableCell>
                    <TableCell className='font-medium'>
                      {money.format(partner.finalBalance)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={cn(statusStyles[partner.status])}
                      >
                        {t(statusLabelKeys[partner.status])}
                      </Badge>
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
                        <DropdownMenuContent align='end' className='w-48'>
                          <DropdownMenuItem asChild>
                            <Link
                              to='/partners/$partnerId'
                              params={{ partnerId: partner.id }}
                            >
                              {t('viewDetails')}
                              <Eye className='ms-auto h-4 w-4' />
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(partner)}>
                            {t('edit')}
                            <Pencil className='ms-auto h-4 w-4' />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(partner)}
                          >
                            {partner.status === 'Active'
                              ? t('deactivate')
                              : t('activate')}
                            {partner.status === 'Active' ? (
                              <UserX className='ms-auto h-4 w-4' />
                            ) : (
                              <UserCheck className='ms-auto h-4 w-4' />
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-red-500!'
                            onClick={() => onDelete(partner)}
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
                  <TableCell colSpan={9} className='h-24 text-center'>
                    {t('noPartnersFound')}
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
