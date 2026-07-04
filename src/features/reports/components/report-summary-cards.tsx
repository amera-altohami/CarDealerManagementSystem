import { Card, CardContent } from '@/components/ui/card'
import { type ReportSummaryItem } from '../data/schema'

type ReportSummaryCardsProps = {
  items: ReportSummaryItem[]
}

export function ReportSummaryCards({ items }: ReportSummaryCardsProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
      {items.map((item) => {
        const Icon = item.icon

        return (
          <Card key={item.label} className='border-border/60'>
            <CardContent className='flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between'>
              <div className='min-w-0'>
                <p className='text-sm text-muted-foreground'>{item.label}</p>
                <p className='mt-2 truncate text-2xl font-semibold'>
                  {item.value}
                </p>
              </div>
              {Icon ? (
                <div className='self-start rounded-md bg-muted p-3 text-muted-foreground sm:self-auto'>
                  <Icon className={item.tone ?? ''} />
                </div>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
