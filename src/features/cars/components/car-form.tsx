import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { Link } from '@tanstack/react-router'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { carStatusOptions, titleTypeOptions } from '@/data/carsMockData'
import { useI18n } from '@/lib/i18n'
import { carFormSchema, type CarFormValues } from '../data/schema'

type CarFormProps = {
  defaultValues?: Partial<CarFormValues>
  onSubmit?: (values: CarFormValues) => void
  submitLabel?: string
  cancelHref?: string
}

const defaults: CarFormValues = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  vin: '',
  lotNumber: '',
  purchaseDate: '',
  purchasePlace: '',
  titleType: 'Clean',
  status: 'purchased',
  notes: '',
  photo: '',
  carfaxLink: '',
}

export function CarForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Car',
  cancelHref = '/cars',
}: CarFormProps) {
  const { t } = useI18n()
  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema) as Resolver<CarFormValues>,
    defaultValues: { ...defaults, ...defaultValues },
    mode: 'onChange',
  })

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
        <section className='space-y-4'>
          <div>
            <h3 className='text-lg font-semibold'>Basic Information</h3>
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
                  <FormLabel>VIN</FormLabel>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {carStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
            <h3 className='text-lg font-semibold'>{t('purchaseInformation')}</h3>
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
              name='purchasePlace'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('purchasePlace')}</FormLabel>
                  <FormControl>
                    <Input placeholder='Dallas Auto Auction' {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select title type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {titleTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
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
                    {field.value ? `Current file: ${field.value}` : 'Images only.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          </div>
        </section>

        <section className='space-y-4'>
          <div>
            <h3 className='text-lg font-semibold'>{t('notes')}</h3>
            <p className='text-sm text-muted-foreground'>
              {t('notes')}
            </p>
          </div>
          <FormField
            control={form.control}
            name='notes'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    className='min-h-32 resize-none'
                    placeholder='Add any helpful notes about this vehicle...'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

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
