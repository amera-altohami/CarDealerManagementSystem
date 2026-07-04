import {
  ListChecks,
  LogIn,
  PencilLine,
  PlusCircle,
  Trash2,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { type ActivityLog } from '../data/schema'

type LogSummaryCardsProps = {
  logs: ActivityLog[]
}

export function LogSummaryCards({ logs }: LogSummaryCardsProps) {
  const { t } = useI18n()

  const cards = [
    {
      label: t('totalLogs'),
      value: logs.length,
      icon: ListChecks,
    },
    {
      label: t('createActions'),
      value: logs.filter((log) => log.action === 'Create').length,
      icon: PlusCircle,
      tone: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: t('updateActions'),
      value: logs.filter((log) => log.action === 'Update').length,
      icon: PencilLine,
      tone: 'text-sky-600 dark:text-sky-400',
    },
    {
      label: t('deleteActions'),
      value: logs.filter((log) => log.action === 'Delete').length,
      icon: Trash2,
      tone: 'text-red-600 dark:text-red-400',
    },
    {
      label: t('loginActions'),
      value: logs.filter((log) => log.action === 'Login').length,
      icon: LogIn,
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
