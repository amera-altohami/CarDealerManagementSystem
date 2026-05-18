import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { type CurrentTitle } from '../types/title'
import { TitleBadge } from './title-badge'

type TitleManagementCardProps = {
  currentTitle: CurrentTitle
  onEditTitle: () => void
  onUpdateTitleStatus: () => void
  onAddNotes: () => void
}

export function TitleManagementCard({
  currentTitle,
  onEditTitle,
  onUpdateTitleStatus,
  onAddNotes,
}: TitleManagementCardProps) {
  const { locale } = useI18n()
  const copy =
    locale === 'ar'
      ? {
          title: 'إدارة الملكية',
          current: 'معلومات الملكية الحالية',
          currentType: 'نوع الملكية الحالي',
          lastUpdated: 'آخر تحديث',
          updatedBy: 'تم التحديث بواسطة',
          editTitle: 'تعديل الملكية',
          updateStatus: 'تحديث حالة الملكية',
          addNotes: 'إضافة ملاحظات',
          salvageHint: 'يمكن ترقية Salvage إلى Rebuilt بعد اكتمال الإصلاح والفحص.',
        }
      : {
          title: 'Title Management',
          current: 'Current Title Information',
          currentType: 'Current Title Type',
          lastUpdated: 'Last Updated Date',
          updatedBy: 'Updated By',
          editTitle: 'Edit Title',
          updateStatus: 'Update Title Status',
          addNotes: 'Add Notes',
          salvageHint: 'Salvage titles can be upgraded to Rebuilt after repairs and inspection.',
        }

  return (
    <Card className='border-border/60'>
      <CardHeader className='space-y-2'>
        <CardTitle>{copy.title}</CardTitle>
        <p className='text-sm text-muted-foreground'>{copy.current}</p>
      </CardHeader>
      <CardContent className='space-y-5'>
        <div className='grid gap-4 sm:grid-cols-3'>
          <InfoBlock label={copy.currentType} value={<TitleBadge titleType={currentTitle.type} />} />
          <InfoBlock label={copy.lastUpdated} value={currentTitle.lastUpdatedAt} />
          <InfoBlock label={copy.updatedBy} value={currentTitle.updatedBy} />
        </div>

        {currentTitle.type === 'Salvage' ? (
          <div className='rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300'>
            {copy.salvageHint}
          </div>
        ) : null}

        <div className='flex flex-wrap gap-3'>
          <Button onClick={onEditTitle}>{copy.editTitle}</Button>
          <Button variant='outline' onClick={onUpdateTitleStatus}>
            {copy.updateStatus}
          </Button>
          <Button variant='secondary' onClick={onAddNotes}>
            {copy.addNotes}
          </Button>
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

