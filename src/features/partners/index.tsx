import { useEffect, useMemo, useState } from 'react'
import { formatCarName, type Car } from '@/services/carsService'
import { HandCoins, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
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
import {
  useCreateContributionMutation,
  useCreatePartnerMutation,
  useCreateProfitShareMutation,
  useDeleteContributionMutation,
  useDeletePartnerMutation,
  usePartnerCarsQuery,
  usePartnerContributionsQuery,
  usePartnersQuery,
  useProfitSharesQuery,
  useUpdatePartnerMutation,
} from './hooks/use-partners'

const CURRENT_PARTNER_MOCK_ID = 'partner-001'

function getCarInvestmentBase(car?: Car) {
  return car?.purchasePrice ?? 0
}

function calculateContributionPercentage(
  car: Car | undefined,
  contributionAmount: number
) {
  const investmentBase = getCarInvestmentBase(car)

  if (investmentBase <= 0) {
    return 0
  }

  return Number(((contributionAmount / investmentBase) * 100).toFixed(2))
}

function calculatePartnerTotals(
  partnerId: string,
  contributions: PartnerContribution[],
  profitShares: ProfitShare[],
  cars: Car[]
) {
  const carMap = new Map(cars.map((car) => [car.id, car]))
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
    (sum, contribution) =>
      sum + getCarInvestmentBase(carMap.get(contribution.carId)),
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

function enrichPartnersWithTotals(
  partners: Partner[],
  contributions: PartnerContribution[],
  profitShares: ProfitShare[],
  cars: Car[]
) {
  return partners.map((partner) => ({
    ...partner,
    ...calculatePartnerTotals(partner.id, contributions, profitShares, cars),
  }))
}

function createProfitShareFromContribution(
  contribution: PartnerContribution,
  car?: Car
): Omit<ProfitShare, 'id'> {
  const carCost = getCarInvestmentBase(car)
  const sellingPrice = car?.sellingPrice ?? carCost
  const netProfit = sellingPrice - carCost

  return {
    partnerId: contribution.partnerId,
    carId: contribution.carId,
    carName: contribution.carName,
    carCost,
    sellingPrice,
    netProfit,
    partnerPercentage: contribution.investmentPercentage,
    partnerProfitShare: (netProfit * contribution.investmentPercentage) / 100,
    status:
      netProfit < 0 ? 'Loss' : car?.status === 'sold' ? 'Paid' : 'Pending',
  }
}

export function Partners() {
  const { t } = useI18n()
  const partnersQuery = usePartnersQuery()
  const contributionsQuery = usePartnerContributionsQuery()
  const profitSharesQuery = useProfitSharesQuery()
  const carsQuery = usePartnerCarsQuery()
  const createPartnerMutation = useCreatePartnerMutation()
  const updatePartnerMutation = useUpdatePartnerMutation()
  const deletePartnerMutation = useDeletePartnerMutation()
  const createContributionMutation = useCreateContributionMutation()
  const deleteContributionMutation = useDeleteContributionMutation()
  const createProfitShareMutation = useCreateProfitShareMutation()
  const [partnerFormOpen, setPartnerFormOpen] = useState(false)
  const [contributionFormOpen, setContributionFormOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null)
  const [contributionToDelete, setContributionToDelete] =
    useState<PartnerContribution | null>(null)

  const partners = partnersQuery.data ?? []
  const contributions = contributionsQuery.data ?? []
  const profitShares = profitSharesQuery.data ?? []
  const cars = carsQuery.data ?? []

  const partnersWithTotals = useMemo(
    () => enrichPartnersWithTotals(partners, contributions, profitShares, cars),
    [cars, contributions, partners, profitShares]
  )

  const currentPartner =
    partnersWithTotals.find(
      (partner) => partner.id === CURRENT_PARTNER_MOCK_ID
    ) ?? null

  useEffect(() => {
    if (partnersQuery.isError) toast.error('Failed to load partners.')
  }, [partnersQuery.isError])

  useEffect(() => {
    if (contributionsQuery.isError) {
      toast.error('Failed to load contributions.')
    }
  }, [contributionsQuery.isError])

  useEffect(() => {
    if (profitSharesQuery.isError) {
      toast.error('Failed to load profit shares.')
    }
  }, [profitSharesQuery.isError])

  const handleAddPartner = () => {
    setEditingPartner(null)
    setPartnerFormOpen(true)
  }

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner)
    setPartnerFormOpen(true)
  }

  const handleSubmitPartner = async (values: PartnerFormValues) => {
    if (editingPartner) {
      await updatePartnerMutation.mutateAsync({
        id: editingPartner.id,
        data: values,
      })
    } else {
      await createPartnerMutation.mutateAsync(values)
    }

    setPartnerFormOpen(false)
    setEditingPartner(null)
  }

  const handleSubmitContribution = async (values: ContributionFormValues) => {
    const car = cars.find((item) => item.id === values.carId)
    const newContribution = await createContributionMutation.mutateAsync({
      ...values,
      investmentPercentage: calculateContributionPercentage(
        car,
        values.contributionAmount
      ),
      carName: car ? formatCarName(car) : values.carId,
    })

    await createProfitShareMutation.mutateAsync(
      createProfitShareFromContribution(newContribution, car)
    )
    setContributionFormOpen(false)
  }

  const handleToggleStatus = async (targetPartner: Partner) => {
    await updatePartnerMutation.mutateAsync({
      id: targetPartner.id,
      data: {
        status: targetPartner.status === 'Active' ? 'Inactive' : 'Active',
      },
    })
  }

  const handleConfirmDeletePartner = async () => {
    if (!partnerToDelete) return

    try {
      await deletePartnerMutation.mutateAsync(partnerToDelete.id)
      setPartnerToDelete(null)
    } catch {
      // The mutation already shows the matching toast.
    }
  }

  const handleConfirmDeleteContribution = async () => {
    if (!contributionToDelete) return

    try {
      await deleteContributionMutation.mutateAsync(contributionToDelete.id)
      setContributionToDelete(null)
    } catch {
      // The mutation already shows the matching toast.
    }
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
          partners={partnersWithTotals}
          currentPartner={currentPartner}
        />

        <PartnersTable
          data={partnersWithTotals}
          isLoading={partnersQuery.isLoading}
          onEdit={handleEditPartner}
          onDelete={setPartnerToDelete}
          onToggleStatus={handleToggleStatus}
        />

        <ContributionsTable
          contributions={contributions}
          isLoading={contributionsQuery.isLoading}
          partners={partnersWithTotals}
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
        partners={partnersWithTotals}
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
        isLoading={deletePartnerMutation.isPending}
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
        isLoading={deleteContributionMutation.isPending}
        handleConfirm={handleConfirmDeleteContribution}
      />
    </>
  )
}
