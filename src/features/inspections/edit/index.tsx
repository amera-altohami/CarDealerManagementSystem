import { useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { getInspectionById } from '@/data/dealerOperationsMockData'
import { InspectionForm } from '../components/inspection-form'
import { useI18n } from '@/lib/i18n'

type InspectionEditProps = {
  inspectionId: string
}

export function InspectionEdit({ inspectionId }: InspectionEditProps) {
  const navigate = useNavigate()
  const inspection = getInspectionById(inspectionId)
  const { t } = useI18n()

  if (!inspection) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <div className='rounded-lg border p-6 text-center'>
          <h1 className='text-lg font-semibold'>{t('inspectionNotFound')}</h1>
          <p className='mt-2 text-sm text-muted-foreground'>{t('inspectionNotFoundDesc')}</p>
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
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>{t('editInspection')}</h1>
          <p className='text-muted-foreground'>{t('inspectionsManagementDesc')}</p>
        </div>
        <InspectionForm
          defaultValues={{
            carId: inspection.carId,
            date: inspection.date,
            time: inspection.time,
            placeId: inspection.placeId ?? '',
            status: inspection.status,
            notes: inspection.notes,
            files: inspection.files.join(', '),
            receipts: inspection.receipts.join(', '),
            beforeImages: inspection.beforeImages.join(', '),
            afterImages: inspection.afterImages.join(', '),
            reminderSent: inspection.reminderSent ? 'yes' : 'no',
          }}
          submitLabel={t('saveChanges')}
          cancelHref='/inspections'
          onSubmit={() => navigate({ to: '/inspections' })}
        />
      </Main>
    </>
  )
}
