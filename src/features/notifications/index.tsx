import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCheck } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationFilters } from './components/notification-filters'
import { NotificationSummaryCards } from './components/notification-summary-cards'
import { NotificationsList } from './components/notifications-list'
import {
  type AppNotification,
  type NotificationFilters as NotificationFiltersState,
} from './data/schema'
import { getAppNotifications } from '@/services/notificationsService'

const initialFilters: NotificationFiltersState = {
  search: '',
  type: 'all',
  status: 'all',
  severity: 'all',
}

export function Notifications() {
  const { t } = useI18n()
  const notificationsQuery = useQuery({
    queryKey: ['notifications'] as const,
    queryFn: getAppNotifications,
  })
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [filters, setFilters] =
    useState<NotificationFiltersState>(initialFilters)
  const [notificationToDelete, setNotificationToDelete] =
    useState<AppNotification | null>(null)

  useEffect(() => {
    if (notificationsQuery.data) {
      setNotifications(notificationsQuery.data)
    }
  }, [notificationsQuery.data])

  const hasUnreadNotifications = notifications.some(
    (notification) => notification.status === 'Unread'
  )

  const filteredNotifications = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return notifications.filter((notification) => {
      const matchesSearch =
        !search ||
        [
          notification.title,
          notification.message,
          notification.type,
          notification.severity,
          notification.relatedCarName,
          notification.createdBy,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(search)
      const matchesType =
        filters.type === 'all' || notification.type === filters.type
      const matchesStatus =
        filters.status === 'all' || notification.status === filters.status
      const matchesSeverity =
        filters.severity === 'all' || notification.severity === filters.severity

      return matchesSearch && matchesType && matchesStatus && matchesSeverity
    })
  }, [filters, notifications])

  const handleToggleRead = (targetNotification: AppNotification) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === targetNotification.id
          ? {
              ...notification,
              status: notification.status === 'Unread' ? 'Read' : 'Unread',
            }
          : notification
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        status: 'Read',
      }))
    )
  }

  const handleConfirmDelete = () => {
    if (!notificationToDelete) return

    setNotifications((currentNotifications) =>
      currentNotifications.filter(
        (notification) => notification.id !== notificationToDelete.id
      )
    )
    setNotificationToDelete(null)
  }

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
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
              {t('notifications')}
            </h1>
            <p className='text-muted-foreground'>{t('notificationsDesc')}</p>
          </div>
          <Button
            variant='outline'
            onClick={handleMarkAllAsRead}
            disabled={!hasUnreadNotifications}
          >
            <CheckCheck className='h-4 w-4' />
            {t('markAllAsRead')}
          </Button>
        </div>

        <NotificationSummaryCards notifications={notifications} />

        <NotificationFilters filters={filters} onChange={setFilters} />

        <NotificationsList
          notifications={filteredNotifications}
          onToggleRead={handleToggleRead}
          onDelete={setNotificationToDelete}
        />
      </Main>

      <ConfirmDialog
        open={!!notificationToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setNotificationToDelete(null)
          }
        }}
        title={t('deleteNotification')}
        desc={
          <span>
            {t('deleteNotificationConfirmStart')}{' '}
            <strong>{notificationToDelete?.title ?? ''}</strong>
            {t('deleteNotificationConfirmEnd')}
          </span>
        }
        destructive
        confirmText={t('delete')}
        cancelBtnText={t('cancel')}
        handleConfirm={handleConfirmDelete}
      />
    </>
  )
}
