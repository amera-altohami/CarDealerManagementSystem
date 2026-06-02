import { Link } from '@tanstack/react-router'
import {
  BarChart3,
  CarFront,
  FileText,
  HandCoins,
  ReceiptText,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function Reports() {
  const { t } = useI18n()
  const reportCards = [
    {
      title: t('carReport'),
      description: t('carReportDesc'),
      icon: CarFront,
      to: '/reports/car',
    },
    {
      title: t('profitReport'),
      description: t('profitReportDesc'),
      icon: BarChart3,
      to: '/reports/profit',
    },
    {
      title: t('expensesReport'),
      description: t('expensesReportDesc'),
      icon: ReceiptText,
      to: '/reports/expenses',
    },
    {
      title: t('partnerReport'),
      description: t('partnerReportDesc'),
      icon: HandCoins,
      to: '/reports/partner',
    },
  ] as const

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
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
              {t('reports')}
            </h1>
            <p className='text-muted-foreground'>{t('reportsDesc')}</p>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {reportCards.map((report) => {
            const Icon = report.icon

            return (
              <Card key={report.title} className='border-border/60'>
                <CardHeader className='space-y-3'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-md bg-muted text-muted-foreground'>
                    <Icon className='h-5 w-5' />
                  </div>
                  <CardTitle>{report.title}</CardTitle>
                </CardHeader>
                <CardContent className='flex min-h-40 flex-col justify-between gap-5'>
                  <p className='text-sm text-muted-foreground'>
                    {report.description}
                  </p>
                  <Button asChild className='w-full'>
                    <Link to={report.to}>
                      <FileText className='h-4 w-4' />
                      {t('viewReport')}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Main>
    </>
  )
}
