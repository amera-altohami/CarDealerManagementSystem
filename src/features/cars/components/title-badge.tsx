import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { getTitleTypeLabel, titleTypeColorClasses, type TitleType } from '../types/title'

type TitleBadgeProps = {
  titleType: TitleType
  className?: string
}

export function TitleBadge({ titleType, className }: TitleBadgeProps) {
  const { locale } = useI18n()

  return (
    <Badge
      variant='outline'
      className={cn('capitalize', titleTypeColorClasses[titleType], className)}
    >
      {getTitleTypeLabel(titleType, locale === 'ar' ? 'ar' : 'en')}
    </Badge>
  )
}

