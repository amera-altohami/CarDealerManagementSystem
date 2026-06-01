import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Control, type Resolver } from 'react-hook-form'
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
import { companiesMockData, inspectionsMockData, type InspectionStatus } from '@/data/dealerOperationsMockData'
import { getCompanyTypeLabel, getInspectionStatusLabel, useI18n } from '@/lib/i18n'
import { z } from 'zod'

export const inspectionStatuses: InspectionStatus[] = ['Pending', 'Passed', 'Failed']

export const inspectionFormSchema = z.object({
  carId: z.string().min(1, 'Please select a car.'),
  date: z.string().min(1, 'Please select a date.'),
  time: z.string().min(1, 'Please select a time.'),
  placeId: z.string().min(1, 'Please select a place.'),
  status: z.enum([inspectionStatuses[0], inspectionStatuses[1], inspectionStatuses[2]]),
  notes: z.string().optional().default(''),
  files: z.string().optional().default(''),
  receipts: z.string().optional().default(''),
  beforeImages: z.string().optional().default(''),
  afterImages: z.string().optional().default(''),
  reminderSent: z.enum(['yes', 'no']),
})

export type InspectionFormValues = z.infer<typeof inspectionFormSchema>

type InspectionFormProps = {
  defaultValues?: Partial<InspectionFormValues>
  onSubmit?: (values: InspectionFormValues) => void
  submitLabel?: string
  cancelHref?: string
}

const defaults: InspectionFormValues = {
  carId: '',
  date: '',
  time: '',
  placeId: '',
  status: 'Pending',
  notes: '',
  files: '',
  receipts: '',
  beforeImages: '',
  afterImages: '',
  reminderSent: 'no',
}

export function InspectionForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Inspection',
  cancelHref = '/inspections',
}: InspectionFormProps) {
  const { t, locale } = useI18n()
  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(inspectionFormSchema) as Resolver<InspectionFormValues>,
    defaultValues: { ...defaults, ...defaultValues },
    mode: 'onChange',
  })

  const carOptions = useMemo(
    () =>
      carsMockData.map((car) => ({
        label: `${car.brand} ${car.model} ${car.year}`,
        value: car.id,
      })),
    []
  )
  const placeOptions = useMemo(
    () =>
      companiesMockData
        .filter((company) => company.type === 'Inspection Center' || company.type === 'Repair Shop')
        .map((company) => ({
          label: company.name,
          value: company.id,
          description: `${getCompanyTypeLabel(company.type, locale)} • ${company.address}`,
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
            name='placeId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('place')}</FormLabel>
                <FormControl>
                  <SearchableCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                    options={placeOptions}
                    placeholder={t('selectPlace')}
                    searchPlaceholder={t('searchCenters')}
                  />
                </FormControl>
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
          <FormField
            control={form.control}
            name='time'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('time')}</FormLabel>
                <FormControl>
                  <Input type='time' {...field} />
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
                <FormLabel>{t('inspectionStatus')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder={t('selectStatus')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {inspectionStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {getInspectionStatusLabel(status, locale)}
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
            name='reminderSent'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('reminderStatus')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder={t('reminderStatus')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='yes'>{t('yes')}</SelectItem>
                    <SelectItem value='no'>{t('no')}</SelectItem>
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
                  className='min-h-24 resize-none'
                  placeholder={locale === 'ar' ? 'أضف ملاحظات الفحص...' : 'Add inspection notes...'}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid gap-4 md:grid-cols-2'>
          <FileUploadField control={form.control} name='files' label={t('inspectionDocuments')} />
          <FileUploadField control={form.control} name='receipts' label={t('receipts')} />
          <FileUploadField control={form.control} name='beforeImages' label={t('beforeInspectionImages')} />
          <FileUploadField control={form.control} name='afterImages' label={t('afterInspectionImages')} />
        </div>

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

function FileUploadField({
  control,
  name,
  label,
}: {
  control: Control<InspectionFormValues>
  name: keyof Pick<InspectionFormValues, 'files' | 'receipts' | 'beforeImages' | 'afterImages'>
  label: string
}) {
  const { t, locale } = useI18n()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type='file'
              multiple
              accept='image/*,application/pdf'
              onChange={(event) => {
                const names = Array.from(event.target.files ?? []).map((file) => file.name)
                field.onChange(names.join(', '))
              }}
            />
          </FormControl>
          <p className='text-xs text-muted-foreground'>
            {field.value
              ? `${locale === 'ar' ? 'الملفات الحالية: ' : 'Current files: '}${field.value}`
              : t('uploadFiles')}
          </p>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function getInspectionById(inspectionId: string) {
  return inspectionsMockData.find((inspection) => inspection.id === inspectionId)
}
