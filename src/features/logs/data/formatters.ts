import type { Locale } from '@/lib/locale'

export function formatActivityLogDate(value: string, locale: Locale) {
  if (!value) return '-'

  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-LY' : 'en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
