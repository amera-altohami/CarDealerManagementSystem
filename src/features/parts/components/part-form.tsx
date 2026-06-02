import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
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
import { companiesMockData } from '@/data/dealerOperationsMockData'
import { getCompanyTypeLabel, useI18n } from '@/lib/i18n'
import { partFormSchema, type PartFormValues } from './part-form-data'

type PartFormProps = {
  defaultValues?: Partial<PartFormValues>
  onSubmit?: (values: PartFormValues) => void
  submitLabel?: string
  cancelHref?: string
}

const defaults: PartFormValues = {
  partName: '',
  price: 0,
  supplierId: '',
  purchaseDate: '',
  installed: 'no',
  relatedCarId: '',
  invoiceName: '',
  notes: '',
}

export function PartForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Part',
  cancelHref = '/parts',
}: PartFormProps) {
  const { t, locale } = useI18n()
  const form = useForm<PartFormValues>({
    resolver: zodResolver(partFormSchema) as Resolver<PartFormValues>,
    defaultValues: { ...defaults, ...defaultValues },
    mode: 'onChange',
  })

  useEffect(() => {
    form.reset({ ...defaults, ...defaultValues })
  }, [defaultValues, form])

  const carOptions = useMemo(
    () => [
      {
        label: t('standalonePart'),
        value: '',
        description: t('standaloneInventory'),
      },
      ...carsMockData.map((car) => ({
        label: `${car.brand} ${car.model} ${car.year}`,
        value: car.id,
      })),
    ],
    [t]
  )

  const supplierOptions = useMemo(
    () =>
      companiesMockData
        .filter((company) => company.type === 'Parts Store' || company.type === 'Shipping')
        .map((company) => ({
          label: company.name,
          value: company.id,
          description: getCompanyTypeLabel(company.type, locale),
        })),
    [locale]
  )

  const invoiceName = useWatch({ control: form.control, name: 'invoiceName' })

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
            name='partName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('partName')}</FormLabel>
                <FormControl>
                  <Input placeholder='Front Bumper' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('price')}</FormLabel>
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
            name='supplierId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('supplier')}</FormLabel>
                <FormControl>
                  <SearchableCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                    options={supplierOptions}
                    placeholder={t('selectSupplier')}
                    searchPlaceholder={t('searchSuppliers')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='purchaseDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('purchaseDate')}</FormLabel>
                <FormControl>
                  <Input type='date' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='installed'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('installationStatus')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder={t('installationStatus')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='yes'>{t('installed')}</SelectItem>
                    <SelectItem value='no'>{t('notInstalled')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='relatedCarId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('relatedCar')}</FormLabel>
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
        </div>

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
                    field.onChange(event.target.files?.[0]?.name ?? '')
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

        <FormField
          control={form.control}
          name='notes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('notes')}</FormLabel>
              <FormControl>
                <Textarea
                  className='min-h-24 resize-none'
                  placeholder={locale === 'ar' ? 'أضف ملاحظات حول هذه القطعة...' : 'Add notes about this part...'}
                  {...field}
                />
              </FormControl>
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
