import { useEffect, useMemo, useState } from 'react'
import { ListPlus, Plus, Trash2 } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, useWatch, type Resolver } from 'react-hook-form'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { getCompanyTypeLabel, useI18n } from '@/lib/i18n'
import { useCarsQuery } from '@/features/cars/hooks/use-cars'
import { useCompaniesQuery } from '@/features/companies/hooks/use-companies'
import { partFormSchema, type PartFormValues } from './part-form-data'
import { PartCatalogDialog } from './part-catalog-dialog'
import { usePartCatalog } from '../hooks/use-part-catalog'

type PartFormProps = {
  defaultValues?: Partial<PartFormValues>
  onSubmit?: (values: PartFormValues) => void
  submitLabel?: string
  cancelHref?: string
  allowMultipleParts?: boolean
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
  additionalParts: [],
}

export function PartForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Part',
  cancelHref = '/parts',
  allowMultipleParts = false,
}: PartFormProps) {
  const { t, locale } = useI18n()
  const carsQuery = useCarsQuery()
  const companiesQuery = useCompaniesQuery()
  const { catalog, createPartCatalogItem } = usePartCatalog()
  const [catalogDialogOpen, setCatalogDialogOpen] = useState(false)
  const form = useForm<PartFormValues>({
    resolver: zodResolver(partFormSchema) as Resolver<PartFormValues>,
    defaultValues: { ...defaults, ...defaultValues },
    mode: 'onChange',
  })
  const {
    fields: additionalPartFields,
    append: appendAdditionalPart,
    remove: removeAdditionalPart,
  } = useFieldArray({
    control: form.control,
    name: 'additionalParts',
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
      ...(carsQuery.data ?? []).map((car) => ({
        label: `${car.brand} ${car.model} ${car.year}`,
        value: car.id,
      })),
    ],
    [carsQuery.data, t]
  )

  const supplierOptions = useMemo(
    () =>
      (companiesQuery.data ?? [])
        .map((company) => ({
          label: company.name,
          value: company.id,
          description: getCompanyTypeLabel(company.type, locale),
        })),
    [companiesQuery.data, locale]
  )

  const partNameOptions = useMemo(() => {
    const options = catalog.map((item) => ({
      label: item.name,
      value: item.name,
      description: item.category,
    }))
    const currentPartName = defaultValues?.partName?.trim()

    if (
      currentPartName &&
      !options.some(
        (option) => option.value.toLowerCase() === currentPartName.toLowerCase()
      )
    ) {
      options.unshift({
        label: currentPartName,
        value: currentPartName,
        description: locale === 'ar' ? 'القيمة الحالية' : 'Current value',
      })
    }

    return options
  }, [catalog, defaultValues?.partName, locale])

  const invoiceName = useWatch({ control: form.control, name: 'invoiceName' })
  const mainPartPrice = useWatch({ control: form.control, name: 'price' })
  const additionalParts = useWatch({
    control: form.control,
    name: 'additionalParts',
  })
  const totalPartsCount =
    1 + (additionalParts?.filter((item) => item?.partName?.trim()).length ?? 0)
  const totalPartsPrice =
    Number(mainPartPrice || 0) +
    (additionalParts?.reduce((sum, item) => sum + Number(item?.price || 0), 0) ??
      0)

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
                <div className='flex items-center justify-between gap-3'>
                  <FormLabel>{t('partName')}</FormLabel>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='h-8 px-2 text-xs'
                    onClick={() => setCatalogDialogOpen(true)}
                  >
                    <ListPlus className='me-1 h-4 w-4' />
                    {locale === 'ar' ? 'إدارة القائمة' : 'Manage List'}
                  </Button>
                </div>
                <FormControl>
                  <SearchableCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                    options={partNameOptions}
                    placeholder={
                      locale === 'ar' ? 'اختر القطعة' : 'Select a part'
                    }
                    searchPlaceholder={
                      locale === 'ar' ? 'ابحث في القطع...' : 'Search parts...'
                    }
                    emptyText={
                      locale === 'ar'
                        ? 'لا توجد قطع مطابقة.'
                        : 'No matching parts found.'
                    }
                    allowCreate
                    onCreate={async (searchValue) => {
                      const created = await createPartCatalogItem({
                        name: searchValue,
                        category: 'Other',
                      })
                      if (created) {
                        field.onChange(created.name)
                      }
                    }}
                    createLabel={
                      locale === 'ar' ? 'إضافة هذه القطعة' : 'Add this part'
                    }
                    createHeading={
                      locale === 'ar' ? 'إنشاء قطعة' : 'Create part'
                    }
                  />
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

        {allowMultipleParts ? (
          <div className='space-y-4 rounded-lg border border-dashed p-4'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div className='space-y-1'>
                <h3 className='font-semibold'>
                  {locale === 'ar'
                    ? 'قطع إضافية في نفس الوصل'
                    : 'More parts from the same receipt'}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {locale === 'ar'
                    ? 'أضف أكثر من قطعة، مع بقاء المورد والسيارة والتاريخ والفاتورة مشتركة.'
                    : 'Add more parts while keeping supplier, car, date, invoice, and notes shared.'}
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  appendAdditionalPart({ partName: '', price: 0 })
                }
              >
                <Plus className='me-1 h-4 w-4' />
                {locale === 'ar' ? 'إضافة قطعة أخرى' : 'Add another part'}
              </Button>
            </div>

            {additionalPartFields.length ? (
              <div className='space-y-3'>
                {additionalPartFields.map((field, index) => (
                  <div
                    key={field.id}
                    className='grid gap-3 md:grid-cols-[1fr_180px_auto]'
                  >
                    <FormField
                      control={form.control}
                      name={`additionalParts.${index}.partName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {locale === 'ar' ? 'اسم القطعة' : 'Part name'}
                          </FormLabel>
                          <FormControl>
                            <SearchableCombobox
                              value={field.value}
                              onValueChange={field.onChange}
                              options={partNameOptions}
                              placeholder={
                                locale === 'ar'
                                  ? 'اختر القطعة'
                                  : 'Select a part'
                              }
                              searchPlaceholder={
                                locale === 'ar'
                                  ? 'ابحث في القطع...'
                                  : 'Search parts...'
                              }
                              emptyText={
                                locale === 'ar'
                                  ? 'لا توجد قطع مطابقة.'
                                  : 'No matching parts found.'
                              }
                              allowCreate
                              onCreate={async (searchValue) => {
                                const created = await createPartCatalogItem({
                                  name: searchValue,
                                  category: 'Other',
                                })
                                if (created) {
                                  field.onChange(created.name)
                                }
                              }}
                              createLabel={
                                locale === 'ar'
                                  ? 'إضافة هذه القطعة'
                                  : 'Add this part'
                              }
                              createHeading={
                                locale === 'ar'
                                  ? 'إنشاء قطعة'
                                  : 'Create part'
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`additionalParts.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {locale === 'ar' ? 'السعر' : 'Price'}
                          </FormLabel>
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
                    <div className='flex items-end'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='shrink-0'
                        onClick={() => removeAdditionalPart(index)}
                        aria-label={
                          locale === 'ar'
                            ? 'حذف القطعة'
                            : 'Remove part'
                        }
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground'>
                {locale === 'ar'
                  ? 'لا توجد قطع إضافية بعد. اضغط "إضافة قطعة أخرى".'
                  : 'No additional parts yet. Use "Add another part".'}
              </div>
            )}
          </div>
        ) : null}

        {allowMultipleParts ? (
          <Card className='border-border/60 bg-muted/20'>
            <CardContent className='space-y-3 p-4'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    {locale === 'ar' ? 'ملخص قبل الحفظ' : 'Summary before save'}
                  </p>
                  <p className='text-lg font-semibold'>
                    {locale === 'ar'
                      ? `${totalPartsCount} قطع`
                      : `${totalPartsCount} parts`}
                  </p>
                </div>
                <div className='rounded-md border bg-background px-3 py-2 text-sm font-medium'>
                  {locale === 'ar'
                    ? `الإجمالي: ${totalPartsPrice.toLocaleString()}`
                    : `Total: ${totalPartsPrice.toLocaleString()}`}
                </div>
              </div>
              <p className='text-sm text-muted-foreground'>
                {locale === 'ar'
                  ? 'كل القطع الجديدة بتنحفظ مع نفس المورد والسيارة والتاريخ والفاتورة.'
                  : 'All saved parts will share the same supplier, car, date, and invoice.'}
              </p>
            </CardContent>
          </Card>
        ) : null}

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
      <PartCatalogDialog
        open={catalogDialogOpen}
        onOpenChange={setCatalogDialogOpen}
      />
    </Form>
  )
}
