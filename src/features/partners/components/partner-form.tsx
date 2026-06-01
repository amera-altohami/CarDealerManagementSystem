import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useI18n, type MessageKey } from '@/lib/i18n'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  partnerFormSchema,
  partnerStatusOptions,
  type PartnerFormValues,
} from '../data/schema'

type PartnerFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<PartnerFormValues>
  onSubmit: (values: PartnerFormValues) => void
}

const defaults: PartnerFormValues = {
  name: '',
  email: '',
  phone: '',
  status: 'Active',
  notes: '',
}

const statusLabelKeys: Record<PartnerFormValues['status'], MessageKey> = {
  Active: 'activeStatus',
  Inactive: 'inactiveStatus',
}

export function PartnerForm({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: PartnerFormProps) {
  const { t } = useI18n()
  const isEdit = Boolean(defaultValues)
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema) as Resolver<PartnerFormValues>,
    defaultValues: { ...defaults, ...defaultValues },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!open) return
    form.reset({ ...defaults, ...defaultValues })
  }, [defaultValues, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? t('editPartner') : t('addPartner')}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('editPartnerDesc') : t('addPartnerDesc')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='partner-form'
            className='space-y-4'
            onSubmit={form.handleSubmit((values) => {
              onSubmit(values)
              form.reset(defaults)
            })}
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('partnerName')}</FormLabel>
                  <FormControl>
                    <Input placeholder='North Yard Partners' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input placeholder='partner@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phone')}</FormLabel>
                    <FormControl>
                      <Input placeholder='+1 (214) 555-0177' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('status')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder={t('selectStatus')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {partnerStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(statusLabelKeys[status])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <FormLabel>{t('notes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      className='min-h-24'
                      placeholder={t('partnerNotesPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button type='submit' form='partner-form'>
            {isEdit ? t('saveChanges') : t('addPartner')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
