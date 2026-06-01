import { Link } from '@tanstack/react-router'
import { useI18n, type MessageKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type ProfitShare } from '../data/schema'

type ProfitShareTableProps = {
  profitShares: ProfitShare[]
  title?: string
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const statusStyles: Record<ProfitShare['status'], string> = {
  Pending:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Paid: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Loss: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
}

const statusLabelKeys: Record<ProfitShare['status'], MessageKey> = {
  Pending: 'pendingStatus',
  Paid: 'paidStatus',
  Loss: 'lossStatus',
}

function isKnownCarId(carId: string) {
  return carId.startsWith('car-')
}

export function ProfitShareTable({
  profitShares,
  title,
}: ProfitShareTableProps) {
  const { t } = useI18n()

  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle>{title ?? t('profitAndLoss')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('car')}</TableHead>
                <TableHead>{t('carCost')}</TableHead>
                <TableHead>{t('sellingPrice')}</TableHead>
                <TableHead>{t('netProfit')}</TableHead>
                <TableHead>{t('partnerPercentage')}</TableHead>
                <TableHead>{t('partnerProfitShare')}</TableHead>
                <TableHead>{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profitShares.length ? (
                profitShares.map((profitShare) => (
                  <TableRow key={profitShare.id}>
                    <TableCell>
                      {isKnownCarId(profitShare.carId) ? (
                        <Link
                          to='/cars/$carId'
                          params={{ carId: profitShare.carId }}
                          className='font-medium underline-offset-4 hover:underline'
                        >
                          {profitShare.carName}
                        </Link>
                      ) : (
                        profitShare.carName
                      )}
                    </TableCell>
                    <TableCell>{money.format(profitShare.carCost)}</TableCell>
                    <TableCell>
                      {money.format(profitShare.sellingPrice)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'font-medium',
                        profitShare.netProfit >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {money.format(profitShare.netProfit)}
                    </TableCell>
                    <TableCell>{profitShare.partnerPercentage}%</TableCell>
                    <TableCell
                      className={cn(
                        'font-medium',
                        profitShare.partnerProfitShare >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {money.format(profitShare.partnerProfitShare)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={statusStyles[profitShare.status]}
                      >
                        {t(statusLabelKeys[profitShare.status])}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    {t('noProfitSharesFound')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
