import { useState } from 'react'
import { carsMockData, formatCarName } from '@/data/carsMockData'
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
import { ContributionForm } from './components/contribution-form'
import { ContributionsTable } from './components/contributions-table'
import { PartnerForm } from './components/partner-form'
import { PartnerSummaryCards } from './components/partner-summary-cards'
import { PartnersTable } from './components/partners-table'
import {
  calculateContributionPercentage,
  calculatePartnerTotals,
  createProfitShareFromContribution,
  partnerContributionsMock,
  partnersMockData,
  profitSharesMock,
} from './data/partnersMockData'
import {
  type ContributionFormValues,
  type Partner,
  type PartnerContribution,
  type PartnerFormValues,
  type ProfitShare,
} from './data/schema'

const CURRENT_PARTNER_MOCK_ID = 'partner-001'

export function Partners() {
  const { t } = useI18n()
  const [partners, setPartners] = useState<Partner[]>(partnersMockData)
  const [contributions, setContributions] = useState<PartnerContribution[]>(
    partnerContributionsMock
  )
  const [profitShares, setProfitShares] =
    useState<ProfitShare[]>(profitSharesMock)
  const [partnerFormOpen, setPartnerFormOpen] = useState(false)
  const [contributionFormOpen, setContributionFormOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null)
  const [contributionToDelete, setContributionToDelete] =
    useState<PartnerContribution | null>(null)
  const currentPartner =
    partners.find((partner) => partner.id === CURRENT_PARTNER_MOCK_ID) ?? null

  const recalculatePartners = (
    nextPartners: Partner[],
    nextContributions: PartnerContribution[],
    nextProfitShares: ProfitShare[]
  ) =>
    nextPartners.map((partner) => ({
      ...partner,
      ...calculatePartnerTotals(
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
    const car = carsMockData.find((item) => item.id === values.carId)
    const newContribution: PartnerContribution = {
      id: `contribution-${Date.now()}`,
      ...values,
      investmentPercentage: calculateContributionPercentage(
        values.carId,
        values.contributionAmount
      ),
      carName: car ? formatCarName(car) : values.carId,
    }
    const newProfitShare = createProfitShareFromContribution(newContribution)
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
        cars={carsMockData}
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
