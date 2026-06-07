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
  activityLogActionOptions,
  activityLogModuleOptions,
  type ActivityLogAction,
  type ActivityLogFilters,
  type ActivityLogModule,
} from '../data/schema'

type LogFiltersProps = {
  filters: ActivityLogFilters
  users: Array<{ id: string; name: string }>
  onChange: (filters: ActivityLogFilters) => void
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

export function LogFilters({ filters, users, onChange }: LogFiltersProps) {
  const { t } = useI18n()

  const updateFilters = (nextFilters: Partial<ActivityLogFilters>) => {
    onChange({ ...filters, ...nextFilters })
  }

  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle className='text-base'>{t('filters')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid gap-3 lg:grid-cols-2 xl:grid-cols-[1fr_220px_180px_200px_160px_160px]'>
          <Input
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
            placeholder={t('searchActivityLogs')}
          />

          <Select
            value={filters.userId}
            onValueChange={(userId) => updateFilters({ userId })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={t('allUsers')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('allUsers')}</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.action}
            onValueChange={(action) =>
              updateFilters({ action: action as ActivityLogFilters['action'] })
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={t('allActions')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('allActions')}</SelectItem>
              {activityLogActionOptions.map((action) => (
                <SelectItem key={action} value={action}>
                  {t(actionLabelKeys[action])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.module}
            onValueChange={(module) =>
              updateFilters({ module: module as ActivityLogFilters['module'] })
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={t('allModules')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('allModules')}</SelectItem>
              {activityLogModuleOptions.map((module) => (
                <SelectItem key={module} value={module}>
                  {t(moduleLabelKeys[module])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type='date'
            value={filters.fromDate}
            aria-label={t('fromDate')}
            onChange={(event) =>
              updateFilters({ fromDate: event.target.value })
            }
          />

          <Input
            type='date'
            value={filters.toDate}
            aria-label={t('toDate')}
            onChange={(event) => updateFilters({ toDate: event.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
