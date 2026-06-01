import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Search, Plus } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { companiesMockData, type CompanyType } from '@/data/dealerOperationsMockData'
import { getCompanyTypeLabel, useI18n } from '@/lib/i18n'

const companyTypes: Array<'all' | CompanyType> = [
  'all',
  'Auction',
  'Shipping',
  'Repair Shop',
  'Parts Store',
  'DMV/BMV',
  'Inspection Center',
]

export function CompaniesManagement() {
  const { t, locale } = useI18n()
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'all' | CompanyType>('all')
  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase()

    return companiesMockData.filter((company) => {
      const matchesSearch = !query || [company.name, company.phoneNumber, company.address].join(' ').toLowerCase().includes(query)
      const matchesType = type === 'all' || company.type === type
      return matchesSearch && matchesType
    })
  }, [search, type])

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
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>{t('companiesManagement')}</h1>
            <p className='text-muted-foreground'>{t('companiesManagementDesc')}</p>
          </div>
          <Button asChild>
            <Link to='/companies/new'>
              <Plus className='me-2 h-4 w-4' />
              {t('addCompany')}
            </Link>
          </Button>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <SummaryCard label={t('companies')} value={String(companiesMockData.length)} />
          <SummaryCard label={getCompanyTypeLabel('Auction', locale)} value={String(companiesMockData.filter((company) => company.type === 'Auction').length)} />
          <SummaryCard label={getCompanyTypeLabel('Shipping', locale)} value={String(companiesMockData.filter((company) => company.type === 'Shipping').length)} />
          <SummaryCard label={getCompanyTypeLabel('Inspection Center', locale)} value={String(companiesMockData.filter((company) => company.type === 'Inspection Center').length)} />
        </div>

        <Card className='border-border/60'>
          <CardHeader className='space-y-4'>
            <CardTitle>{t('companiesList')}</CardTitle>
            <div className='grid gap-3 md:grid-cols-[1fr_220px]'>
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchCompanies')} />
              <Select value={type} onValueChange={(value) => setType(value as 'all' | CompanyType)}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder={t('filterCompaniesByType')} />
                </SelectTrigger>
                <SelectContent>
                  {companyTypes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item === 'all' ? t('allTypes') : getCompanyTypeLabel(item, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('companyName')}</TableHead>
                    <TableHead>{t('companyType')}</TableHead>
                    <TableHead>{t('phoneNumber')}</TableHead>
                    <TableHead>{t('address')}</TableHead>
                    <TableHead className='text-end'>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length ? (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className='font-medium'>{company.name}</TableCell>
                        <TableCell><Badge variant='outline'>{getCompanyTypeLabel(company.type, locale)}</Badge></TableCell>
                        <TableCell>{company.phoneNumber}</TableCell>
                        <TableCell>{company.address}</TableCell>
                        <TableCell className='text-end'>
                          <Button asChild variant='ghost' size='sm'>
                            <Link to='/companies/$companyId' params={{ companyId: company.id }}>{t('details')}</Link>
                          </Button>
                          <Button asChild variant='ghost' size='sm'>
                            <Link to='/companies/$companyId/edit' params={{ companyId: company.id }}>{t('edit')}</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className='h-24 text-center'>{t('noCompaniesFound')}</TableCell>
                    </TableRow>
                  )}
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
