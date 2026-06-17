import { Link } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { useI18n, type MessageKey } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  type Partner,
  type PartnerContribution,
  type ContributionFormValues,
} from '../data/schema'

type ContributionsTableProps = {
  contributions: PartnerContribution[]
  partners: Partner[]
  isLoading?: boolean
  title?: string
  onDelete?: (contribution: PartnerContribution) => void
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const paymentMethodLabelKeys: Record<
  ContributionFormValues['paymentMethod'],
  MessageKey
> = {
  Cash: 'paymentCash',
  Zelle: 'paymentZelle',
  Card: 'paymentCard',
  'Bank Transfer': 'paymentBankTransfer',
  Other: 'paymentOther',
}

function isKnownCarId(carId: string) {
  return carId.startsWith('car-')
}

export function ContributionsTable({
  contributions,
  partners,
  isLoading = false,
  title,
  onDelete,
}: ContributionsTableProps) {
  const { t } = useI18n()
  const partnerNames = new Map(
    partners.map((partner) => [partner.id, partner.name])
  )

  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle>{title ?? t('contributions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('partner')}</TableHead>
                <TableHead>{t('car')}</TableHead>
                <TableHead>{t('amount')}</TableHead>
                <TableHead>{t('percentage')}</TableHead>
                <TableHead>{t('paymentMethod')}</TableHead>
                <TableHead>{t('notes')}</TableHead>
                {onDelete ? (
                  <TableHead className='text-end'>{t('actions')}</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={onDelete ? 8 : 7}
                    className='h-24 text-center'
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : contributions.length ? (
                contributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell>{contribution.contributionDate}</TableCell>
                    <TableCell>
                      {partnerNames.get(contribution.partnerId) ?? '-'}
                    </TableCell>
                    <TableCell>
                      {isKnownCarId(contribution.carId) ? (
                        <Link
                          to='/cars/$carId'
                          params={{ carId: contribution.carId }}
                          className='font-medium underline-offset-4 hover:underline'
                        >
                          {contribution.carName}
                        </Link>
                      ) : (
                        contribution.carName
                      )}
                    </TableCell>
                    <TableCell>
                      {money.format(contribution.contributionAmount)}
                    </TableCell>
                    <TableCell>{contribution.investmentPercentage}%</TableCell>
                    <TableCell>
                      {t(paymentMethodLabelKeys[contribution.paymentMethod])}
                    </TableCell>
                    <TableCell className='max-w-64 truncate text-muted-foreground'>
                      {contribution.notes || '-'}
                    </TableCell>
                    {onDelete ? (
                      <TableCell className='text-end'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-red-500 hover:text-red-600'
                          onClick={() => onDelete(contribution)}
                        >
                          <Trash2 className='h-4 w-4' />
                          <span className='sr-only'>{t('delete')}</span>
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={onDelete ? 8 : 7}
                    className='h-24 text-center'
                  >
                    {t('noContributionsFound')}
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
