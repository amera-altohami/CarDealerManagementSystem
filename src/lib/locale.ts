export type Locale = 'en' | 'ar'

export function getLocaleFromDir(dir: 'ltr' | 'rtl'): Locale {
  return dir === 'rtl' ? 'ar' : 'en'
}
