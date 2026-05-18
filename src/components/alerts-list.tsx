import { AlertTriangle, OctagonAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { type AlertItem } from '@/data/carsMockData'
import { useI18n } from '@/lib/i18n'

type AlertsListProps = {
  alerts: AlertItem[]
  className?: string
}

export function AlertsList({ alerts, className }: AlertsListProps) {
  const { t } = useI18n()
  return (
    <Card className={cn('border-amber-500/20 bg-amber-500/5', className)}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <OctagonAlert className='h-5 w-5 text-amber-500' />
          {t('delayedCarsAlerts')}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'rounded-lg border p-4',
              alert.severity === 'critical'
                ? 'border-red-500/20 bg-red-500/5'
                : 'border-amber-500/20 bg-amber-500/5'
            )}
          >
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='h-4 w-4 text-amber-500' />
                  <p className='font-medium'>{alert.title}</p>
                </div>
                <p className='text-sm text-muted-foreground'>
                  {alert.description}
                </p>
              </div>
              <StatusBadge status={alert.severity} />
            </div>
            <p className='mt-2 text-xs text-muted-foreground'>{alert.car}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
