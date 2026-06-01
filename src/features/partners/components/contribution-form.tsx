import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatCarName, type Car } from '@/data/carsMockData'
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
  contributionFormSchema,
  paymentMethodOptions,
  type ContributionFormValues,
  type Partner,
} from '../data/schema'

type ContributionFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  partners: Partner[]
  cars: Car[]
  defaultValues?: Partial<ContributionFormValues>
  onSubmit: (values: ContributionFormValues) => void
}

const defaults: ContributionFormValues = {
  partnerId: '',
  carId: '',
  contributionAmount: 0,
  contributionDate: '',
  paymentMethod: 'Cash',
  notes: '',
}

const paymentMethodLabelKeys: Record<
  ContributionFormValues['paymentMethod'],
  MessageKey
> = {
  Cash: 'paymentCash',
  Zelle: 'paymentZelle',
  Card: 'paymentCard',
  'Bank Transfer': 'paymentBankTransfer',
  Other: 'paymentOther',
}

export function ContributionForm({
  open,
  onOpenChange,
  partners,
  cars,
  defaultValues,
  onSubmit,
}: ContributionFormProps) {
  const { t } = useI18n()
  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(
      contributionFormSchema
    ) as Resolver<ContributionFormValues>,
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
          <DialogTitle>{t('addContribution')}</DialogTitle>
          <DialogDescription>{t('addContributionDesc')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='contribution-form'
            className='space-y-4'
            onSubmit={form.handleSubmit((values) => {
              onSubmit(values)
              form.reset(defaults)
            })}
          >
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='partnerId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('partner')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder={t('selectPartner')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {partners.map((partner) => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='carId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('car')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder={t('selectCar')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cars.map((car) => (
                          <SelectItem key={car.id} value={car.id}>
                            {formatCarName(car)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='contributionAmount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contributionAmount')}</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} step='0.01' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='contributionDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contributionDate')}</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='paymentMethod'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('paymentMethod')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder={t('selectPaymentMethod')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethodOptions.map((method) => (
                          <SelectItem key={method} value={method}>
                            {t(paymentMethodLabelKeys[method])}
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
                      placeholder={t('contributionNotesPlaceholder')}
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
          <Button type='submit' form='contribution-form'>
            {t('addContribution')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
