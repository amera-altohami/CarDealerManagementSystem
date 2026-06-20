import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import { carsQueryKey } from './use-cars'
import {
  CarTitleHistoryDeleteBlockedError,
  CarTitleHistoryNotFoundError,
  CarTitleHistoryValidationError,
  create as createTitleHistory,
  delete as deleteTitleHistory,
  getAll as getTitleHistory,
  getById as getTitleHistoryById,
  getCurrentCarTitleState,
  getLatestTitleHistoryByCarId,
  update as updateTitleHistory,
  type CarTitleHistory,
  type CarTitleHistoryFilters,
  type CreateCarTitleHistoryData,
  type UpdateCarTitleHistoryData,
} from '@/services/titleHistoryService'

export const titleHistoryQueryKey = ['title-history'] as const

function getTitleHistoryErrorMessage(error: unknown) {
  if (error instanceof CarTitleHistoryValidationError) {
    return error.issues[0] ?? 'Title record data is invalid.'
  }

  if (error instanceof CarTitleHistoryNotFoundError) {
    return error.message
  }

  return getFirestoreErrorMessage(error)
}

export function useTitleHistoryQuery(filters: CarTitleHistoryFilters = {}) {
  return useQuery({
    queryKey: [...titleHistoryQueryKey, filters] as const,
    queryFn: () => getTitleHistory(filters),
  })
}

export function useTitleHistoryRecordQuery(titleHistoryId: string) {
  return useQuery({
    queryKey: [...titleHistoryQueryKey, titleHistoryId] as const,
    queryFn: () => getTitleHistoryById(titleHistoryId),
    enabled: Boolean(titleHistoryId),
  })
}

export function useLatestTitleHistoryQuery(carId: string) {
  return useQuery({
    queryKey: [...titleHistoryQueryKey, 'latest', carId] as const,
    queryFn: () => getLatestTitleHistoryByCarId(carId),
    enabled: Boolean(carId),
  })
}

export function useCurrentCarTitleStateQuery(carId: string) {
  return useQuery({
    queryKey: [...titleHistoryQueryKey, 'current', carId] as const,
    queryFn: () => getCurrentCarTitleState(carId),
    enabled: Boolean(carId),
  })
}

export function useCreateTitleHistoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCarTitleHistoryData) => createTitleHistory(data),
    onSuccess: async (record) => {
      await queryClient.invalidateQueries({ queryKey: titleHistoryQueryKey })
      await queryClient.invalidateQueries({
        queryKey: [...titleHistoryQueryKey, 'current', record.carId] as const,
      })
      await queryClient.invalidateQueries({ queryKey: carsQueryKey })
      await queryClient.invalidateQueries({
        queryKey: [...carsQueryKey, record.carId] as const,
      })
      await queryClient.invalidateQueries({
        queryKey: ['notifications'] as const,
      })
      toast.success('Title updated successfully.')
    },
    onError: (error) => {
      toast.error(getTitleHistoryErrorMessage(error))
    },
  })
}

export function useUpdateTitleHistoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCarTitleHistoryData }) =>
      updateTitleHistory(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: titleHistoryQueryKey })
      await queryClient.invalidateQueries({ queryKey: carsQueryKey })
      await queryClient.invalidateQueries({
        queryKey: ['notifications'] as const,
      })
      toast.success('Title updated successfully.')
    },
    onError: (error) => {
      toast.error(getTitleHistoryErrorMessage(error))
    },
  })
}

export function useDeleteTitleHistoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTitleHistory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: titleHistoryQueryKey })
      await queryClient.invalidateQueries({ queryKey: carsQueryKey })
      await queryClient.invalidateQueries({
        queryKey: ['notifications'] as const,
      })
      toast.success('Title record deleted successfully.')
    },
    onError: (error) => {
      if (error instanceof CarTitleHistoryDeleteBlockedError) {
        toast.warning(
          'This title record cannot be deleted because it is currently in use.'
        )
        return
      }

      toast.error(getTitleHistoryErrorMessage(error))
    },
  })
}

export type { CarTitleHistory }
