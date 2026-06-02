import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type ReportFilterValues, type ReportOption } from '../data/schema'

export type ReportFilterField =
  | 'dateRange'
  | 'car'
  | 'partner'
  | 'expenseType'
  | 'companyPlace'
  | 'payer'
  | 'status'

type ReportFiltersProps = {
  title?: string
  fields: ReportFilterField[]
  value: ReportFilterValues
  onChange: (value: ReportFilterValues) => void
  cars?: ReportOption[]
  partners?: ReportOption[]
  expenseTypes?: ReportOption[]
  companyPlaces?: ReportOption[]
  payers?: ReportOption[]
  statuses?: ReportOption[]
}

export function ReportFilters({
  title,
  fields,
  value,
  onChange,
  cars = [],
  partners = [],
  expenseTypes = [],
  companyPlaces = [],
  payers = [],
  statuses = [],
}: ReportFiltersProps) {
  const { t } = useI18n()

  const updateValue = (nextValue: Partial<ReportFilterValues>) => {
    onChange({ ...value, ...nextValue })
  }

  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle className='text-base'>{title ?? t('filters')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          {fields.includes('dateRange') ? (
            <>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>{t('startDate')}</label>
                <Input
                  type='date'
                  value={value.startDate}
                  onChange={(event) =>
                    updateValue({ startDate: event.target.value })
                  }
                />
              </div>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>{t('endDate')}</label>
                <Input
                  type='date'
                  value={value.endDate}
                  onChange={(event) =>
                    updateValue({ endDate: event.target.value })
                  }
                />
              </div>
            </>
          ) : null}

          {fields.includes('car') ? (
            <Select
              value={value.carId}
              onValueChange={(carId) => updateValue({ carId })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={t('selectCar')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{t('allCars')}</SelectItem>
                {cars.map((car) => (
                  <SelectItem key={car.value} value={car.value}>
                    {car.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {fields.includes('partner') ? (
            <Select
              value={value.partnerId}
              onValueChange={(partnerId) => updateValue({ partnerId })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={t('selectPartner')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{t('allPartners')}</SelectItem>
                {partners.map((partner) => (
                  <SelectItem key={partner.value} value={partner.value}>
                    {partner.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {fields.includes('expenseType') ? (
            <Select
              value={value.expenseType}
              onValueChange={(expenseType) => updateValue({ expenseType })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={t('expenseType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{t('allTypes')}</SelectItem>
                {expenseTypes.map((expenseType) => (
                  <SelectItem key={expenseType.value} value={expenseType.value}>
                    {expenseType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {fields.includes('companyPlace') ? (
            <Select
              value={value.companyPlace}
              onValueChange={(companyPlace) => updateValue({ companyPlace })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={t('companyPlace')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{t('allCompaniesPlaces')}</SelectItem>
                {companyPlaces.map((companyPlace) => (
                  <SelectItem
                    key={companyPlace.value}
                    value={companyPlace.value}
                  >
                    {companyPlace.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {fields.includes('payer') ? (
            <Select
              value={value.payer}
              onValueChange={(payer) => updateValue({ payer })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={t('paidBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{t('allPayers')}</SelectItem>
                {payers.map((payer) => (
                  <SelectItem key={payer.value} value={payer.value}>
                    {payer.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {fields.includes('status') ? (
            <Select
              value={value.status}
              onValueChange={(status) => updateValue({ status })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={t('selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{t('allStatuses')}</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
