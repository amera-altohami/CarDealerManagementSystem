import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
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
import { ContributionsTable } from './components/contributions-table'
import { PartnerForm } from './components/partner-form'
import { PartnerSummaryCards } from './components/partner-summary-cards'
import { PartnersTable } from './components/partners-table'
import {
  type Partner,
  type PartnerContribution,
  type PartnerFormValues,
} from './data/schema'
import {
  useCreatePartnerMutation,
  useDeletePartnerMutation,
  usePartnerCarsQuery,
  usePartnersQuery,
  useUpdatePartnerMutation,
} from './hooks/use-partners'
import {
  buildEqualSplitRows,
  calculateEqualSplitPartnerTotals,
} from './lib/equal-split'

const CURRENT_PARTNER_MOCK_ID = 'partner-001'

export function Partners() {
  const { t } = useI18n()
  const partnersQuery = usePartnersQuery()
  const carsQuery = usePartnerCarsQuery()
  const createPartnerMutation = useCreatePartnerMutation()
  const updatePartnerMutation = useUpdatePartnerMutation()
  const deletePartnerMutation = useDeletePartnerMutation()
  const [partnerFormOpen, setPartnerFormOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null)

  const partners = partnersQuery.data ?? []
  const cars = carsQuery.data ?? []
  const partnersWithTotals = useMemo(
    () =>
      partners.map((partner) => ({
        ...partner,
        ...calculateEqualSplitPartnerTotals(partners, cars),
      })),
    [cars, partners]
  )
  const currentPartner =
    partnersWithTotals.find(
      (partner) => partner.id === CURRENT_PARTNER_MOCK_ID
    ) ?? null
  const derivedRows = useMemo(
    () => buildEqualSplitRows(partners, cars),
    [cars, partners]
  )
  const contributions = useMemo<PartnerContribution[]>(
    () =>
      derivedRows.map((row, index) => ({
        id: `${row.carId}-${row.partnerId}-${index}`,
        partnerId: row.partnerId,
        carId: row.carId,
        carName: row.carName,
        contributionAmount: row.contributionAmount,
        investmentPercentage: row.investmentPercentage,
        contributionDate: new Date().toISOString().slice(0, 10),
        paymentMethod: 'Cash',
        notes: '',
      })),
    [derivedRows]
  )

  useEffect(() => {
    if (partnersQuery.isError) toast.error('Failed to load partners.')
  }, [partnersQuery.isError])

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
          <Button onClick={handleAddPartner}>
            <Plus className='h-4 w-4' />
            {t('addPartner')}
          </Button>
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
          isLoading={carsQuery.isLoading}
          partners={partnersWithTotals}
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
    </>
  )
}
