import { useEffect, useMemo } from 'react'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { getAll as getPartners } from '@/services/partnersService'
import {
  getBillCategoryLabel,
  getExpenseTypeLabel,
  getPaymentMethodLabel,
  useI18n,
} from '@/lib/i18n'
import { showSubmittedData } from '@/lib/show-submitted-data'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SearchableCombobox } from '@/components/searchable-combobox'
import {
  expenseFormSchema,
  billCategories,
  expenseTypes,
  paymentMethods,
  type ExpenseFormValues,
} from './expense-form-data'

type ExpenseFormProps = {
  defaultValues?: Partial<ExpenseFormValues>
  onSubmit?: (values: ExpenseFormValues) => void | Promise<void>
  submitLabel?: string
  cancelHref?: string
}

const defaults: ExpenseFormValues = {
  expenseType: 'Repair',
  amount: 0,
  paidBy: '',
  paymentMethod: 'Zelle',
  billCategory: '',
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
  const partnersQuery = useQuery({
    queryKey: ['expense-paid-by-partners'],
    queryFn: getPartners,
  })
  const defaultPaidBy = defaultValues?.paidBy
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema) as Resolver<ExpenseFormValues>,
    defaultValues: { ...defaults, ...defaultValues },
    mode: 'onChange',
  })
  const expenseType = useWatch({ control: form.control, name: 'expenseType' })
  const invoiceName = useWatch({ control: form.control, name: 'invoiceName' })

  const paidByOptions = useMemo(() => {
    const options = (partnersQuery.data ?? []).map((partner) => ({
      label: partner.name,
      value: partner.name,
      description: t('partner'),
    }))
    const companyAccountOption = {
      label: 'Company Account',
      value: 'Company Account',
      description: '',
    }

    if (
      !options.some((option) => option.value === companyAccountOption.value)
    ) {
      options.push(companyAccountOption)
    }

    if (
      defaultPaidBy &&
      !options.some((option) => option.value === defaultPaidBy)
    ) {
      options.unshift({
        label: defaultPaidBy,
        value: defaultPaidBy,
        description: '',
      })
    }

    return options
  }, [defaultPaidBy, partnersQuery.data, t])

  const billCategoryOptions = useMemo(
    () =>
      billCategories.map((category) => ({
        label: getBillCategoryLabel(category, locale),
        value: category,
      })),
    [locale]
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
            return onSubmit(values)
          }

          showSubmittedData(values)
        })}
      >
        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='expenseType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('expenseType')}</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)

                    if (value !== 'Bills') {
                      form.setValue('billCategory', '', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  }}
                  defaultValue={field.value}
                >
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
          {expenseType === 'Bills' ? (
            <FormField
              control={form.control}
              name='billCategory'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {locale === 'ar' ? 'تصنيف الفاتورة' : 'Bill Category'}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                      <SelectValue
                        placeholder={
                          locale === 'ar'
                            ? 'اختر تصنيف الفاتورة'
                            : 'Select bill category'
                        }
                      />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {billCategoryOptions.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
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
                        event.target.value === ''
                          ? ''
                          : Number(event.target.value)
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                  placeholder={
                    locale === 'ar'
                      ? 'أضف ملاحظات حول هذا المصروف...'
                      : 'Add notes about this expense...'
                  }
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
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {submitLabel}
          </Button>
          <Button asChild variant='outline'>
            <Link to={cancelHref}>{t('cancel')}</Link>
          </Button>
        </div>
      </form>
    </Form>
  )
}
