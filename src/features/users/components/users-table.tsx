import { useMemo, useState } from 'react'
import {
  EllipsisVertical,
  Pencil,
  ShieldCheck,
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
import { userManagementStatusOptions, type ManagedUser } from '../data/schema'

type UsersTableProps = {
  data: ManagedUser[]
  onEdit: (user: ManagedUser) => void
  onDelete: (user: ManagedUser) => void
  onToggleStatus: (user: ManagedUser) => void
  currentUserRole?: ManagedUser['role'] | null
  isError?: boolean
  isLoading?: boolean
}

type StatusFilter = ManagedUser['status'] | 'all'

const statusStyles: Record<ManagedUser['status'], string> = {
  Active:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Disabled: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
}

const statusLabelKeys: Record<ManagedUser['status'], MessageKey> = {
  Active: 'activeStatus',
  Disabled: 'disabledStatus',
}

export function UsersTable({
  data,
  onEdit,
  onDelete,
  onToggleStatus,
  currentUserRole,
  isError = false,
  isLoading = false,
}: UsersTableProps) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return data.filter((user) => {
      const matchesSearch =
        !query ||
        [user.fullName, user.email, user.phone]
          .join(' ')
          .toLowerCase()
          .includes(query)
      const matchesStatus = status === 'all' || user.status === status

      return matchesSearch && matchesStatus
    })
  }, [data, search, status])

  return (
    <Card className='border-border/60'>
      <CardHeader className='space-y-4'>
        <div className='flex flex-wrap items-center gap-3'>
          <div className='grid flex-1 gap-2 sm:max-w-sm'>
            <CardTitle className='text-base'>{t('usersManagement')}</CardTitle>
            <p className='text-sm text-muted-foreground'>
              {t('usersTableDesc')}
            </p>
          </div>
        </div>
        <div className='grid gap-3 lg:grid-cols-[1fr_220px]'>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('searchUsers')}
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
              {userManagementStatusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(statusLabelKeys[option])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-3 md:hidden'>
          {isLoading || isError ? (
            <div className='rounded-md border p-4 text-center text-sm'>
              {isLoading ? 'Loading...' : 'Failed to load users.'}
            </div>
          ) : filteredRows.length ? (
            filteredRows.map((user) => (
              <Card key={user.id} className='border-border/60'>
                <CardContent className='space-y-3 p-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='truncate font-medium'>{user.fullName}</p>
                        {user.isProtected ? (
                          <Badge variant='secondary' className='gap-1'>
                            <ShieldCheck className='h-3 w-3' />
                            {t('protectedUser')}
                          </Badge>
                        ) : null}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {user.email}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {user.phone || '-'}
                      </p>
                    </div>
                    <Badge
                      variant='outline'
                      className={cn('capitalize', statusStyles[user.status])}
                    >
                      {t(statusLabelKeys[user.status])}
                    </Badge>
                  </div>
                  <div className='grid gap-1 text-sm text-muted-foreground'>
                    <p>
                      <span className='font-medium text-foreground'>
                        {t('createdAt')}:
                      </span>{' '}
                      {user.createdAt}
                    </p>
                    <p>
                      <span className='font-medium text-foreground'>
                        {t('lastLogin')}:
                      </span>{' '}
                      {user.lastLogin === 'Never' ? t('never') : user.lastLogin}
                    </p>
                  </div>
                  <div className='flex justify-end'>
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
                      <DropdownMenuContent align='end' className='w-44'>
                        <DropdownMenuItem
                          disabled={
                            user.isProtected ||
                            !currentUserRole ||
                            (currentUserRole === 'ADMIN' &&
                              user.role !== 'USER')
                          }
                          onClick={() => onEdit(user)}
                        >
                          {t('edit')}
                          <Pencil className='ms-auto h-4 w-4' />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={
                            user.isProtected ||
                            !currentUserRole ||
                            (currentUserRole === 'ADMIN' &&
                              user.role !== 'USER')
                          }
                          onClick={() => onToggleStatus(user)}
                        >
                          {user.status === 'Active' ? t('disable') : t('enable')}
                          {user.status === 'Active' ? (
                            <UserX className='ms-auto h-4 w-4' />
                          ) : (
                            <UserCheck className='ms-auto h-4 w-4' />
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className='text-red-500!'
                          disabled={
                            user.isProtected || currentUserRole !== 'SUPER_ADMIN'
                          }
                          onClick={() => onDelete(user)}
                        >
                          {t('delete')}
                          <Trash2 className='ms-auto h-4 w-4' />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className='rounded-md border p-4 text-center text-sm'>
              {t('noUsersFound')}
            </div>
          )}
        </div>

        <div className='hidden overflow-hidden rounded-md border md:block'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('user')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('phone')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('createdAt')}</TableHead>
                <TableHead>{t('lastLogin')}</TableHead>
                <TableHead className='text-end'>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || isError ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    {isLoading ? 'Loading...' : 'Failed to load users.'}
                  </TableCell>
                </TableRow>
              ) : filteredRows.length ? (
                filteredRows.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-9 w-9 rounded-md'>
                          <AvatarFallback className='rounded-md bg-muted text-xs font-semibold'>
                            {getDisplayNameInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <p className='truncate font-medium'>
                              {user.fullName}
                            </p>
                            {user.isProtected ? (
                              <Badge variant='secondary' className='gap-1'>
                                <ShieldCheck className='h-3 w-3' />
                                {t('protectedUser')}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={cn('capitalize', statusStyles[user.status])}
                      >
                        {t(statusLabelKeys[user.status])}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>
                      {user.lastLogin === 'Never' ? t('never') : user.lastLogin}
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
                      <DropdownMenuContent align='end' className='w-44'>
                          <DropdownMenuItem
                            disabled={
                              user.isProtected ||
                              !currentUserRole ||
                              (currentUserRole === 'ADMIN' &&
                                user.role !== 'USER')
                            }
                            onClick={() => onEdit(user)}
                          >
                            {t('edit')}
                            <Pencil className='ms-auto h-4 w-4' />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={
                              user.isProtected ||
                              !currentUserRole ||
                              (currentUserRole === 'ADMIN' &&
                                user.role !== 'USER')
                            }
                            onClick={() => onToggleStatus(user)}
                          >
                            {user.status === 'Active'
                              ? t('disable')
                              : t('enable')}
                            {user.status === 'Active' ? (
                              <UserX className='ms-auto h-4 w-4' />
                            ) : (
                              <UserCheck className='ms-auto h-4 w-4' />
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-red-500!'
                            disabled={
                              user.isProtected ||
                              currentUserRole !== 'SUPER_ADMIN'
                            }
                            onClick={() => onDelete(user)}
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
                  <TableCell colSpan={7} className='h-24 text-center'>
                    {t('noUsersFound')}
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
