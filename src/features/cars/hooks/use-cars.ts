import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CarDeleteBlockedError,
  canDeleteCar,
  createCar,
  deleteCar,
  getCarById,
  getCars,
  updateCar,
  type Car,
  type CreateCarData,
  type UpdateCarData,
} from '@/services/carsService'
import { toast } from 'sonner'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'

export const carsQueryKey = ['cars'] as const

export function useCarsQuery() {
  return useQuery({
    queryKey: carsQueryKey,
    queryFn: getCars,
  })
}

export function useCarQuery(carId: string) {
  return useQuery({
    queryKey: [...carsQueryKey, carId] as const,
    queryFn: () => getCarById(carId),
    enabled: Boolean(carId),
  })
}

export function useCarDeleteCheckQuery(carId: string) {
  return useQuery({
    queryKey: [...carsQueryKey, carId, 'delete-check'] as const,
    queryFn: () => canDeleteCar(carId),
    enabled: Boolean(carId),
  })
}

export function useCreateCarMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCarData) => createCar(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: carsQueryKey })
      await queryClient.invalidateQueries({
        queryKey: ['notifications'] as const,
      })
      toast.success('Car added successfully.')
    },
    onError: (error) => {
      toast.error(getFirestoreErrorMessage(error))
    },
  })
}

export function useUpdateCarMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCarData }) =>
      updateCar(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: carsQueryKey })
      await queryClient.invalidateQueries({
        queryKey: ['notifications'] as const,
      })
      toast.success('Car updated successfully.')
    },
    onError: (error) => {
      toast.error(getFirestoreErrorMessage(error))
    },
  })
}

export function useDeleteCarMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCar(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: carsQueryKey })
      await queryClient.invalidateQueries({
        queryKey: ['notifications'] as const,
      })
      toast.success('Car deleted successfully.')
    },
    onError: (error) => {
      if (error instanceof CarDeleteBlockedError) {
        toast.warning(
          'This car cannot be deleted because related records exist.'
        )
        return
      }

      toast.error('Failed to delete car.')
    },
  })
}

export type { Car }
