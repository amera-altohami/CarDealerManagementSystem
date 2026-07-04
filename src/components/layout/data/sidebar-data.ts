import {
  Building2,
  Bell,
  Construction,
  FileText,
  HandCoins,
  HelpCircle,
  History,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react'
import { translate } from '@/lib/i18n'
import { type Locale } from '@/lib/locale'
import { type SidebarData } from '../types'

export function getSidebarData(locale: Locale): SidebarData {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key)

  return {
    user: {
      name: 'Admin',
      email: 'car.d.d.admin@gmail.com',
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      {
        name: t('appName'),
        logo: Construction,
        plan: t('appSubtitle'),
      },
    ],
    navGroups: [
      {
        title: locale === 'ar' ? 'عام' : 'General',
        items: [
          { title: t('dashboard'), url: '/', icon: LayoutDashboard },
          { title: t('cars'), url: '/cars', icon: Construction },
          {
            title: t('partnersInvestments'),
            url: '/partners',
            icon: HandCoins,
          },
          { title: t('expenses'), url: '/expenses', icon: ReceiptText },
          { title: t('reports'), url: '/reports', icon: FileText },
          { title: t('notifications'), url: '/notifications', icon: Bell },
          { title: t('activityLogs'), url: '/activity-logs', icon: History },
          { title: t('parts'), url: '/parts', icon: Package },
          { title: t('inspections'), url: '/inspections', icon: ShieldCheck },
          { title: t('companies'), url: '/companies', icon: Building2 },
          { title: t('users'), url: '/users', icon: Users },
        ],
      },
      {
        title: locale === 'ar' ? 'أخرى' : 'Other',
        items: [
          {
            title: t('settings'),
            icon: UserCog,
            items: [
              { title: t('account'), url: '/settings/account' },
              { title: t('appearance'), url: '/settings/appearance' },
              { title: t('display'), url: '/settings/display' },
              { title: t('notifications'), url: '/settings/notifications' },
            ],
          },
          { title: t('helpCenter'), url: '/help-center', icon: HelpCircle },
        ],
      },
    ],
  }
}
