import {
  CircleDollarSign,
  HandCoins,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { type Partner } from '../data/schema'

type PartnerSummaryCardsProps = {
  partners: Partner[]
  currentPartner?: Partner | null
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function PartnerSummaryCards({
  partners,
  currentPartner,
}: PartnerSummaryCardsProps) {
  const { t } = useI18n()
  const totalPartners = partners.length
  const activePartners = partners.filter(
    (partner) => partner.status === 'Active'
  ).length
  const totalContributions = partners.reduce(
    (sum, partner) => sum + partner.totalContribution,
    0
  )
  const currentPartnerProfit = currentPartner?.totalProfit ?? 0
  const currentPartnerLoss = currentPartner?.totalLoss ?? 0
  const finalBalance = partners.reduce(
    (sum, partner) => sum + partner.finalBalance,
    0
  )

  const cards = [
    {
      label: t('totalPartners'),
      value: String(totalPartners),
      icon: Users,
    },
    {
      label: t('activePartners'),
      value: String(activePartners),
      icon: HandCoins,
    },
    {
      label: t('totalContributions'),
      value: money.format(totalContributions),
      icon: WalletCards,
    },
    {
      label: t('myTotalProfit'),
      value: money.format(currentPartnerProfit),
      icon: TrendingUp,
      tone: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: t('myTotalLoss'),
      value: money.format(currentPartnerLoss),
      icon: TrendingDown,
      tone: 'text-red-600 dark:text-red-400',
    },
    {
      label: t('finalBalance'),
      value: money.format(finalBalance),
      icon: CircleDollarSign,
    },
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.label} className='border-border/60'>
            <CardContent className='flex items-center justify-between gap-4 p-5'>
              <div className='min-w-0'>
                <p className='text-sm text-muted-foreground'>{card.label}</p>
                <p className='mt-2 truncate text-2xl font-semibold'>
                  {card.value}
                </p>
              </div>
              <div className='rounded-md bg-muted p-3 text-muted-foreground'>
                <Icon className={card.tone ?? ''} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
