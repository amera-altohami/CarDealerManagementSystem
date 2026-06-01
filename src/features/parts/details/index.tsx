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
import { useI18n } from '@/lib/i18n'
import { getPartById } from '../components/part-form'

type PartDetailsProps = {
  partId: string
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function PartDetails({ partId }: PartDetailsProps) {
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
        <Card className='border-border/60'>
          <CardHeader className='space-y-2'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <CardTitle className='text-2xl'>{part.partName}</CardTitle>
              <Badge variant='outline'>{part.installed ? t('installed') : t('notInstalled')}</Badge>
            </div>
            <p className='text-muted-foreground'>
              {part.relatedCarName ?? t('standaloneInventory')} • {part.supplierName}
            </p>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2'>
            <InfoBlock label={t('price')} value={money.format(part.price)} />
            <InfoBlock label={t('purchaseDate')} value={part.purchaseDate} />
            <InfoBlock label={t('invoice')} value={part.invoiceName ?? '-'} />
            <div className='flex items-end justify-end gap-3 md:col-span-2'>
              <Button asChild variant='outline'>
                <Link to='/parts'>{t('backToParts')}</Link>
              </Button>
              <Button asChild>
                <Link to='/parts/$partId/edit' params={{ partId: part.id }}>{t('editPart')}</Link>
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
