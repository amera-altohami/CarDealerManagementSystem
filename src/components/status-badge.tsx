import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { carStatusOptions, type CarStatus } from '@/data/carsMockData'

type StatusBadgeProps = {
  status: CarStatus | string
  className?: string
}

const statusStyles: Record<string, string> = {
  purchased: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  shipping:
    'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  repairing:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  'ready-for-sale':
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  sold: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  Completed:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Pending:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Delayed:
    'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  warning:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  critical: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label =
    carStatusOptions.find((option) => option.value === status)?.label ??
    String(status)

  return (
    <Badge
      variant='outline'
      className={cn('capitalize', statusStyles[status] ?? '', className)}
    >
      {label}
    </Badge>
  )
}
