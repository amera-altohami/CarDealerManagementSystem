import { useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { useCompanyQuery, useUpdateCompanyMutation } from '../hooks/use-companies'
import { CompanyForm } from '../components/company-form'
import { useI18n } from '@/lib/i18n'

type CompanyEditProps = {
  companyId: string
}

export function CompanyEdit({ companyId }: CompanyEditProps) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const companyQuery = useCompanyQuery(companyId)
  const updateCompanyMutation = useUpdateCompanyMutation()

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
          <div className='space-y-1'>
            <Skeleton className='h-8 w-56' />
            <Skeleton className='h-4 w-72' />
          </div>
          <Skeleton className='h-96 w-full rounded-lg' />
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
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>{t('editCompany')}</h1>
          <p className='text-muted-foreground'>{t('companiesManagementDesc')}</p>
        </div>
        <CompanyForm
          defaultValues={{
            name: company.name,
            type: company.type,
            phoneNumber: company.phoneNumber,
            address: company.address,
            email: company.email ?? '',
            notes: company.notes ?? '',
          }}
          submitLabel={t('saveChanges')}
          cancelHref='/companies'
          onSubmit={async (values) => {
            await updateCompanyMutation.mutateAsync({
              id: companyId,
              data: values,
            })
            navigate({ to: '/companies' })
          }}
        />
      </Main>
    </>
  )
}
