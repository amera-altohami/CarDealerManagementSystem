import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createPart,
  deletePart,
  getPartById,
  getParts,
  getPartsSummary,
  PartDeleteBlockedError,
  PartNotFoundError,
  PartValidationError,
  updatePart,
  type CreatePartData,
  type PartFilters,
  type UpdatePartData,
} from '@/services/partsService'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'

export const partsQueryKey = ['parts'] as const

function getPartErrorMessage(error: unknown) {
  if (error instanceof PartValidationError) {
    return error.issues[0] ?? 'Part data is invalid.'
  }

  if (error instanceof PartNotFoundError) {
    return error.message
  }

  return getFirestoreErrorMessage(error)
}

export function usePartsQuery(filters: PartFilters = {}) {
  return useQuery({
    queryKey: [...partsQueryKey, filters] as const,
    queryFn: () => getParts(filters),
  })
}

export function usePartsSummaryQuery(filters: PartFilters = {}) {
  return useQuery({
    queryKey: [...partsQueryKey, 'summary', filters] as const,
    queryFn: () => getPartsSummary(filters),
  })
}

export function usePartQuery(partId: string) {
  return useQuery({
    queryKey: [...partsQueryKey, partId] as const,
    queryFn: () => getPartById(partId),
    enabled: Boolean(partId),
  })
}

export function useCreatePartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePartData) => createPart(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: partsQueryKey })
      toast.success('Part added successfully.')
    },
    onError: (error) => {
      toast.error(getPartErrorMessage(error))
    },
  })
}

export function useUpdatePartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartData }) =>
      updatePart(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: partsQueryKey })
      toast.success('Part updated successfully.')
    },
    onError: (error) => {
      toast.error(getPartErrorMessage(error))
    },
  })
}

export function useDeletePartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePart(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: partsQueryKey })
      toast.success('Part deleted successfully.')
    },
    onError: (error) => {
      if (error instanceof PartDeleteBlockedError) {
        toast.warning(
          'This part cannot be deleted because it is currently in use.'
        )
        return
      }

      toast.error(getPartErrorMessage(error))
    },
  })
}
