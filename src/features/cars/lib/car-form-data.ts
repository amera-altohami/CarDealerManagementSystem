import type { CarFormValues } from '../data/schema'

export function buildCarFormData(values: CarFormValues) {
  const formData = new FormData()

  formData.append('brand', values.brand)
  formData.append('model', values.model)
  formData.append('year', String(values.year))
  formData.append('vin', values.vin)
  formData.append('mileage', values.mileage)
  formData.append('purchaseDate', values.purchaseDate)
  formData.append('purchasePrice', String(values.purchasePrice))
  formData.append('sellingPrice', String(values.sellingPrice))
  formData.append('purchasePlace', values.purchasePlace)
  formData.append('titleType', values.titleType)
  formData.append('status', values.status)
  formData.append('carfaxType', values.carfaxType)
  formData.append('notes', values.notes ?? '')
  formData.append('photo', values.photo ?? '')

  if (values.carfaxType === 'link') {
    formData.append('carfaxLink', values.carfaxLink ?? '')
  }

  if (values.carfaxType === 'pdf') {
    if (values.carfaxPdfFile instanceof File) {
      formData.append('carfaxPdfFile', values.carfaxPdfFile)
    }

    formData.append('carfaxPdfName', values.carfaxPdfName ?? '')
  }

  return formData
}
