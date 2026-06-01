import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/lib/i18n'
import {
  getTitleTypeLabel,
  titleTypeOptions,
  type CurrentTitle,
  type TitleUpdateValues,
} from '../types/title'

const titleUpdateSchema = z.object({
  titleType: z.enum(['Clean', 'Salvage', 'Rebuilt']),
  notes: z.string().optional().default(''),
})

type EditTitleModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTitle: CurrentTitle
  onSave: (values: TitleUpdateValues) => void
}

export function EditTitleModal({
  open,
  onOpenChange,
  currentTitle,
  onSave,
}: EditTitleModalProps) {
  const { locale, t } = useI18n()
  const form = useForm<TitleUpdateValues>({
    resolver: zodResolver(titleUpdateSchema) as Resolver<TitleUpdateValues>,
    defaultValues: {
      titleType: currentTitle.type,
      notes: '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      titleType: currentTitle.type,
      notes: '',
    })
  }, [currentTitle.type, form, open])

  const supportedLocale = locale === 'ar' ? 'ar' : 'en'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('editTitle')}</DialogTitle>
          <DialogDescription>{t('editTitleDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className='space-y-4'
            onSubmit={form.handleSubmit((values) => {
              onSave(values)
            })}
          >
            <FormField
              control={form.control}
              name='titleType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('titleType')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder={t('titleType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {titleTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {getTitleTypeLabel(option, supportedLocale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className='text-xs text-muted-foreground'>{t('editTitleHelp')}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('notes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('titleNotesPlaceholder')}
                      className='min-h-24 resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                {t('cancel')}
              </Button>
              <Button type='submit'>{t('saveTitle')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
