import { useI18n, type MessageKey } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  notificationSeverityOptions,
  notificationStatusOptions,
  notificationTypeOptions,
  type NotificationFilters,
  type NotificationReadStatus,
  type NotificationSeverity,
  type NotificationType,
} from '../data/schema'

type NotificationFiltersProps = {
  filters: NotificationFilters
  onChange: (filters: NotificationFilters) => void
}

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

export function NotificationFilters({
  filters,
  onChange,
}: NotificationFiltersProps) {
  const { t } = useI18n()

  const updateFilters = (nextFilters: Partial<NotificationFilters>) => {
    onChange({ ...filters, ...nextFilters })
  }

  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle className='text-base'>{t('notificationFilters')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid gap-3 lg:grid-cols-[1fr_220px_220px_220px]'>
          <Input
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
            placeholder={t('searchNotifications')}
          />

          <Select
            value={filters.type}
            onValueChange={(type) =>
              updateFilters({ type: type as NotificationFilters['type'] })
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={t('allNotificationTypes')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('allNotificationTypes')}</SelectItem>
              {notificationTypeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(typeLabelKeys[type])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(status) =>
              updateFilters({
                status: status as NotificationFilters['status'],
              })
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={t('allNotificationStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>
                {t('allNotificationStatuses')}
              </SelectItem>
              {notificationStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(statusLabelKeys[status])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.severity}
            onValueChange={(severity) =>
              updateFilters({
                severity: severity as NotificationFilters['severity'],
              })
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={t('allSeverities')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('allSeverities')}</SelectItem>
              {notificationSeverityOptions.map((severity) => (
                <SelectItem key={severity} value={severity}>
                  {t(severityLabelKeys[severity])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
