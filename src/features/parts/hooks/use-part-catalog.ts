import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import {
  createPartCatalogItem,
  deletePartCatalogItem,
  getPartCatalog,
  restoreDefaultPartCatalog,
  type CreatePartCatalogData,
} from '@/services/partCatalogService'
import { type PartCatalogItem } from '../components/part-catalog-data'

export const partCatalogQueryKey = ['part-catalog'] as const

export function usePartCatalogQuery() {
  return useQuery({
    queryKey: partCatalogQueryKey,
    queryFn: getPartCatalog,
  })
}

export function useCreatePartCatalogMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePartCatalogData) => createPartCatalogItem(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: partCatalogQueryKey })
      toast.success('Part list updated successfully.')
    },
    onError: (error) => {
      toast.error(getFirestoreErrorMessage(error))
    },
  })
}

export function useDeletePartCatalogMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePartCatalogItem(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: partCatalogQueryKey })
      toast.success('Part deleted successfully.')
    },
    onError: (error) => {
      toast.error(getFirestoreErrorMessage(error))
    },
  })
}

export function useRestorePartCatalogMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: restoreDefaultPartCatalog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: partCatalogQueryKey })
      toast.success('Default parts restored.')
    },
    onError: (error) => {
      toast.error(getFirestoreErrorMessage(error))
    },
  })
}

export function usePartCatalog() {
  const catalogQuery = usePartCatalogQuery()
  const createMutation = useCreatePartCatalogMutation()
  const deleteMutation = useDeletePartCatalogMutation()
  const restoreMutation = useRestorePartCatalogMutation()

  return {
    catalog: (catalogQuery.data ?? []) as PartCatalogItem[],
    isLoading: catalogQuery.isLoading,
    isError: catalogQuery.isError,
    error: catalogQuery.error,
    createPartCatalogItem: createMutation.mutateAsync,
    deletePartCatalogItem: deleteMutation.mutateAsync,
    restoreDefaultPartCatalog: restoreMutation.mutateAsync,
  }
}

