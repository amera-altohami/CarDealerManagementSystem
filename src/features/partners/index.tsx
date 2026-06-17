import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatCarName, type Car } from '@/services/carsService'
import {
  getAll as getPartnerContributions,
  type PartnerContributionDocument,
} from '@/services/partnerContributionsService'
import {
  getAll as getPartners,
  type PartnerDocument,
} from '@/services/partnersService'
import {
  getAll as getProfitShares,
  type ProfitShareDocument,
} from '@/services/profitSharesService'
import { HandCoins, Plus } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useCarsQuery } from '../cars/hooks/use-cars'
import { ContributionForm } from './components/contribution-form'
import { ContributionsTable } from './components/contributions-table'
import { PartnerForm } from './components/partner-form'
import { PartnerSummaryCards } from './components/partner-summary-cards'
import { PartnersTable } from './components/partners-table'
import {
  type ContributionFormValues,
  type Partner,
  type PartnerContribution,
  type PartnerFormValues,
  type ProfitShare,
} from './data/schema'

const CURRENT_PARTNER_MOCK_ID = 'partner-001'

function formatPartnerDate(value: PartnerDocument['created_at']) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString().slice(0, 10)

  return value.toDate().toISOString().slice(0, 10)
}

function mapPartnerDocument(partner: PartnerDocument): Partner {
  return {
    id: partner.id,
    name: partner.name,
    email: partner.email ?? '',
    phone: partner.phone ?? '',
    investmentPercentage: partner.investment_percentage ?? 0,
    totalContribution: partner.total_contribution ?? 0,
    totalProfit: partner.total_profit ?? 0,
    totalLoss: partner.total_loss ?? 0,
    finalBalance: partner.final_balance ?? 0,
    status: partner.status,
    notes: partner.notes ?? '',
    createdAt: formatPartnerDate(partner.created_at),
  }
}

function mapContributionDocument(
  contribution: PartnerContributionDocument,
  carsById: Map<string, Car>
): PartnerContribution {
  const car = carsById.get(contribution.car_id)

  return {
    id: contribution.id,
    partnerId: contribution.partner_id,
    carId: contribution.car_id,
    carName: car ? formatCarName(car) : contribution.car_name,
    contributionAmount: contribution.contribution_amount,
    investmentPercentage: contribution.investment_percentage,
    contributionDate: contribution.contribution_date,
    paymentMethod: contribution.payment_method,
    notes: contribution.notes ?? '',
  }
}

function mapProfitShareDocument(
  profitShare: ProfitShareDocument,
  carsById: Map<string, Car>
): ProfitShare {
  const car = carsById.get(profitShare.car_id)

  return {
    id: profitShare.id,
    partnerId: profitShare.partner_id,
    carId: profitShare.car_id,
    carName: car ? formatCarName(car) : profitShare.car_name,
    carCost: profitShare.car_cost,
    sellingPrice: profitShare.selling_price,
    netProfit: profitShare.net_profit,
    partnerPercentage: profitShare.partner_percentage,
    partnerProfitShare: profitShare.partner_profit_share,
    status: profitShare.status,
  }
}

function calculatePartnerTotalsFromRecords(
  partnerId: string,
  contributions: PartnerContribution[],
  profitShares: ProfitShare[]
) {
  const partnerContributions = contributions.filter(
    (contribution) => contribution.partnerId === partnerId
  )
  const partnerProfitShares = profitShares.filter(
    (profitShare) => profitShare.partnerId === partnerId
  )
  const totalContribution = partnerContributions.reduce(
    (sum, contribution) => sum + contribution.contributionAmount,
    0
  )
  const totalInvestmentBase = partnerContributions.reduce(
    (sum, contribution) => {
      if (contribution.investmentPercentage <= 0) return sum

      return (
        sum +
        contribution.contributionAmount /
          (contribution.investmentPercentage / 100)
      )
    },
    0
  )
  const investmentPercentage =
    totalInvestmentBase > 0
      ? Number(((totalContribution / totalInvestmentBase) * 100).toFixed(2))
      : 0
  const totalProfit = partnerProfitShares.reduce(
    (sum, profitShare) =>
      profitShare.partnerProfitShare > 0
        ? sum + profitShare.partnerProfitShare
        : sum,
    0
  )
  const totalLoss = partnerProfitShares.reduce(
    (sum, profitShare) =>
      profitShare.partnerProfitShare < 0
        ? sum + Math.abs(profitShare.partnerProfitShare)
        : sum,
    0
  )

  return {
    investmentPercentage,
    totalContribution,
    totalProfit,
    totalLoss,
    finalBalance: totalContribution + totalProfit - totalLoss,
  }
}

export function Partners() {
  const { t } = useI18n()
  const carsQuery = useCarsQuery()
  const partnersQuery = useQuery({
    queryKey: ['partners'],
    queryFn: getPartners,
  })
  const contributionsQuery = useQuery({
    queryKey: ['partner-contributions'],
    queryFn: getPartnerContributions,
  })
  const profitSharesQuery = useQuery({
    queryKey: ['profit-shares'],
    queryFn: getProfitShares,
  })
  const cars = carsQuery.data ?? []
  const [partners, setPartners] = useState<Partner[]>([])
  const [contributions, setContributions] = useState<PartnerContribution[]>([])
  const [profitShares, setProfitShares] = useState<ProfitShare[]>([])
  const [partnerFormOpen, setPartnerFormOpen] = useState(false)
  const [contributionFormOpen, setContributionFormOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null)
  const [contributionToDelete, setContributionToDelete] =
    useState<PartnerContribution | null>(null)
  const currentPartner =
    partners.find((partner) => partner.id === CURRENT_PARTNER_MOCK_ID) ?? null

  useEffect(() => {
    if (!partnersQuery.data) return

    setPartners(partnersQuery.data.map(mapPartnerDocument))
  }, [partnersQuery.data])

  useEffect(() => {
    if (!contributionsQuery.data || !carsQuery.data) return

    const carsById = new Map(carsQuery.data.map((car) => [car.id, car]))
    setContributions(
      contributionsQuery.data
        .filter((contribution) => carsById.has(contribution.car_id))
        .map((contribution) => mapContributionDocument(contribution, carsById))
    )
  }, [carsQuery.data, contributionsQuery.data])

  useEffect(() => {
    if (!profitSharesQuery.data || !carsQuery.data) return

    const carsById = new Map(carsQuery.data.map((car) => [car.id, car]))
    setProfitShares(
      profitSharesQuery.data
        .filter((profitShare) => carsById.has(profitShare.car_id))
        .map((profitShare) => mapProfitShareDocument(profitShare, carsById))
    )
  }, [carsQuery.data, profitSharesQuery.data])

  const recalculatePartners = (
    nextPartners: Partner[],
    nextContributions: PartnerContribution[],
    nextProfitShares: ProfitShare[]
  ) =>
    nextPartners.map((partner) => ({
      ...partner,
      ...calculatePartnerTotalsFromRecords(
        partner.id,
        nextContributions,
        nextProfitShares
      ),
    }))

  const handleAddPartner = () => {
    setEditingPartner(null)
    setPartnerFormOpen(true)
  }

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner)
    setPartnerFormOpen(true)
  }

  const handleSubmitPartner = (values: PartnerFormValues) => {
    if (editingPartner) {
      setPartners((currentPartners) =>
        currentPartners.map((partner) =>
          partner.id === editingPartner.id ? { ...partner, ...values } : partner
        )
      )
    } else {
      const today = new Date().toISOString().slice(0, 10)
      setPartners((currentPartners) => [
        {
          id: `partner-${Date.now()}`,
          ...values,
          investmentPercentage: 0,
          totalContribution: 0,
          totalProfit: 0,
          totalLoss: 0,
          finalBalance: 0,
          createdAt: today,
        },
        ...currentPartners,
      ])
    }

    setPartnerFormOpen(false)
    setEditingPartner(null)
  }

  const handleSubmitContribution = (values: ContributionFormValues) => {
    const car = cars.find((item) => item.id === values.carId)
    const carCost = car?.purchasePrice ?? 0
    const sellingPrice = car?.sellingPrice ?? 0
    const investmentPercentage =
      carCost > 0
        ? Number(((values.contributionAmount / carCost) * 100).toFixed(2))
        : 0
    const netProfit = sellingPrice - carCost
    const newContribution: PartnerContribution = {
      id: `contribution-${Date.now()}`,
      ...values,
      investmentPercentage,
      carName: car ? formatCarName(car) : values.carId,
    }
    const newProfitShare: ProfitShare = {
      id: `profit-${newContribution.id.replace('contribution-', '')}`,
      partnerId: newContribution.partnerId,
      carId: newContribution.carId,
      carName: newContribution.carName,
      carCost,
      sellingPrice,
      netProfit,
      partnerPercentage: investmentPercentage,
      partnerProfitShare: (netProfit * investmentPercentage) / 100,
      status:
        netProfit < 0 ? 'Loss' : car?.status === 'sold' ? 'Paid' : 'Pending',
    }
    const nextContributions = [newContribution, ...contributions]
    const nextProfitShares = [newProfitShare, ...profitShares]

    setContributions(nextContributions)
    setProfitShares(nextProfitShares)
    setPartners((currentPartners) =>
      recalculatePartners(currentPartners, nextContributions, nextProfitShares)
    )
    setContributionFormOpen(false)
  }

  const handleToggleStatus = (targetPartner: Partner) => {
    setPartners((currentPartners) =>
      currentPartners.map((partner) =>
        partner.id === targetPartner.id
          ? {
              ...partner,
              status: partner.status === 'Active' ? 'Inactive' : 'Active',
            }
          : partner
      )
    )
  }

  const handleConfirmDeletePartner = () => {
    if (!partnerToDelete) return

    setPartners((currentPartners) =>
      currentPartners.filter((partner) => partner.id !== partnerToDelete.id)
    )
    setContributions((currentContributions) =>
      currentContributions.filter(
        (contribution) => contribution.partnerId !== partnerToDelete.id
      )
    )
    setProfitShares((currentProfitShares) =>
      currentProfitShares.filter(
        (profitShare) => profitShare.partnerId !== partnerToDelete.id
      )
    )
    setPartnerToDelete(null)
  }

  const handleConfirmDeleteContribution = () => {
    if (!contributionToDelete) return

    const relatedProfitShareId = `profit-${contributionToDelete.id.replace(
      'contribution-',
      ''
    )}`
    const nextContributions = contributions.filter(
      (contribution) => contribution.id !== contributionToDelete.id
    )
    const nextProfitShares = profitShares.filter(
      (profitShare) => profitShare.id !== relatedProfitShareId
    )

    setContributions(nextContributions)
    setProfitShares(nextProfitShares)
    setPartners((currentPartners) =>
      recalculatePartners(currentPartners, nextContributions, nextProfitShares)
    )
    setContributionToDelete(null)
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
              {t('partnersInvestments')}
            </h1>
            <p className='text-muted-foreground'>
              {t('partnersInvestmentsDesc')}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button
              variant='outline'
              onClick={() => setContributionFormOpen(true)}
            >
              <HandCoins className='h-4 w-4' />
              {t('addContribution')}
            </Button>
            <Button onClick={handleAddPartner}>
              <Plus className='h-4 w-4' />
              {t('addPartner')}
            </Button>
          </div>
        </div>

        <PartnerSummaryCards
          partners={partners}
          currentPartner={currentPartner}
        />

        <PartnersTable
          data={partners}
          onEdit={handleEditPartner}
          onDelete={setPartnerToDelete}
          onToggleStatus={handleToggleStatus}
        />

        <ContributionsTable
          contributions={contributions}
          partners={partners}
          onDelete={setContributionToDelete}
        />
      </Main>

      <PartnerForm
        open={partnerFormOpen}
        onOpenChange={(open) => {
          setPartnerFormOpen(open)
          if (!open) {
            setEditingPartner(null)
          }
        }}
        defaultValues={
          editingPartner
            ? {
                name: editingPartner.name,
                email: editingPartner.email,
                phone: editingPartner.phone,
                status: editingPartner.status,
                notes: editingPartner.notes,
              }
            : undefined
        }
        onSubmit={handleSubmitPartner}
      />

      <ContributionForm
        open={contributionFormOpen}
        onOpenChange={setContributionFormOpen}
        partners={partners}
        cars={cars}
        onSubmit={handleSubmitContribution}
      />

      <ConfirmDialog
        open={!!partnerToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setPartnerToDelete(null)
          }
        }}
        title={t('deletePartner')}
        desc={
          <span>
            {t('deletePartnerConfirmStart')}{' '}
            <strong>{partnerToDelete?.name ?? ''}</strong>
            {t('deletePartnerConfirmEnd')}
          </span>
        }
        destructive
        confirmText={t('delete')}
        cancelBtnText={t('cancel')}
        handleConfirm={handleConfirmDeletePartner}
      />

      <ConfirmDialog
        open={!!contributionToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setContributionToDelete(null)
          }
        }}
        title={t('deleteContribution')}
        desc={
          <span>
            {t('deleteContributionConfirmStart')}{' '}
            <strong>{contributionToDelete?.carName ?? ''}</strong>
            {t('deleteContributionConfirmEnd')}
          </span>
        }
        destructive
        confirmText={t('delete')}
        cancelBtnText={t('cancel')}
        handleConfirm={handleConfirmDeleteContribution}
      />
    </>
  )
}
