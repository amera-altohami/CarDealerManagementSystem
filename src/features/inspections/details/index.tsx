import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { getInspectionStatusLabel, useI18n } from '@/lib/i18n'
import {
  useDeleteInspectionMutation,
  useInspectionDeleteCheckQuery,
  useInspectionQuery,
} from '../hooks/use-inspections'

type InspectionDetailsProps = {
  inspectionId: string
}

export function InspectionDetails({ inspectionId }: InspectionDetailsProps) {
  const navigate = useNavigate()
  const { t, locale } = useI18n()
  const inspectionQuery = useInspectionQuery(inspectionId)
  const deleteCheckQuery = useInspectionDeleteCheckQuery(inspectionId)
  const deleteInspectionMutation = useDeleteInspectionMutation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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
          <Card className='border-border/60'>
            <CardHeader className='space-y-2'>
              <Skeleton className='h-8 w-64' />
              <Skeleton className='h-4 w-40' />
            </CardHeader>
            <CardContent className='grid gap-4 md:grid-cols-2'>
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
              <div className='flex items-end justify-end gap-3 md:col-span-2'>
                <Skeleton className='h-9 w-32' />
                <Skeleton className='h-9 w-28' />
                <Skeleton className='h-9 w-28' />
              </div>
            </CardContent>
          </Card>
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

  const deleteCheck = deleteCheckQuery.data
  const canDelete = inspection.status === 'Pending' && Boolean(deleteCheck?.canDelete)
  const deleteBlockedReason =
    inspection.status !== 'Pending'
      ? locale === 'ar'
        ? 'يمكن حذف الفحوصات ذات الحالة قيد الانتظار فقط.'
        : 'Only pending inspections can be deleted.'
      : deleteCheckQuery.isLoading
        ? locale === 'ar'
          ? 'جارٍ التحقق من إمكانية الحذف...'
          : 'Checking whether this inspection can be deleted...'
        : deleteCheck?.canDelete === false
          ? locale === 'ar'
            ? `لا يمكن حذف هذا الفحص لأنه مرتبط بسجلات أخرى (${deleteCheck.references.activityLogs} سجل نشاط، ${deleteCheck.references.notifications} تنبيه).`
            : `This inspection cannot be deleted because it is linked to other records (${deleteCheck.references.activityLogs} activity log(s), ${deleteCheck.references.notifications} notification(s)).`
          : null

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <Card className='border-border/60'>
          <CardHeader className='space-y-2'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <CardTitle className='text-2xl'>{inspection.carName}</CardTitle>
              <Badge variant='outline'>{getInspectionStatusLabel(inspection.status, locale)}</Badge>
            </div>
            <p className='text-muted-foreground'>
              {inspection.date} {t('time')} {inspection.time} - {inspection.placeName}
            </p>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2'>
            <InfoBlock label={t('notes')} value={inspection.notes || '-'} />
            <InfoBlock
              label={t('reminderSent')}
              value={inspection.reminderSent ? t('yes') : t('no')}
            />
            <InfoBlock label={t('files')} value={inspection.files.join(', ') || '-'} />
            <InfoBlock label={t('receipts')} value={inspection.receipts.join(', ') || '-'} />
            <InfoBlock
              label={t('beforeInspectionImages')}
              value={inspection.beforeImages.join(', ') || '-'}
            />
            <InfoBlock
              label={t('afterInspectionImages')}
              value={inspection.afterImages.join(', ') || '-'}
            />
            {deleteBlockedReason ? (
              <div className='rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground md:col-span-2'>
                {deleteBlockedReason}
              </div>
            ) : null}
            <div className='flex flex-wrap items-end justify-end gap-3 md:col-span-2'>
              <Button asChild variant='outline'>
                <Link to='/inspections'>{t('backToInspections')}</Link>
              </Button>
              <Button asChild>
                <Link to='/inspections/$inspectionId/edit' params={{ inspectionId: inspection.id }}>
                  {t('editInspection')}
                </Link>
              </Button>
              <Button
                variant='destructive'
                disabled={!canDelete}
                onClick={() => setDeleteDialogOpen(true)}
              >
                {t('delete')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Main>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('delete')}
        desc={
          canDelete
            ? locale === 'ar'
              ? (
                <span>
                  هل أنت متأكد من حذف <strong>{inspection.carName}</strong>؟
                  <br />
                  هذا الإجراء سيحذف الفحص نهائيًا ولا يمكن التراجع عنه.
                </span>
                )
              : (
                <span>
                  Are you sure you want to delete <strong>{inspection.carName}</strong>?
                  This action will permanently remove the inspection and cannot be undone.
                </span>
                )
            : deleteBlockedReason ?? ''
        }
        destructive
        confirmText={t('delete')}
        cancelBtnText={t('cancel')}
        disabled={!canDelete}
        isLoading={deleteCheckQuery.isLoading || deleteInspectionMutation.isPending}
        handleConfirm={async () => {
          try {
            await deleteInspectionMutation.mutateAsync(inspection.id)
            setDeleteDialogOpen(false)
            navigate({ to: '/inspections' })
          } catch {
            // The mutation hook already surfaces the error through a toast.
          }
        }}
      />
    </>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border bg-muted/20 p-4'>
      <p className='text-xs uppercase tracking-wide text-muted-foreground'>{label}</p>
      <p className='mt-2 font-medium'>{value}</p>
    </div>
  )
}
