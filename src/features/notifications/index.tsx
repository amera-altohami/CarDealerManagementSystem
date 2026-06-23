import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  NotificationDeleteBlockedError,
  deleteNotification,
  getNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
} from '@/services/notificationsService'
import { CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
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

const initialFilters: NotificationFiltersState = {
  search: '',
  type: 'all',
  status: 'all',
  severity: 'all',
}

export function Notifications() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const notificationsQuery = useQuery({
    queryKey: ['notifications'] as const,
    queryFn: getNotifications,
  })
  const [filters, setFilters] =
    useState<NotificationFiltersState>(initialFilters)
  const [notificationToDelete, setNotificationToDelete] =
    useState<AppNotification | null>(null)

  useEffect(() => {
    if (notificationsQuery.isError) {
      toast.error('Failed to load notifications.')
    }
  }, [notificationsQuery.isError])

  const toggleReadMutation = useMutation({
    mutationFn: (notification: AppNotification) =>
      notification.status === 'Unread'
        ? markNotificationAsRead(notification.id)
        : markNotificationAsUnread(notification.id),
    onSuccess: async (_, notification) => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success(
        notification.status === 'Unread'
          ? 'Notification marked as read.'
          : 'Notification marked as unread.'
      )
    },
    onError: (error) => {
      toast.error(getFirestoreErrorMessage(error))
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: (notificationsToRead: AppNotification[]) =>
      Promise.all(
        notificationsToRead.map((notification) =>
          markNotificationAsRead(notification.id)
        )
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification marked as read.')
    },
    onError: () => {
      toast.error('Failed to update notification status.')
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: (notification: AppNotification) =>
      deleteNotification(notification.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setNotificationToDelete(null)
      toast.success('Notification deleted successfully.')
    },
    onError: (error) => {
      if (error instanceof NotificationDeleteBlockedError) {
        toast.warning(
          'This notification cannot be deleted because it is linked to an active related record.'
        )
        return
      }

      toast.error('Failed to delete notification.')
    },
  })

  const notifications = notificationsQuery.data ?? []

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
    toggleReadMutation.mutate(targetNotification)
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate(
      notifications.filter((notification) => notification.status === 'Unread')
    )
  }

  const handleConfirmDelete = () => {
    if (!notificationToDelete) return

    deleteNotificationMutation.mutate(notificationToDelete)
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
            disabled={
              !hasUnreadNotifications || markAllAsReadMutation.isPending
            }
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
          isError={notificationsQuery.isError}
          isLoading={notificationsQuery.isLoading}
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
