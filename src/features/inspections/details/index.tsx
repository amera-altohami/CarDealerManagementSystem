import { Link } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n, getInspectionStatusLabel } from '@/lib/i18n'
import { getInspectionById } from '@/data/dealerOperationsMockData'

type InspectionDetailsProps = {
  inspectionId: string
}

export function InspectionDetails({ inspectionId }: InspectionDetailsProps) {
  const inspection = getInspectionById(inspectionId)
  const { t, locale } = useI18n()

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
        <Card className='border-border/60'>
          <CardHeader className='space-y-2'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <CardTitle className='text-2xl'>{inspection.carName}</CardTitle>
              <Badge variant='outline'>{getInspectionStatusLabel(inspection.status, locale)}</Badge>
            </div>
            <p className='text-muted-foreground'>
              {inspection.date} {t('time')} {inspection.time} • {inspection.place}
            </p>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2'>
            <InfoBlock label={t('notes')} value={inspection.notes || '-'} />
            <InfoBlock label={t('reminderSent')} value={inspection.reminderSent ? t('yes') : t('no')} />
            <InfoBlock label={t('files')} value={inspection.files.join(', ') || '-'} />
            <InfoBlock label={t('receipts')} value={inspection.receipts.join(', ') || '-'} />
            <InfoBlock label={t('beforeInspectionImages')} value={inspection.beforeImages.join(', ') || '-'} />
            <InfoBlock label={t('afterInspectionImages')} value={inspection.afterImages.join(', ') || '-'} />
            <div className='flex items-end justify-end gap-3 md:col-span-2'>
              <Button asChild variant='outline'>
                <Link to='/inspections'>{t('backToInspections')}</Link>
              </Button>
              <Button asChild>
                <Link to='/inspections/$inspectionId/edit' params={{ inspectionId: inspection.id }}>{t('editInspection')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Main>
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
