import { useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { useI18n } from '@/lib/i18n'
import { InspectionForm } from '../components/inspection-form'
import {
  useInspectionQuery,
  useUpdateInspectionMutation,
} from '../hooks/use-inspections'

type InspectionEditProps = {
  inspectionId: string
}

export function InspectionEdit({ inspectionId }: InspectionEditProps) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const inspectionQuery = useInspectionQuery(inspectionId)
  const updateInspectionMutation = useUpdateInspectionMutation()

  if (inspectionQuery.isLoading) {
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
            <Skeleton className='h-8 w-56' />
            <Skeleton className='h-4 w-80' />
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <Skeleton className='h-24 w-full' />
            <Skeleton className='h-24 w-full' />
            <Skeleton className='h-24 w-full' />
            <Skeleton className='h-24 w-full' />
          </div>
        </Main>
      </>
    )
  }

  if (inspectionQuery.isError) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <div className='rounded-lg border p-6 text-center'>
          <h1 className='text-lg font-semibold'>{t('inspectionNotFound')}</h1>
          <p className='mt-2 text-sm text-destructive'>
            {getFirestoreErrorMessage(inspectionQuery.error)}
          </p>
        </div>
      </Main>
    )
  }

  const inspection = inspectionQuery.data

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
            placeId: inspection.placeId,
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
          isSubmitting={updateInspectionMutation.isPending}
          onSubmit={async (values) => {
            await updateInspectionMutation.mutateAsync({
              id: inspection.id,
              data: {
                carId: values.carId,
                placeId: values.placeId,
                date: values.date,
                time: values.time,
                status: values.status,
                notes: values.notes,
                files: values.files,
                receipts: values.receipts,
                beforeImages: values.beforeImages,
                afterImages: values.afterImages,
                reminderSent: values.reminderSent,
              },
            })

            navigate({ to: '/inspections' })
          }}
        />
      </Main>
    </>
  )
}
