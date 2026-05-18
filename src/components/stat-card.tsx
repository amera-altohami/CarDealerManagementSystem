import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StatCardProps = {
  title: string
  value: string
  description?: string
  icon?: ReactNode
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('border-border/60', className)}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold tracking-tight'>{value}</div>
        {description ? (
          <p className='mt-1 text-xs text-muted-foreground'>{description}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
