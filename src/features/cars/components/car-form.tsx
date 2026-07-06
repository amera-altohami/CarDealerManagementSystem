import { useEffect, useMemo } from 'react'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { carStatusOptions } from '@/services/carsService'
import { useI18n } from '@/lib/i18n'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
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
import { carFormSchema, type CarFormValues } from '../data/schema'
import { buildCarFormData } from '../lib/car-form-data'
import { getTitleTypeLabel, titleTypeOptions } from '../types/title'
import {
  isPurchasePlace,
  purchasePlaceOptions,
} from '@/types/dealer'

type CarFormProps = {
  defaultValues?: Partial<CarFormValues>
  onSubmit?: (values: CarFormValues, formData: FormData) => void | Promise<void>
  submitLabel?: string
  cancelHref?: string
  lockTitleType?: boolean
}

const defaults: CarFormValues = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  vin: '',
  lotNumber: '',
  purchaseDate: '',
  purchasePrice: 0,
  sellingPrice: 0,
  purchasePlace: '',
  titleType: 'Clean',
  status: 'purchased',
  carfaxType: 'link',
  carfaxLink: '',
  carfaxPdfName: '',
  carfaxPdfFile: null,
  notes: '',
  photo: '',
}

export function CarForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Car',
  cancelHref = '/cars',
  lockTitleType = false,
}: CarFormProps) {
  const { t, locale } = useI18n()
  const supportedLocale = locale === 'ar' ? 'ar' : 'en'
  const defaultPurchasePlace = defaultValues?.purchasePlace
  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema) as Resolver<CarFormValues>,
    defaultValues: { ...defaults, ...defaultValues },
    mode: 'onChange',
  })
  const carfaxType = useWatch({ control: form.control, name: 'carfaxType' })
  const carfaxPdfName = useWatch({
    control: form.control,
    name: 'carfaxPdfName',
  })
  const purchasePlaceChoices = useMemo(
    () => {
      const options: Array<{ label: string; value: string }> =
        purchasePlaceOptions.map((place) => ({
          label: place,
          value: place,
        }))

      if (
        defaultPurchasePlace &&
        !isPurchasePlace(defaultPurchasePlace)
      ) {
        options.unshift({
          label: defaultPurchasePlace,
          value: defaultPurchasePlace,
        })
      }

      return options
    },
    [defaultPurchasePlace]
  )

  useEffect(() => {
    form.reset({ ...defaults, ...defaultValues })
  }, [defaultValues, form])

  return (
    <Form {...form}>
      <form
        className='space-y-6'
        onSubmit={form.handleSubmit((values) => {
          const formData = buildCarFormData(values)
          if (onSubmit) {
            return onSubmit(values, formData)
          }

          showSubmittedData(values)
        })}
      >
        <section className='space-y-4'>
          <div>
            <h3 className='text-lg font-semibold'>{t('basicInformation')}</h3>
            <p className='text-sm text-muted-foreground'>
              {t('basicInformation')}
            </p>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='brand'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('brand')}</FormLabel>
                  <FormControl>
                    <Input placeholder='Toyota' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='model'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('model')}</FormLabel>
                  <FormControl>
                    <Input placeholder='Camry' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='year'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('year')}</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='2020'
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
              name='vin'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vin')}</FormLabel>
                  <FormControl>
                    <Input placeholder='4T1BF1FK5LU123001' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='lotNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lotNumber')}</FormLabel>
                  <FormControl>
                    <Input placeholder='LOT-2401' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('status')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder={t('selectStatus')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {carStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.value === 'purchased'
                            ? t('purchasedStatus')
                            : option.value === 'shipping'
                              ? t('shippingStatus')
                              : option.value === 'repairing'
                                ? t('repairingStatus')
                                : option.value === 'ready-for-sale'
                                  ? t('readyForSaleStatus')
                                  : t('soldStatus')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className='space-y-4'>
          <div>
            <h3 className='text-lg font-semibold'>
              {t('purchaseInformation')}
            </h3>
            <p className='text-sm text-muted-foreground'>
              {t('purchaseInformation')}
            </p>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
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
              name='purchasePrice'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('purchasePrice')}</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='0'
                      placeholder='9800'
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
              name='sellingPrice'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('sellingPrice')}</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='0'
                      placeholder='12500'
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
              name='purchasePlace'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('purchasePlace')}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder={t('selectPurchasePlace')} />
                      </SelectTrigger>
                      <SelectContent>
                        {purchasePlaceChoices.map((place) => (
                          <SelectItem key={place.value} value={place.value}>
                            {place.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='titleType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('titleType')}</FormLabel>
                  {lockTitleType ? (
                    <div className='rounded-md border bg-muted/20 px-3 py-2 text-sm font-medium'>
                      {getTitleTypeLabel(field.value, supportedLocale)}
                    </div>
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder={t('selectTitleType')} />
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
                  )}
                  <FormDescription>
                    {lockTitleType
                      ? t('titleTypeLockedHelp')
                      : t('titleTypeHelp')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className='space-y-4'>
          <div>
            <h3 className='text-lg font-semibold'>{t('documents')}</h3>
            <p className='text-sm text-muted-foreground'>
              {t('carfaxPdfOrLink')}
            </p>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='photo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('uploadPhoto')}</FormLabel>
                  <FormControl>
                    <Input
                      type='file'
                      accept='image/*'
                      onChange={(event) => {
                        const fileName = event.target.files?.[0]?.name ?? ''
                        field.onChange(fileName)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value
                      ? `${t('currentFile')}: ${field.value}`
                      : t('imagesOnly')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='carfaxType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('carfax')}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        if (value === 'link') {
                          form.setValue('carfaxPdfName', '', {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                          form.setValue('carfaxPdfFile', null, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        } else {
                          form.setValue('carfaxLink', '', {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder={t('carfax')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='link'>{t('carfaxLink')}</SelectItem>
                        <SelectItem value='pdf'>{t('carfaxPdf')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    {field.value === 'pdf'
                      ? t('uploadPdfFromDevice')
                      : t('pasteCarfaxLink')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {carfaxType === 'link' ? (
              <FormField
                control={form.control}
                name='carfaxLink'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('carfaxPdfOrLink')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://example.com/carfax.pdf'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            {carfaxType === 'pdf' ? (
              <FormField
                control={form.control}
                name='carfaxPdfFile'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('carfaxPdf')}</FormLabel>
                    <FormControl>
                      <Input
                        type='file'
                        accept='application/pdf'
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          field.onChange(file ?? null)
                          form.setValue('carfaxPdfName', file?.name ?? '', {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {carfaxPdfName
                        ? `${t('currentFile')}: ${carfaxPdfName}`
                        : t('pdfFilesOnly')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </div>
        </section>

        <section className='space-y-4'>
          <div>
            <h3 className='text-lg font-semibold'>{t('notes')}</h3>
            <p className='text-sm text-muted-foreground'>{t('notes')}</p>
          </div>
          <FormField
            control={form.control}
            name='notes'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    className='min-h-32 resize-none'
                    placeholder={t('notesPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

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
