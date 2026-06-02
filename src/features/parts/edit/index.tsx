import { useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { getPartById } from '@/data/dealerOperationsMockData'
import { PartForm } from '../components/part-form'
import { useI18n } from '@/lib/i18n'

type PartEditProps = {
  partId: string
}

export function PartEdit({ partId }: PartEditProps) {
  const navigate = useNavigate()
  const part = getPartById(partId)
  const { t } = useI18n()

  if (!part) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <div className='rounded-lg border p-6 text-center'>
          <h1 className='text-lg font-semibold'>{t('partNotFound')}</h1>
          <p className='mt-2 text-sm text-muted-foreground'>{t('partNotFoundDesc')}</p>
        </div>
      </Main>
    )
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
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>{t('editPart')}</h1>
          <p className='text-muted-foreground'>{t('partsManagementDesc')}</p>
        </div>
        <PartForm
          defaultValues={{
            partName: part.partName,
            price: part.price,
            supplierId: part.supplierId ?? '',
            purchaseDate: part.purchaseDate,
            installed: part.installed ? 'yes' : 'no',
            relatedCarId: part.relatedCarId ?? '',
            invoiceName: part.invoiceName ?? '',
          }}
          submitLabel={t('saveChanges')}
          cancelHref='/parts'
          onSubmit={() => navigate({ to: '/parts' })}
        />
      </Main>
    </>
  )
}
