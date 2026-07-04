import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, ChevronRight, Laptop, Moon, Sun } from 'lucide-react'
import { useSearch } from '@/context/search-provider'
import { useDirection } from '@/context/direction-provider'
import { useTheme } from '@/context/theme-provider'
import { useI18n } from '@/lib/i18n'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { getSidebarData } from './layout/data/sidebar-data'
import { ScrollArea } from './ui/scroll-area'

export function CommandMenu() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()
  const { locale } = useDirection()
  const { t } = useI18n()
  const sidebarData = getSidebarData(locale)

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={locale === 'ar' ? 'اكتب أمرًا أو ابحث...' : 'Type a command or search...'} />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pe-1'>
          <CommandEmpty>
            {locale === 'ar' ? 'لا توجد نتائج.' : 'No results found.'}
          </CommandEmpty>
          {sidebarData.navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem, i) => {
                if (navItem.url)
                  return (
                    <CommandItem
                      key={`${navItem.url}-${i}`}
                      value={navItem.title}
                      onClick={() => {
                        runCommand(() => navigate({ to: navItem.url }))
                      }}
                      onSelect={() => {
                        runCommand(() => navigate({ to: navItem.url }))
                      }}
                    >
                      <div className='flex size-4 items-center justify-center'>
                        <ArrowRight className='size-2 text-muted-foreground/80' />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  )

                return navItem.items?.map((subItem, i) => (
                  <CommandItem
                    key={`${navItem.title}-${subItem.url}-${i}`}
                    value={`${navItem.title} ${subItem.title}`}
                    onClick={() => {
                      runCommand(() => navigate({ to: subItem.url }))
                    }}
                    onSelect={() => {
                      runCommand(() => navigate({ to: subItem.url }))
                    }}
                  >
                    <div className='flex size-4 items-center justify-center'>
                      <ArrowRight className='size-2 text-muted-foreground/80' />
                    </div>
                    {navItem.title} <ChevronRight /> {subItem.title}
                  </CommandItem>
                ))
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading={t('theme')}>
            <CommandItem
              onClick={() => runCommand(() => setTheme('light'))}
              onSelect={() => runCommand(() => setTheme('light'))}
            >
              <Sun /> <span>{locale === 'ar' ? 'فاتح' : 'Light'}</span>
            </CommandItem>
            <CommandItem
              onClick={() => runCommand(() => setTheme('dark'))}
              onSelect={() => runCommand(() => setTheme('dark'))}
            >
              <Moon className='scale-90' />
              <span>{locale === 'ar' ? 'داكن' : 'Dark'}</span>
            </CommandItem>
            <CommandItem
              onClick={() => runCommand(() => setTheme('system'))}
              onSelect={() => runCommand(() => setTheme('system'))}
            >
              <Laptop />
              <span>{locale === 'ar' ? 'النظام' : 'System'}</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
