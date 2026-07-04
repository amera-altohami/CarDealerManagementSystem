import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { getCompanyTypeLabel, useI18n } from '@/lib/i18n'
import {
  useCompanyQuery,
  useCompanyUsageQuery,
  useDeleteCompanyMutation,
} from '../hooks/use-companies'

type CompanyDetailsProps = {
  companyId: string
}

export function CompanyDetails({ companyId }: CompanyDetailsProps) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const companyQuery = useCompanyQuery(companyId)
  const companyUsageQuery = useCompanyUsageQuery(companyId)
  const deleteCompanyMutation = useDeleteCompanyMutation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  if (companyQuery.isLoading) {
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
              <div className='flex items-end justify-end gap-3 md:col-span-2'>
                <Skeleton className='h-9 w-32' />
                <Skeleton className='h-9 w-28' />
              </div>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  if (companyQuery.isError) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <div className='rounded-lg border p-6 text-center'>
          <h1 className='text-lg font-semibold'>{t('companyNotFound')}</h1>
          <p className='mt-2 text-sm text-destructive'>{getFirestoreErrorMessage(companyQuery.error)}</p>
        </div>
      </Main>
    )
  }

  const company = companyQuery.data
  const companyUsage = companyUsageQuery.data
  const deletionBlocked = (companyUsage?.total ?? 0) > 0

  if (!company) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <div className='rounded-lg border p-6 text-center'>
          <h1 className='text-lg font-semibold'>{t('companyNotFound')}</h1>
          <p className='mt-2 text-sm text-muted-foreground'>{t('companyNotFoundDesc')}</p>
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
              <CardTitle className='text-2xl'>{company.name}</CardTitle>
              <Badge variant='outline'>{getCompanyTypeLabel(company.type, locale)}</Badge>
            </div>
            <p className='text-muted-foreground'>{company.address}</p>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2'>
            <InfoBlock label={t('phoneNumber')} value={company.phoneNumber} />
            <InfoBlock label={t('email')} value={company.email ?? '-'} />
            <InfoBlock label={t('address')} value={company.address} />
            <div className='flex items-end justify-end gap-3 md:col-span-2'>
              <Button asChild variant='outline'>
                <Link to='/companies'>{t('backToCompanies')}</Link>
              </Button>
              <Button variant='destructive' onClick={() => setDeleteDialogOpen(true)}>
                {t('delete')}
              </Button>
              <Button asChild>
                <Link to='/companies/$companyId/edit' params={{ companyId: company.id }}>{t('editCompany')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Main>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false)
          }
        }}
        title={t('delete')}
        desc={
          deletionBlocked ? (
            <span>
              This company cannot be deleted because it has linked records.
            </span>
          ) : (
            <span>
              Are you sure you want to delete <strong>{company.name}</strong>?
              This action cannot be undone.
            </span>
          )
        }
        destructive
        confirmText={t('delete')}
        cancelBtnText={t('cancel')}
        disabled={deletionBlocked}
        isLoading={companyUsageQuery.isLoading || deleteCompanyMutation.isPending}
        handleConfirm={async () => {
          await deleteCompanyMutation.mutateAsync(company.id)
          setDeleteDialogOpen(false)
          navigate({ to: '/companies' })
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
