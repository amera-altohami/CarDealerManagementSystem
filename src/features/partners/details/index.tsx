import { Link } from '@tanstack/react-router'
import { carsMockData } from '@/data/carsMockData'
import {
  ArrowLeft,
  CircleDollarSign,
  HandCoins,
  TrendingDown,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import { useI18n, type MessageKey } from '@/lib/i18n'
import { getDisplayNameInitials, cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ContributionsTable } from '../components/contributions-table'
import { ProfitShareTable } from '../components/profit-share-table'
import {
  getPartnerById,
  getPartnerContributions,
  getPartnerProfitShares,
  partnersMockData,
} from '../data/partnersMockData'
import { type Partner } from '../data/schema'

type PartnerDetailsProps = {
  partnerId: string
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const statusStyles: Record<Partner['status'], string> = {
  Active:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Inactive:
    'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
}

const statusLabelKeys: Record<Partner['status'], MessageKey> = {
  Active: 'activeStatus',
  Inactive: 'inactiveStatus',
}

export function PartnerDetails({ partnerId }: PartnerDetailsProps) {
  const { t } = useI18n()
  const partner = getPartnerById(partnerId)

  if (!partner) {
    return (
      <>
        <Header fixed>
          <Search className='me-auto' />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </Header>
        <Main>
          <Card className='border-border/60'>
            <CardContent className='flex min-h-64 flex-col items-center justify-center gap-3 text-center'>
              <UserRound className='h-10 w-10 text-muted-foreground' />
              <div>
                <h1 className='text-xl font-semibold'>
                  {t('partnerNotFound')}
                </h1>
                <p className='text-muted-foreground'>
                  {t('partnerNotFoundDesc')}
                </p>
              </div>
              <Button asChild>
                <Link to='/partners'>{t('partnersInvestments')}</Link>
              </Button>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  const contributions = getPartnerContributions(partner.id)
  const profitShares = getPartnerProfitShares(partner.id)
  const relatedCarIds = Array.from(
    new Set([
      ...contributions.map((contribution) => contribution.carId),
      ...profitShares.map((profitShare) => profitShare.carId),
    ])
  )

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <Button asChild variant='outline' size='icon'>
              <Link to='/partners'>
                <ArrowLeft className='h-4 w-4' />
                <span className='sr-only'>{t('partnersInvestments')}</span>
              </Link>
            </Button>
            <div>
              <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
                {partner.name}
              </h1>
              <p className='text-muted-foreground'>{t('partnerDetails')}</p>
            </div>
          </div>
        </div>

        <div className='grid gap-4 lg:grid-cols-[340px_1fr]'>
          <Card className='border-border/60'>
            <CardHeader>
              <CardTitle>{t('partnerProfile')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-5'>
              <div className='flex items-center gap-3'>
                <Avatar className='h-14 w-14 rounded-md'>
                  <AvatarFallback className='rounded-md bg-muted text-base font-semibold'>
                    {getDisplayNameInitials(partner.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-semibold'>{partner.name}</p>
                  <p className='text-sm text-muted-foreground'>{partner.id}</p>
                </div>
              </div>
              <div className='space-y-3 text-sm'>
                <InfoRow label={t('email')} value={partner.email || '-'} />
                <InfoRow label={t('phone')} value={partner.phone || '-'} />
                <InfoRow
                  label={t('investmentPercentage')}
                  value={`${partner.investmentPercentage}%`}
                />
                <InfoRow
                  label={t('status')}
                  value={
                    <Badge
                      variant='outline'
                      className={statusStyles[partner.status]}
                    >
                      {t(statusLabelKeys[partner.status])}
                    </Badge>
                  }
                />
                <InfoRow label={t('createdAt')} value={partner.createdAt} />
              </div>
              {partner.notes ? (
                <p className='rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground'>
                  {partner.notes}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <MetricCard
              icon={<HandCoins className='h-4 w-4' />}
              label={t('totalContribution')}
              value={money.format(partner.totalContribution)}
            />
            <MetricCard
              icon={<TrendingUp className='h-4 w-4' />}
              label={t('profit')}
              value={money.format(partner.totalProfit)}
              className='border-emerald-500/20 bg-emerald-500/5'
            />
            <MetricCard
              icon={<TrendingDown className='h-4 w-4' />}
              label={t('loss')}
              value={
                partner.totalLoss > 0
                  ? `-${money.format(partner.totalLoss)}`
                  : money.format(0)
              }
              className='border-red-500/20 bg-red-500/5'
            />
            <MetricCard
              icon={<CircleDollarSign className='h-4 w-4' />}
              label={t('finalBalance')}
              value={money.format(partner.finalBalance)}
            />
          </div>
        </div>

        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList className='w-full flex-wrap justify-start'>
            <TabsTrigger value='overview'>{t('overview')}</TabsTrigger>
            <TabsTrigger value='contributions'>
              {t('contributions')}
            </TabsTrigger>
            <TabsTrigger value='profit-loss'>{t('profitAndLoss')}</TabsTrigger>
            <TabsTrigger value='related-cars'>{t('relatedCars')}</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='grid gap-4 lg:grid-cols-2'>
            <ContributionsTable
              contributions={contributions.slice(0, 3)}
              partners={partnersMockData}
              title={t('recentContributions')}
            />
            <ProfitShareTable
              profitShares={profitShares.slice(0, 3)}
              title={t('profitAndLoss')}
            />
          </TabsContent>

          <TabsContent value='contributions' className='space-y-4'>
            <ContributionsTable
              contributions={contributions}
              partners={partnersMockData}
            />
          </TabsContent>

          <TabsContent value='profit-loss' className='space-y-4'>
            <ProfitShareTable profitShares={profitShares} />
          </TabsContent>

          <TabsContent value='related-cars' className='space-y-4'>
            <RelatedCarsTable
              relatedCarIds={relatedCarIds}
              contributions={contributions}
              profitShares={profitShares}
            />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-center justify-between gap-4 border-b pb-2 last:border-0 last:pb-0'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-end font-medium'>{value}</span>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode
  label: string
  value: string
  className?: string
}) {
  return (
    <Card className={cn('border-border/60', className)}>
      <CardContent className='flex items-center gap-3 p-4'>
        <div className='rounded-md bg-background/70 p-2 text-muted-foreground'>
          {icon}
        </div>
        <div className='min-w-0'>
          <p className='text-sm text-muted-foreground'>{label}</p>
          <p className='truncate text-lg font-semibold'>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function RelatedCarsTable({
  relatedCarIds,
  contributions,
  profitShares,
}: {
  relatedCarIds: string[]
  contributions: ReturnType<typeof getPartnerContributions>
  profitShares: ReturnType<typeof getPartnerProfitShares>
}) {
  const { t } = useI18n()

  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle>{t('relatedCars')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('car')}</TableHead>
                <TableHead>{t('totalContribution')}</TableHead>
                <TableHead>{t('percentage')}</TableHead>
                <TableHead>{t('partnerProfitShare')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatedCarIds.length ? (
                relatedCarIds.map((carId) => {
                  const contribution = contributions.find(
                    (item) => item.carId === carId
                  )
                  const profitShare = profitShares.find(
                    (item) => item.carId === carId
                  )
                  const car = carsMockData.find((item) => item.id === carId)
                  const carName =
                    contribution?.carName ?? profitShare?.carName ?? carId

                  return (
                    <TableRow key={carId}>
                      <TableCell>
                        {car ? (
                          <Link
                            to='/cars/$carId'
                            params={{ carId }}
                            className='font-medium underline-offset-4 hover:underline'
                          >
                            {carName}
                          </Link>
                        ) : (
                          carName
                        )}
                      </TableCell>
                      <TableCell>
                        {money.format(contribution?.contributionAmount ?? 0)}
                      </TableCell>
                      <TableCell>
                        {contribution?.investmentPercentage ??
                          profitShare?.partnerPercentage ??
                          0}
                        %
                      </TableCell>
                      <TableCell
                        className={cn(
                          'font-medium',
                          (profitShare?.partnerProfitShare ?? 0) >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {money.format(profitShare?.partnerProfitShare ?? 0)}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    {t('noRelatedCarsFound')}
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
