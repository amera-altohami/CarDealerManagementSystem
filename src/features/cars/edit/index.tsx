import { useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CarForm } from '../components/car-form'
import { getCarById } from '@/data/carsMockData'
import { useI18n } from '@/lib/i18n'

type CarEditProps = {
  carId: string
}

export function CarEdit({ carId }: CarEditProps) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const car = getCarById(carId)

  if (!car) {
      return (
        <Main className='flex flex-1 items-center justify-center'>
          <div className='rounded-lg border p-6 text-center'>
          <h1 className='text-lg font-semibold'>{t('carNotFound')}</h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            {t('carNotFoundDesc')}
          </p>
        </div>
      </Main>
    )
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('editCar')}
          </h1>
          <p className='text-muted-foreground'>
            {t('carsManagementDesc')}
          </p>
        </div>
        <CarForm
          lockTitleType
          defaultValues={{
            brand: car.brand,
            model: car.model,
            year: car.year,
            vin: car.vin,
            lotNumber: car.lotNumber,
            purchaseDate: car.purchaseDate,
            purchasePrice: car.purchasePrice,
            sellingPrice: car.sellingPrice,
            purchasePlace: car.purchasePlace,
            titleType: car.titleType,
            status: car.status,
            carfaxType: car.carfaxType,
            notes: car.notes,
            photo: car.photo,
            carfaxLink: car.carfaxLink,
            carfaxPdfName: car.carfaxPdfName,
          }}
          submitLabel={t('saveChanges')}
          cancelHref={`/cars/${car.id}`}
          onSubmit={() => navigate({ to: `/cars/${car.id}` })}
        />
      </Main>
    </>
  )
}
