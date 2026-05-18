import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
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
import { z } from 'zod'
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
  const { locale } = useI18n()
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

  const copy =
    locale === 'ar'
      ? {
          title: 'تعديل الملكية',
          description: 'سيتم حفظ تاريخ التغيير واسم الحساب الحالي تلقائيًا.',
          titleType: 'نوع الملكية',
          notes: 'ملاحظات',
          titleTypeHelp:
            'يمكنك تغيير العنوان إلى Clean أو Salvage أو Rebuilt. التاريخ والاسم يُسجلان تلقائيًا.',
          cancel: 'إلغاء',
          save: 'حفظ',
        }
      : {
          title: 'Edit Title',
          description: 'The current account and today date will be saved automatically.',
          titleType: 'Title Type',
          notes: 'Notes',
          titleTypeHelp:
            'You can change the title to Clean, Salvage, or Rebuilt. Date and user are stored automatically.',
          cancel: 'Cancel',
          save: 'Save Title',
        }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
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
                  <FormLabel>{copy.titleType}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder={copy.titleType} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {titleTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {getTitleTypeLabel(option, locale === 'ar' ? 'ar' : 'en')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className='text-xs text-muted-foreground'>{copy.titleTypeHelp}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{copy.notes}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        locale === 'ar'
                          ? 'أضف ملاحظات حول التغيير...'
                          : 'Add notes about the title change...'
                      }
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
                {copy.cancel}
              </Button>
              <Button type='submit'>{copy.save}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

