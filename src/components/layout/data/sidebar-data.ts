import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  FileText,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  HandCoins,
  Building2,
  ReceiptText,
} from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { translate } from '@/lib/i18n'
import { type Locale } from '@/lib/locale'
import { type SidebarData } from '../types'

export function getSidebarData(locale: Locale): SidebarData {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key)

  return {
    user: {
      name: 'satnaing',
      email: 'satnaingdev@gmail.com',
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      {
        name: t('appName'),
        logo: Command,
        plan: t('appSubtitle'),
      },
      {
        name: 'Acme Inc',
        logo: GalleryVerticalEnd,
        plan: 'Enterprise',
      },
      {
        name: 'Acme Corp.',
        logo: AudioWaveform,
        plan: 'Startup',
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
          { title: t('parts'), url: '/parts', icon: Package },
          { title: t('inspections'), url: '/inspections', icon: ShieldCheck },
          { title: t('companies'), url: '/companies', icon: Building2 },
          { title: t('tasks'), url: '/tasks', icon: ListTodo },
          { title: t('apps'), url: '/apps', icon: Package },
          {
            title: t('chats'),
            url: '/chats',
            badge: '3',
            icon: MessagesSquare,
          },
          { title: t('users'), url: '/users', icon: Users },
          {
            title: locale === 'ar' ? 'محمي بواسطة Clerk' : 'Secured by Clerk',
            icon: ClerkLogo,
            items: [
              {
                title: locale === 'ar' ? 'تسجيل الدخول' : 'Sign In',
                url: '/clerk/sign-in',
              },
              {
                title: locale === 'ar' ? 'إنشاء حساب' : 'Sign Up',
                url: '/clerk/sign-up',
              },
              {
                title: locale === 'ar' ? 'إدارة المستخدمين' : 'User Management',
                url: '/clerk/user-management',
              },
            ],
          },
        ],
      },
      {
        title: locale === 'ar' ? 'الصفحات' : 'Pages',
        items: [
          {
            title: locale === 'ar' ? 'المصادقة' : 'Auth',
            icon: ShieldCheck,
            items: [
              {
                title: locale === 'ar' ? 'تسجيل الدخول' : 'Sign In',
                url: '/sign-in',
              },
              {
                title:
                  locale === 'ar' ? 'تسجيل الدخول (عمودان)' : 'Sign In (2 Col)',
                url: '/sign-in-2',
              },
              {
                title: locale === 'ar' ? 'إنشاء حساب' : 'Sign Up',
                url: '/sign-up',
              },
              {
                title:
                  locale === 'ar' ? 'استعادة كلمة المرور' : 'Forgot Password',
                url: '/forgot-password',
              },
              { title: 'OTP', url: '/otp' },
            ],
          },
          {
            title: locale === 'ar' ? 'الأخطاء' : 'Errors',
            icon: Bug,
            items: [
              {
                title: locale === 'ar' ? 'غير مصرح' : 'Unauthorized',
                url: '/errors/unauthorized',
                icon: Lock,
              },
              {
                title: locale === 'ar' ? 'ممنوع' : 'Forbidden',
                url: '/errors/forbidden',
                icon: UserX,
              },
              {
                title: locale === 'ar' ? 'غير موجود' : 'Not Found',
                url: '/errors/not-found',
                icon: FileX,
              },
              {
                title: locale === 'ar' ? 'خطأ داخلي' : 'Internal Server Error',
                url: '/errors/internal-server-error',
                icon: ServerOff,
              },
              {
                title: locale === 'ar' ? 'الصيانة' : 'Maintenance Error',
                url: '/errors/maintenance-error',
                icon: Construction,
              },
            ],
          },
        ],
      },
      {
        title: locale === 'ar' ? 'أخرى' : 'Other',
        items: [
          {
            title: t('settings'),
            icon: Settings,
            items: [
              { title: t('profile'), url: '/settings', icon: UserCog },
              { title: t('account'), url: '/settings/account', icon: Wrench },
              {
                title: t('appearance'),
                url: '/settings/appearance',
                icon: Palette,
              },
              {
                title: t('notifications'),
                url: '/settings/notifications',
                icon: Bell,
              },
              { title: t('display'), url: '/settings/display', icon: Monitor },
            ],
          },
          { title: t('helpCenter'), url: '/help-center', icon: HelpCircle },
        ],
      },
    ],
  }
}
