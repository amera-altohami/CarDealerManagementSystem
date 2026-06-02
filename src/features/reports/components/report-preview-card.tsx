import { type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ReportPreviewCardProps = {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function ReportPreviewCard({
  title,
  description,
  actions,
  children,
}: ReportPreviewCardProps) {
  return (
    <Card className='border-border/60'>
      <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='space-y-1'>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <p className='text-sm text-muted-foreground'>{description}</p>
          ) : null}
        </div>
        {actions}
      </CardHeader>
      <CardContent className='space-y-6'>{children}</CardContent>
    </Card>
  )
}
