import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getExpenseTypeLabel, useI18n } from '@/lib/i18n'

type CostSummary = {
  purchase: number
  shipping: number
  repair: number
  parts: number
  labor: number
  inspection?: number
  fees: number
  bills?: number
  other: number
}

type CostSummaryCardProps = {
  breakdown: CostSummary
  purchasePrice?: number
  sellingPrice: number
  className?: string
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function CostSummaryCard({
  breakdown,
  purchasePrice,
  sellingPrice,
  className,
}: CostSummaryCardProps) {
  const { t, locale } = useI18n()
  const totalCost = Object.values(breakdown).reduce(
    (sum, value) => sum + (value ?? 0),
    0
  )
  const netProfit = sellingPrice - totalCost

  const rows = [
    [t('purchase'), breakdown.purchase],
    [t('shipping'), breakdown.shipping],
    [t('repair'), breakdown.repair],
    [t('partsCost'), breakdown.parts],
    [t('labor'), breakdown.labor],
    [t('inspection'), breakdown.inspection ?? 0],
    [t('fees'), breakdown.fees],
    [getExpenseTypeLabel('Bills', locale), breakdown.bills ?? 0],
    [t('other'), breakdown.other],
  ] as const

  return (
      <Card className={cn('border-border/60', className)}>
      <CardHeader>
        <CardTitle>{t('profitSummary')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {rows.map(([label, amount]) => (
          <div key={label} className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>{label}</span>
            <span className='font-medium'>{money.format(amount)}</span>
          </div>
        ))}
        <div className='border-t pt-3'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Purchase Price</span>
            <span className='font-semibold'>
              {money.format(purchasePrice ?? breakdown.purchase)}
            </span>
          </div>
          <div className='mt-2 flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>{t('sellingPrice')}</span>
            <span className='font-semibold'>{money.format(sellingPrice)}</span>
          </div>
          <div className='mt-2 flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>{t('totalCost')}</span>
            <span className='font-semibold'>{money.format(totalCost)}</span>
          </div>
          <div className='mt-2 flex items-center justify-between rounded-md bg-emerald-500/10 px-3 py-2 text-sm'>
            <span className='font-medium text-emerald-700 dark:text-emerald-300'>
              {t('netProfit')}
            </span>
            <span className='font-semibold text-emerald-700 dark:text-emerald-300'>
              {money.format(netProfit)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
