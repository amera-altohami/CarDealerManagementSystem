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
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/lib/i18n'
import {
  getTitleTypeLabel,
  titleTypeOptions,
  type CurrentTitle,
  type TitleUpdateValues,
} from '../types/title'
import { z } from 'zod'

const titleUpdateSchema = z.object({
  titleType: z.enum(['Clean', 'Salvage', 'Rebuilt']),
  notes: z.string().optional().default(''),
  updatedBy: z.string().min(2, 'Updated by is required.'),
  changeDate: z.string().min(1, 'Change date is required.'),
})

type EditTitleModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTitle: CurrentTitle
  onSave: (values: TitleUpdateValues) => void
  mode: 'edit' | 'status' | 'notes'
}

export function EditTitleModal({
  open,
  onOpenChange,
  currentTitle,
  onSave,
  mode,
}: EditTitleModalProps) {
  const { locale } = useI18n()
  const form = useForm<TitleUpdateValues>({
    resolver: zodResolver(titleUpdateSchema) as Resolver<TitleUpdateValues>,
    defaultValues: {
      titleType: currentTitle.type,
      notes: '',
      updatedBy: currentTitle.updatedBy,
      changeDate: currentTitle.lastUpdatedAt,
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      titleType: currentTitle.type,
      notes: '',
      updatedBy: currentTitle.updatedBy,
      changeDate: currentTitle.lastUpdatedAt,
    })
  }, [currentTitle.lastUpdatedAt, currentTitle.type, currentTitle.updatedBy, form, open])

  const copy =
    locale === 'ar'
      ? {
          title:
            mode === 'status'
              ? 'تحديث حالة الملكية'
              : mode === 'notes'
                ? 'إضافة ملاحظات الملكية'
                : 'تعديل الملكية',
          description:
            currentTitle.type === 'Salvage'
              ? 'يمكن ترقية Salvage إلى Rebuilt بعد اكتمال الإصلاح والفحص.'
              : 'حدّث نوع الملكية وسجل التغيير ضمن تاريخ السيارة.',
          titleType: 'نوع الملكية',
          notes: 'ملاحظات',
          updatedBy: 'تم التحديث بواسطة',
          changeDate: 'تاريخ التغيير',
          cancel: 'إلغاء',
          save: 'حفظ',
        }
      : {
          title:
            mode === 'status'
              ? 'Update Title Status'
              : mode === 'notes'
                ? 'Add Title Notes'
                : 'Edit Title',
          description:
            currentTitle.type === 'Salvage'
              ? 'Salvage titles can be upgraded to Rebuilt after repairs and inspection.'
              : 'Update the title and keep the vehicle history in sync.',
          titleType: 'Title Type',
          notes: 'Notes',
          updatedBy: 'Updated By',
          changeDate: 'Change Date',
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='updatedBy'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{copy.updatedBy}</FormLabel>
                    <FormControl>
                      <Input placeholder='John Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='changeDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{copy.changeDate}</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                          ? 'أضف ملاحظات حول سبب التغيير أو تفاصيل الفحص...'
                          : 'Add notes about the title change or inspection details...'
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

