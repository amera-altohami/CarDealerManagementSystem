import { useEffect } from 'react'
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
import { showSubmittedData } from '@/lib/show-submitted-data'
import { companiesMockData, type CompanyType } from '@/data/dealerOperationsMockData'
import { getCompanyTypeLabel, useI18n } from '@/lib/i18n'
import { z } from 'zod'

export const companyTypes: CompanyType[] = [
  'Auction',
  'Shipping',
  'Repair Shop',
  'Parts Store',
  'DMV/BMV',
  'Inspection Center',
]

export const companyFormSchema = z.object({
  name: z.string().min(2, 'Please enter a company name.'),
  type: z.enum([
    companyTypes[0],
    companyTypes[1],
    companyTypes[2],
    companyTypes[3],
    companyTypes[4],
    companyTypes[5],
  ]),
  phoneNumber: z.string().min(7, 'Please enter a valid phone number.'),
  address: z.string().min(4, 'Please enter an address.'),
  email: z.string().email('Please enter a valid email.').optional().or(z.literal('')),
  notes: z.string().optional().default(''),
})

export type CompanyFormValues = z.infer<typeof companyFormSchema>

type CompanyFormProps = {
  defaultValues?: Partial<CompanyFormValues>
  onSubmit?: (values: CompanyFormValues) => void
  submitLabel?: string
  cancelHref?: string
}

const defaults: CompanyFormValues = {
  name: '',
  type: 'Auction',
  phoneNumber: '',
  address: '',
  email: '',
  notes: '',
}

export function CompanyForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Company',
  cancelHref = '/companies',
}: CompanyFormProps) {
  const { t, locale } = useI18n()
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema) as Resolver<CompanyFormValues>,
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
        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('companyName')}</FormLabel>
                <FormControl>
                  <Input placeholder='Dallas Auto Auction' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('companyType')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder={t('selectType')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getCompanyTypeLabel(type, locale)}
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
            name='phoneNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phoneNumber')}</FormLabel>
                <FormControl>
                  <Input placeholder='(214) 555-0198' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input placeholder='contact@company.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name='address'
            render={({ field }) => (
            <FormItem>
              <FormLabel>{t('address')}</FormLabel>
              <FormControl>
                <Input placeholder='1200 Market Center Blvd, Dallas, TX' {...field} />
              </FormControl>
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
                <Textarea className='min-h-24 resize-none' placeholder={locale === 'ar' ? 'أضف أي ملاحظات حول هذه الشركة...' : 'Add any notes about this company...'} {...field} />
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

export function getCompanyById(companyId: string) {
  return companiesMockData.find((company) => company.id === companyId)
}
