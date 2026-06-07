import { useState } from 'react'
import { Eye } from 'lucide-react'
import { useI18n, type MessageKey } from '@/lib/i18n'
import { getDisplayNameInitials, cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatActivityLogDate } from '../data/logsMockData'
import {
  type ActivityLog,
  type ActivityLogAction,
  type ActivityLogModule,
} from '../data/schema'

type LogsTableProps = {
  logs: ActivityLog[]
}

const actionStyles: Record<ActivityLogAction, string> = {
  Create:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Update: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  Delete: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  Login:
    'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
}

const actionLabelKeys: Record<ActivityLogAction, MessageKey> = {
  Create: 'logActionCreate',
  Update: 'logActionUpdate',
  Delete: 'logActionDelete',
  Login: 'logActionLogin',
}

const moduleLabelKeys: Record<ActivityLogModule, MessageKey> = {
  Cars: 'logModuleCars',
  Expenses: 'logModuleExpenses',
  Partners: 'logModulePartners',
  Users: 'logModuleUsers',
  Reports: 'logModuleReports',
  Notifications: 'logModuleNotifications',
  Companies: 'logModuleCompanies',
  Inspections: 'logModuleInspections',
  Parts: 'logModuleParts',
  Titles: 'logModuleTitles',
}

const roleLabelKeys: Record<ActivityLog['userRole'], MessageKey> = {
  Admin: 'roleAdmin',
  Manager: 'roleManager',
  Accountant: 'roleAccountant',
  Sales: 'roleSales',
  Viewer: 'roleViewer',
}

function ActionBadge({ action }: { action: ActivityLogAction }) {
  const { t } = useI18n()

  return (
    <Badge variant='outline' className={cn(actionStyles[action])}>
      {t(actionLabelKeys[action])}
    </Badge>
  )
}

function LogDetailsDialog({
  log,
  onOpenChange,
}: {
  log: ActivityLog | null
  onOpenChange: (open: boolean) => void
}) {
  const { t, locale } = useI18n()

  return (
    <Dialog open={!!log} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{t('activityLogDetails')}</DialogTitle>
          <DialogDescription>{t('activityLogDetailsDesc')}</DialogDescription>
        </DialogHeader>

        {log ? (
          <div className='space-y-5'>
            <div className='grid gap-3 rounded-md border p-4 sm:grid-cols-2'>
              <div>
                <p className='text-xs text-muted-foreground'>{t('user')}</p>
                <p className='font-medium'>{log.userName}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>{t('role')}</p>
                <p className='font-medium'>{t(roleLabelKeys[log.userRole])}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>{t('action')}</p>
                <div className='mt-1'>
                  <ActionBadge action={log.action} />
                </div>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>{t('module')}</p>
                <p className='font-medium'>{t(moduleLabelKeys[log.module])}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>
                  {t('entityType')}
                </p>
                <p className='font-medium'>{log.entityType}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>
                  {t('entityName')}
                </p>
                <p className='font-medium'>{log.entityName}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>{t('date')}</p>
                <p className='font-medium'>
                  {formatActivityLogDate(log.date, locale)}
                </p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>{t('time')}</p>
                <p className='font-medium'>{log.time}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>
                  {t('ipAddress')}
                </p>
                <p className='font-medium'>{log.ipAddress}</p>
              </div>
            </div>

            <div className='space-y-2'>
              <p className='text-sm font-medium'>{t('description')}</p>
              <p className='rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground'>
                {log.description}
              </p>
            </div>

            <div className='space-y-2'>
              <p className='text-sm font-medium'>{t('changedFields')}</p>
              {log.changedFields?.length ? (
                <div className='overflow-hidden rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('field')}</TableHead>
                        <TableHead>{t('oldValue')}</TableHead>
                        <TableHead>{t('newValue')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {log.changedFields.map((field) => (
                        <TableRow key={`${field.field}-${field.oldValue}`}>
                          <TableCell className='font-medium'>
                            {field.field}
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {field.oldValue}
                          </TableCell>
                          <TableCell>{field.newValue}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className='rounded-md border p-3 text-sm text-muted-foreground'>
                  {t('noChangedFields')}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export function LogsTable({ logs }: LogsTableProps) {
  const { t, locale } = useI18n()
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)

  return (
    <>
      <Card className='border-border/60'>
        <CardHeader>
          <CardTitle className='text-base'>{t('activityLogs')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-hidden rounded-md border'>
            <div className='overflow-x-auto'>
              <Table className='min-w-[1100px]'>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('user')}</TableHead>
                    <TableHead>{t('role')}</TableHead>
                    <TableHead>{t('action')}</TableHead>
                    <TableHead>{t('module')}</TableHead>
                    <TableHead>{t('entity')}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('time')}</TableHead>
                    <TableHead>{t('ipAddress')}</TableHead>
                    <TableHead className='text-end'>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length ? (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-9 w-9 rounded-md'>
                              <AvatarFallback className='rounded-md bg-muted text-xs font-semibold'>
                                {getDisplayNameInitials(log.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className='min-w-0'>
                              <p className='truncate font-medium'>
                                {log.userName}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {log.userId}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{t(roleLabelKeys[log.userRole])}</TableCell>
                        <TableCell>
                          <ActionBadge action={log.action} />
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>
                            {t(moduleLabelKeys[log.module])}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <p className='font-medium'>{log.entityType}</p>
                            <p className='text-xs text-muted-foreground'>
                              {log.entityName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className='max-w-[260px]'>
                          <p className='line-clamp-2 text-sm text-muted-foreground'>
                            {log.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          {formatActivityLogDate(log.date, locale)}
                        </TableCell>
                        <TableCell>{log.time}</TableCell>
                        <TableCell>{log.ipAddress}</TableCell>
                        <TableCell className='text-end'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className='h-4 w-4' />
                            {t('viewDetails')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className='h-24 text-center'>
                        {t('noActivityLogsFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <LogDetailsDialog
        log={selectedLog}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLog(null)
          }
        }}
      />
    </>
  )
}
