export type TitleType = 'Clean' | 'Salvage' | 'Rebuilt'

export type CurrentTitle = {
  type: TitleType
  lastUpdatedAt: string
  updatedBy: string
}

export type TitleHistoryEntry = {
  id: string
  previousTitleType: TitleType
  newTitleType: TitleType
  changeDate: string
  updatedBy: string
  notes?: string
}

export type TitleUpdateValues = {
  titleType: TitleType
  notes: string
}

export const titleTypeOptions: TitleType[] = ['Clean', 'Salvage', 'Rebuilt']

export const titleTypeColorClasses: Record<TitleType, string> = {
  Clean:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Salvage:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Rebuilt:
    'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
}

export const titleTypeLabels = {
  en: {
    Clean: 'Clean',
    Salvage: 'Salvage',
    Rebuilt: 'Rebuilt',
  },
  ar: {
    Clean: 'نظيف',
    Salvage: 'خلاص/إنقاذ',
    Rebuilt: 'معاد بناؤه',
  },
} as const

export type SupportedLocale = keyof typeof titleTypeLabels

export function getTitleTypeLabel(type: TitleType, locale: SupportedLocale) {
  return titleTypeLabels[locale][type]
}
