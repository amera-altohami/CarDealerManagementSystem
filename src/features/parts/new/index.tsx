import { useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useI18n } from '@/lib/i18n'
import { PartForm } from '../components/part-form'
import { useCreatePartMutation } from '../hooks/use-parts'

export function PartCreate() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const createPartMutation = useCreatePartMutation()

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
          onSubmit={async (values) => {
            const created = await createPartMutation.mutateAsync({
              partName: values.partName,
              price: values.price,
              supplierId: values.supplierId,
              purchaseDate: values.purchaseDate,
              installed: values.installed === 'yes',
              relatedCarId: values.relatedCarId || null,
              invoiceName: values.invoiceName || null,
              notes: values.notes || null,
            })

            navigate({ to: '/parts/$partId', params: { partId: created.id } })
          }}
        />
      </Main>
    </>
  )
}
