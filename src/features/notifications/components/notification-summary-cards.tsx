import {
  BellRing,
  ClipboardCheck,
  FileWarning,
  MailWarning,
  TriangleAlert,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { type AppNotification } from '../data/schema'

type NotificationSummaryCardsProps = {
  notifications: AppNotification[]
}

export function NotificationSummaryCards({
  notifications,
}: NotificationSummaryCardsProps) {
  const { t } = useI18n()

  const cards = [
    {
      label: t('totalNotifications'),
      value: notifications.length,
      icon: BellRing,
    },
    {
      label: t('unreadNotifications'),
      value: notifications.filter(
        (notification) => notification.status === 'Unread'
      ).length,
      icon: MailWarning,
      tone: 'text-sky-600 dark:text-sky-400',
    },
    {
      label: t('criticalAlerts'),
      value: notifications.filter(
        (notification) => notification.severity === 'Critical'
      ).length,
      icon: TriangleAlert,
      tone: 'text-red-600 dark:text-red-400',
    },
    {
      label: t('inspectionAlerts'),
      value: notifications.filter(
        (notification) => notification.type === 'Inspection'
      ).length,
      icon: ClipboardCheck,
    },
    {
      label: t('missingDocuments'),
      value: notifications.filter(
        (notification) => notification.type === 'Missing Documents'
      ).length,
      icon: FileWarning,
      tone: 'text-amber-600 dark:text-amber-400',
    },
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-5'>
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.label} className='border-border/60'>
            <CardContent className='flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between'>
              <div className='min-w-0'>
                <p className='text-sm text-muted-foreground'>{card.label}</p>
                <p className='mt-2 truncate text-2xl font-semibold'>
                  {card.value}
                </p>
              </div>
              <div className='self-start rounded-md bg-muted p-3 text-muted-foreground sm:self-auto'>
                <Icon className={card.tone ?? ''} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
