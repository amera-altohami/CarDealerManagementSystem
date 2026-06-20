import { Link } from '@tanstack/react-router'
import { Plus, Bell } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { getInspectionStatusLabel, useI18n } from '@/lib/i18n'
import { useInspectionsQuery } from './hooks/use-inspections'

export function InspectionManagement() {
  const { t, locale } = useI18n()
  const inspectionsQuery = useInspectionsQuery()
  const inspections = inspectionsQuery.data ?? []

  if (inspectionsQuery.isError) {
    return (
      <>
        <Header fixed>
          <Search className='me-auto' />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </Header>
        <Main className='flex flex-1 items-center justify-center'>
          <div className='rounded-lg border p-6 text-center'>
            <h1 className='text-lg font-semibold'>{t('inspectionsManagement')}</h1>
            <p className='mt-2 text-sm text-destructive'>
              {getFirestoreErrorMessage(inspectionsQuery.error)}
            </p>
          </div>
        </Main>
      </>
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
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>{t('inspectionsManagement')}</h1>
            <p className='text-muted-foreground'>{t('inspectionsManagementDesc')}</p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button variant='outline'>
              <Bell className='me-2 h-4 w-4' />
              {t('sendReminder')}
            </Button>
            <Button asChild>
              <Link to='/inspections/new'>
                <Plus className='me-2 h-4 w-4' />
                {t('addInspection')}
              </Link>
            </Button>
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <SummaryCard label={t('upcomingInspections')} value={String(inspections.length)} />
          <SummaryCard label={t('pending')} value={String(inspections.filter((inspection) => inspection.status === 'Pending').length)} />
          <SummaryCard label={t('passed')} value={String(inspections.filter((inspection) => inspection.status === 'Passed').length)} />
          <SummaryCard label={t('failed')} value={String(inspections.filter((inspection) => inspection.status === 'Failed').length)} />
        </div>

        <Card className='border-border/60'>
          <CardHeader>
            <CardTitle>{t('upcomingInspections')}</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {inspections.map((inspection) => (
              <div key={inspection.id} className='rounded-lg border p-4'>
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <p className='font-medium'>{inspection.carName}</p>
                    <p className='text-sm text-muted-foreground'>{inspection.date} {t('time')} {inspection.time}</p>
                  </div>
                  <Badge variant='outline' className={inspection.status === 'Passed' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : inspection.status === 'Failed' ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'}>
                    {getInspectionStatusLabel(inspection.status, locale)}
                  </Badge>
                </div>
                <p className='mt-2 text-sm text-muted-foreground'>{inspection.placeName}</p>
                <div className='mt-4 flex flex-wrap gap-2'>
                  <Button asChild variant='outline' size='sm'>
                    <Link to='/inspections/$inspectionId' params={{ inspectionId: inspection.id }}>{t('details')}</Link>
                  </Button>
                  <Button asChild size='sm'>
                    <Link to='/inspections/$inspectionId/edit' params={{ inspectionId: inspection.id }}>{t('edit')}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className='border-border/60'>
          <CardHeader>
            <CardTitle>{t('appointmentsTable')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('car')}</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('time')}</TableHead>
                    <TableHead>{t('place')}</TableHead>
                    <TableHead>{t('inspectionStatus')}</TableHead>
                    <TableHead>{t('documents')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspections.map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell className='font-medium'>{inspection.carName}</TableCell>
                      <TableCell>{inspection.date}</TableCell>
                      <TableCell>{inspection.time}</TableCell>
                      <TableCell>{inspection.placeName}</TableCell>
                      <TableCell>
                        <Badge variant='outline' className={inspection.status === 'Passed' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : inspection.status === 'Failed' ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'}>
                          {getInspectionStatusLabel(inspection.status, locale)}
                        </Badge>
                      </TableCell>
                      <TableCell>{inspection.files.length + inspection.receipts.length + inspection.beforeImages.length + inspection.afterImages.length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className='border-border/60'>
      <CardContent className='p-4'>
        <p className='text-sm text-muted-foreground'>{label}</p>
        <p className='mt-2 text-2xl font-bold tracking-tight'>{value}</p>
      </CardContent>
    </Card>
  )
}
