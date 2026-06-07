import { BellOff } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { type AppNotification } from '../data/schema'
import { NotificationCard } from './notification-card'

type NotificationsListProps = {
  notifications: AppNotification[]
  onToggleRead: (notification: AppNotification) => void
  onDelete: (notification: AppNotification) => void
}

export function NotificationsList({
  notifications,
  onToggleRead,
  onDelete,
}: NotificationsListProps) {
  const { t } = useI18n()

  if (!notifications.length) {
    return (
      <Card className='border-border/60'>
        <CardContent className='flex min-h-48 flex-col items-center justify-center gap-3 p-8 text-center'>
          <div className='rounded-md bg-muted p-3 text-muted-foreground'>
            <BellOff className='h-6 w-6' />
          </div>
          <p className='text-sm text-muted-foreground'>
            {t('noNotificationsFound')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='grid gap-3'>
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onToggleRead={onToggleRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
