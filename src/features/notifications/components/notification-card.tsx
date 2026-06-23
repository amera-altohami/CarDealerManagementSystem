import {
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileWarning,
  Mail,
  MailOpen,
  PackageSearch,
  Timer,
  Trash2,
} from 'lucide-react'
import { useI18n, type MessageKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatNotificationDate } from '../data/formatters'
import {
  type AppNotification,
  type NotificationReadStatus,
  type NotificationSeverity,
  type NotificationType,
} from '../data/schema'

type NotificationCardProps = {
  notification: AppNotification
  onToggleRead: (notification: AppNotification) => void
  onDelete: (notification: AppNotification) => void
}

const typeIcons = {
  Inspection: ClipboardCheck,
  'Car Delay': Timer,
  'Low Parts': PackageSearch,
  'Missing Documents': FileWarning,
} satisfies Record<NotificationType, typeof ClipboardCheck>

const typeLabelKeys: Record<NotificationType, MessageKey> = {
  Inspection: 'notificationTypeInspection',
  'Car Delay': 'notificationTypeCarDelay',
  'Low Parts': 'notificationTypeLowParts',
  'Missing Documents': 'notificationTypeMissingDocuments',
}

const severityLabelKeys: Record<NotificationSeverity, MessageKey> = {
  Low: 'severityLow',
  Medium: 'severityMedium',
  High: 'severityHigh',
  Critical: 'severityCritical',
}

const statusLabelKeys: Record<NotificationReadStatus, MessageKey> = {
  Read: 'notificationRead',
  Unread: 'notificationUnread',
}

const severityStyles: Record<NotificationSeverity, string> = {
  Low: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  Medium:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  High: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300',
  Critical: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
}

const statusStyles: Record<NotificationReadStatus, string> = {
  Read: 'border-border bg-muted text-muted-foreground',
  Unread: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
}

const typeStyles: Record<NotificationType, string> = {
  Inspection:
    'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  'Car Delay':
    'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  'Low Parts':
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  'Missing Documents':
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
}

export function NotificationCard({
  notification,
  onToggleRead,
  onDelete,
}: NotificationCardProps) {
  const { t } = useI18n()
  const TypeIcon = typeIcons[notification.type]
  const canViewRelatedCar =
    notification.relatedCarId?.startsWith('car-') ?? false
  const actionLabel = canViewRelatedCar ? t('viewRelatedCar') : t('viewDetails')

  return (
    <Card
      className={cn(
        'border-border/60 transition-colors',
        notification.status === 'Unread' &&
          'border-sky-500/30 bg-sky-500/5 shadow-xs'
      )}
    >
      <CardContent className='p-5'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='flex min-w-0 gap-4'>
            <div className='mt-1 rounded-md bg-muted p-3 text-muted-foreground'>
              <TypeIcon className='h-5 w-5' />
            </div>

            <div className='min-w-0 space-y-3'>
              <div className='space-y-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h3 className='text-base font-semibold'>
                    {notification.title}
                  </h3>
                  <Badge
                    variant='outline'
                    className={typeStyles[notification.type]}
                  >
                    {t(typeLabelKeys[notification.type])}
                  </Badge>
                  <Badge
                    variant='outline'
                    className={severityStyles[notification.severity]}
                  >
                    {t(severityLabelKeys[notification.severity])}
                  </Badge>
                  <Badge
                    variant='outline'
                    className={statusStyles[notification.status]}
                  >
                    {t(statusLabelKeys[notification.status])}
                  </Badge>
                </div>
                <p className='max-w-4xl text-sm text-muted-foreground'>
                  {notification.message}
                </p>
              </div>

              <div className='grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4'>
                <span>
                  <span className='font-medium text-foreground'>
                    {t('createdAt')}:
                  </span>{' '}
                  {formatNotificationDate(notification.createdAt)}
                </span>
                <span>
                  <span className='font-medium text-foreground'>
                    {t('dueDate')}:
                  </span>{' '}
                  {formatNotificationDate(notification.dueDate)}
                </span>
                <span>
                  <span className='font-medium text-foreground'>
                    {t('createdBy')}:
                  </span>{' '}
                  {notification.createdBy}
                </span>
                <span>
                  <span className='font-medium text-foreground'>
                    {t('relatedCar')}:
                  </span>{' '}
                  {notification.relatedCarName ?? '-'}
                </span>
              </div>
            </div>
          </div>

          <div className='flex flex-wrap gap-2 lg:justify-end'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onToggleRead(notification)}
            >
              {notification.status === 'Unread' ? (
                <MailOpen className='h-4 w-4' />
              ) : (
                <Mail className='h-4 w-4' />
              )}
              {notification.status === 'Unread'
                ? t('markAsRead')
                : t('markAsUnread')}
            </Button>

            {notification.actionUrl ? (
              <Button asChild variant='outline' size='sm'>
                <a href={notification.actionUrl}>
                  <Eye className='h-4 w-4' />
                  {actionLabel}
                </a>
              </Button>
            ) : null}

            <Button
              variant='outline'
              size='sm'
              className='text-red-600 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400'
              onClick={() => onDelete(notification)}
            >
              <Trash2 className='h-4 w-4' />
              {t('delete')}
            </Button>
          </div>
        </div>

        {notification.status === 'Unread' ? (
          <div className='mt-4 flex items-center gap-2 text-xs font-medium text-sky-700 dark:text-sky-300'>
            <CheckCircle2 className='h-4 w-4' />
            {t('notificationUnread')}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
