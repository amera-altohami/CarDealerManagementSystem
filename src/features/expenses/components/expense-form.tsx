import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
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
import { SearchableCombobox } from '@/components/searchable-combobox'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { carsMockData } from '@/data/carsMockData'
import { expensesMockData, financialActorsMockData, type ExpenseType, type PaymentMethod } from '@/data/dealerOperationsMockData'
import { getExpenseTypeLabel, getPaymentMethodLabel, useI18n } from '@/lib/i18n'
import { z } from 'zod'

export const expenseTypes: ExpenseType[] = [
  'Purchase',
  'Shipping',
  'Repair',
  'Parts',
  'Labor',
  'Inspection',
  'Fees',
  'Other',
]

export const paymentMethods: PaymentMethod[] = ['Zelle', 'Cash', 'Card']

export const expenseFormSchema = z.object({
  carId: z.string().min(1, 'Please select a car.'),
  expenseType: z.enum([
    expenseTypes[0],
    expenseTypes[1],
    expenseTypes[2],
    expenseTypes[3],
    expenseTypes[4],
    expenseTypes[5],
    expenseTypes[6],
    expenseTypes[7],
  ]),
  amount: z.coerce.number().min(0, 'Please enter a valid amount.'),
  paidBy: z.string().min(2, 'Please select who paid this expense.'),
  paymentMethod: z.enum([paymentMethods[0], paymentMethods[1], paymentMethods[2]]),
  date: z.string().min(1, 'Please select a date.'),
  notes: z.string().optional().default(''),
  invoiceName: z.string().optional().default(''),
})

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>

type ExpenseFormProps = {
  defaultValues?: Partial<ExpenseFormValues>
  onSubmit?: (values: ExpenseFormValues) => void
  submitLabel?: string
  cancelHref?: string
}

const defaults: ExpenseFormValues = {
  carId: '',
  expenseType: 'Repair',
  amount: 0,
  paidBy: '',
  paymentMethod: 'Zelle',
  date: '',
  notes: '',
  invoiceName: '',
}

export function ExpenseForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Expense',
  cancelHref = '/expenses',
}: ExpenseFormProps) {
  const { t, locale } = useI18n()
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema) as Resolver<ExpenseFormValues>,
    defaultValues: { ...defaults, ...defaultValues },
    mode: 'onChange',
  })
  const invoiceName = form.watch('invoiceName')

  const carOptions = useMemo(
    () =>
      carsMockData.map((car) => ({
        label: `${car.brand} ${car.model} ${car.year}`,
        value: car.id,
        description: car.vin,
      })),
    []
  )

  const paidByOptions = useMemo(
    () =>
      financialActorsMockData.map((actor) => ({
        label: actor.name,
        value: actor.name,
        description: actor.type === 'Investor' ? t('investor') : t('partner'),
      })),
    [t]
  )

  useEffect(() => {
    form.reset({ ...defaults, ...defaultValues })
  }, [defaultValues, form])

  return (
    <Form {...form}>
      <form
        className='space-y-6'
        onSubmit={form.handleSubmit((values) => {
          if (onSubmit) {
            onSubmit(values)
            return
          }

          showSubmittedData(values)
        })}
      >
        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='carId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('car')}</FormLabel>
                <FormControl>
                  <SearchableCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                    options={carOptions}
                    placeholder={t('selectCar')}
                    searchPlaceholder={t('searchCars')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='expenseType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('expenseType')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder={t('selectType')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expenseTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getExpenseTypeLabel(type, locale)}
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
            name='amount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('amount')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min='0'
                    placeholder='0'
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === '' ? '' : Number(event.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='paidBy'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('paidBy')}</FormLabel>
                <FormControl>
                  <SearchableCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                    options={paidByOptions}
                    placeholder={t('selectPaidBy')}
                    searchPlaceholder={t('searchPaidBy')}
                  />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder={t('selectMethod')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {getPaymentMethodLabel(method, locale)}
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
            name='date'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('date')}</FormLabel>
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
              <FormLabel>{t('notes')}</FormLabel>
              <FormControl>
                <Textarea
                  className='min-h-24 resize-none'
                  placeholder={locale === 'ar' ? 'أضف ملاحظات حول هذا المصروف...' : 'Add notes about this expense...'}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='invoiceName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('invoice')}</FormLabel>
              <FormControl>
                <Input
                  type='file'
                  accept='image/*,application/pdf'
                  onChange={(event) => {
                    const fileName = event.target.files?.[0]?.name ?? ''
                    field.onChange(fileName)
                  }}
                />
              </FormControl>
              <p className='text-xs text-muted-foreground'>
                {invoiceName
                  ? `${locale === 'ar' ? 'الملف الحالي: ' : 'Current file: '}${invoiceName}`
                  : t('uploadInvoice')}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex flex-wrap items-center gap-3'>
          <Button type='submit'>{submitLabel}</Button>
          <Button asChild variant='outline'>
            <Link to={cancelHref}>{t('cancel')}</Link>
          </Button>
        </div>
      </form>
    </Form>
  )
}

export function getExpenseById(expenseId: string) {
  return expensesMockData.find((expense) => expense.id === expenseId)
}
