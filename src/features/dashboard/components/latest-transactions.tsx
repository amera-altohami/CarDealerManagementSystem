import { type DashboardTransaction } from '@/services/dashboardService'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'

type LatestTransactionsProps = {
  transactions: DashboardTransaction[]
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function LatestTransactions({ transactions }: LatestTransactionsProps) {
  const { t } = useI18n()
  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle>{t('latestTransactions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='hidden overflow-hidden rounded-md border md:block'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('car')}</TableHead>
                <TableHead>{t('type')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className='text-end'>{t('amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className='font-medium'>
                    {transaction.car}
                  </TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell className='text-end'>
                    {money.format(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className='space-y-3 md:hidden'>
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className='rounded-lg border border-border/60 bg-background/60 p-4'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0 space-y-1'>
                  <p className='truncate font-medium'>{transaction.car}</p>
                  <p className='text-sm text-muted-foreground'>
                    {transaction.type}
                  </p>
                </div>
                <StatusBadge status={transaction.status} />
              </div>
              <div className='mt-3 flex items-center justify-between gap-3 text-sm'>
                <span className='text-muted-foreground'>{transaction.date}</span>
                <span className='font-semibold'>
                  {money.format(transaction.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
