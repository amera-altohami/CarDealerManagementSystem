import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { type CurrentTitle } from '../types/title'
import { TitleBadge } from './title-badge'

type TitleManagementCardProps = {
  currentTitle: CurrentTitle
  onEditTitle: () => void
  onAddNotes: () => void
  onConvertToRebuilt?: () => void
  canConvertToRebuilt?: boolean
}

export function TitleManagementCard({
  currentTitle,
  onEditTitle,
  onAddNotes,
  onConvertToRebuilt,
  canConvertToRebuilt = false,
}: TitleManagementCardProps) {
  const { t } = useI18n()

  return (
    <Card className='border-border/60'>
      <CardHeader className='space-y-2'>
        <CardTitle>{t('titleManagement')}</CardTitle>
        <p className='text-sm text-muted-foreground'>
          {t('currentTitleInformation')}
        </p>
      </CardHeader>
      <CardContent className='space-y-5'>
        <div className='grid gap-4 sm:grid-cols-3'>
          <InfoBlock
            label={t('currentTitleType')}
            value={<TitleBadge titleType={currentTitle.type} />}
          />
          <InfoBlock label={t('lastUpdatedDate')} value={currentTitle.lastUpdatedAt} />
          <InfoBlock label={t('updatedBy')} value={currentTitle.updatedBy} />
        </div>

        {currentTitle.type === 'Salvage' ? (
          <div className='rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300'>
            {t('salvageTitleHint')}
          </div>
        ) : null}

        <div className='flex flex-wrap gap-3'>
          <Button onClick={onEditTitle}>{t('editTitle')}</Button>
          <Button variant='secondary' onClick={onAddNotes}>
            {t('addNotes')}
          </Button>
          {currentTitle.type === 'Salvage' && canConvertToRebuilt && onConvertToRebuilt ? (
            <Button variant='outline' onClick={onConvertToRebuilt}>
              {t('changeToRebuiltTitle')}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function InfoBlock({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className='rounded-lg border bg-muted/20 p-4'>
      <p className='text-xs uppercase tracking-wide text-muted-foreground'>
        {label}
      </p>
      <div className='mt-2 text-sm font-medium'>{value}</div>
    </div>
  )
}
