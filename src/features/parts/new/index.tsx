import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { toast } from 'sonner'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { useI18n } from '@/lib/i18n'
import { PartForm } from '../components/part-form'
import { partsQueryKey } from '../hooks/use-parts'
import { createPart, PartValidationError, type CreatePartData } from '@/services/partsService'

export function PartCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  const buildCreatePayload = (
    values: {
      partName: string
      price: number
      supplierId: string
      purchaseDate: string
      installed: 'yes' | 'no'
      relatedCarId?: string
      invoiceName?: string
      notes?: string
    },
    item: { partName: string; price: number }
  ): CreatePartData => ({
    partName: item.partName,
    price: item.price,
    supplierId: values.supplierId,
    purchaseDate: values.purchaseDate,
    installed: values.installed === 'yes',
    relatedCarId: values.relatedCarId || null,
    invoiceName: values.invoiceName || null,
    notes: values.notes || null,
  })

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('addPart')}
          </h1>
          <p className='text-muted-foreground'>{t('partsManagementDesc')}</p>
        </div>
        <PartForm
          submitLabel={t('createPart')}
          cancelHref='/parts'
          allowMultipleParts
          onSubmit={async (values) => {
            const items = [
              { partName: values.partName, price: values.price },
              ...values.additionalParts,
            ]

            try {
              if (items.length === 1) {
                const created = await createPart(
                  buildCreatePayload(values, items[0])
                )
                await queryClient.invalidateQueries({
                  queryKey: partsQueryKey,
                })
                toast.success('Part added successfully.')
                navigate({ to: '/parts/$partId', params: { partId: created.id } })
                return
              }

              const createdParts = []
              for (const item of items) {
                const created = await createPart(buildCreatePayload(values, item))
                createdParts.push(created)
              }

              await queryClient.invalidateQueries({
                queryKey: partsQueryKey,
              })
              toast.success(
                `${createdParts.length} parts added successfully from the same receipt.`
              )
              navigate({ to: '/parts' })
            } catch (error) {
              if (error instanceof PartValidationError) {
                toast.error(error.issues[0] ?? 'Part data is invalid.')
                return
              }

              toast.error(getFirestoreErrorMessage(error))
            }
          }}
        />
      </Main>
    </>
  )
}
