import { useMemo, useState } from 'react'
import { usersMockData } from '@/features/users/data/usersMockData'
import { useI18n } from '@/lib/i18n'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { LogFilters } from './components/log-filters'
import { LogSummaryCards } from './components/log-summary-cards'
import { LogsTable } from './components/logs-table'
import { activityLogsMockData } from './data/logsMockData'
import {
  type ActivityLog,
  type ActivityLogFilters,
} from './data/schema'

const initialFilters: ActivityLogFilters = {
  search: '',
  userId: 'all',
  action: 'all',
  module: 'all',
  fromDate: '',
  toDate: '',
}

export function ActivityLogs() {
  const { t } = useI18n()
  const [logs] = useState<ActivityLog[]>(
    [...activityLogsMockData].sort((firstLog, secondLog) =>
      secondLog.createdAt.localeCompare(firstLog.createdAt)
    )
  )
  const [filters, setFilters] = useState<ActivityLogFilters>(initialFilters)

  const users = useMemo(
    () =>
      usersMockData.map((user) => ({
        id: user.id,
        name: user.fullName,
      })),
    []
  )

  const filteredLogs = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return logs.filter((log) => {
      const matchesSearch =
        !search ||
        [
          log.userName,
          log.entityName,
          log.entityType,
          log.module,
          log.action,
          log.description,
          log.ipAddress,
        ]
          .join(' ')
          .toLowerCase()
          .includes(search)
      const matchesUser = filters.userId === 'all' || log.userId === filters.userId
      const matchesAction =
        filters.action === 'all' || log.action === filters.action
      const matchesModule =
        filters.module === 'all' || log.module === filters.module
      const matchesFromDate =
        !filters.fromDate || log.date >= filters.fromDate
      const matchesToDate = !filters.toDate || log.date <= filters.toDate

      return (
        matchesSearch &&
        matchesUser &&
        matchesAction &&
        matchesModule &&
        matchesFromDate &&
        matchesToDate
      )
    })
  }, [filters, logs])

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
              {t('activityLogs')}
            </h1>
            <p className='text-muted-foreground'>{t('activityLogsDesc')}</p>
          </div>
        </div>

        <LogSummaryCards logs={logs} />

        <LogFilters filters={filters} users={users} onChange={setFilters} />

        <LogsTable logs={filteredLogs} />
      </Main>
    </>
  )
}
