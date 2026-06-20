import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import {
  create as createInspection,
  canDeleteInspection,
  delete as deleteInspection,
  getAll as getInspections,
  getById as getInspectionById,
  getInspectionSummary,
  getInspectionsPage,
  InspectionDeleteBlockedError,
  InspectionNotFoundError,
  InspectionValidationError,
  update as updateInspection,
  type CreateInspectionData,
  type Inspection,
  type InspectionFilters,
  type UpdateInspectionData,
} from '@/services/inspectionsService'
import { carsQueryKey } from '@/features/cars/hooks/use-cars'
import { titleHistoryQueryKey } from '@/features/cars/hooks/use-title-history'

export const inspectionsQueryKey = ['inspections'] as const

function getInspectionErrorMessage(error: unknown) {
  if (error instanceof InspectionValidationError) {
    return error.issues[0] ?? 'Inspection data is invalid.'
  }

  if (error instanceof InspectionNotFoundError) {
    return error.message
  }

  return getFirestoreErrorMessage(error)
}

export function useInspectionsQuery(filters: InspectionFilters = {}) {
  return useQuery({
    queryKey: [...inspectionsQueryKey, filters] as const,
    queryFn: () => getInspections(filters),
  })
}

export function useInspectionQuery(inspectionId: string) {
  return useQuery({
    queryKey: [...inspectionsQueryKey, inspectionId] as const,
    queryFn: () => getInspectionById(inspectionId),
    enabled: Boolean(inspectionId),
  })
}

export function useInspectionsPageQuery(filters: InspectionFilters = {}) {
  return useQuery({
    queryKey: [...inspectionsQueryKey, 'page', filters] as const,
    queryFn: () => getInspectionsPage(filters),
  })
}

export function useInspectionSummaryQuery(filters: InspectionFilters = {}) {
  return useQuery({
    queryKey: [...inspectionsQueryKey, 'summary', filters] as const,
    queryFn: () => getInspectionSummary(filters),
  })
}

export function useInspectionDeleteCheckQuery(inspectionId: string) {
  return useQuery({
    queryKey: [...inspectionsQueryKey, inspectionId, 'delete-check'] as const,
    queryFn: () => canDeleteInspection(inspectionId),
    enabled: Boolean(inspectionId),
  })
}

export function useCreateInspectionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInspectionData) => createInspection(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inspectionsQueryKey })
      await queryClient.invalidateQueries({ queryKey: carsQueryKey })
      await queryClient.invalidateQueries({ queryKey: titleHistoryQueryKey })
      await queryClient.invalidateQueries({
        queryKey: ['notifications'] as const,
      })
      toast.success('Inspection added successfully.')
    },
    onError: (error) => {
      toast.error(getInspectionErrorMessage(error))
    },
  })
}

export function useUpdateInspectionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInspectionData }) =>
      updateInspection(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inspectionsQueryKey })
      await queryClient.invalidateQueries({ queryKey: carsQueryKey })
      await queryClient.invalidateQueries({ queryKey: titleHistoryQueryKey })
      await queryClient.invalidateQueries({
        queryKey: ['notifications'] as const,
      })
      toast.success('Inspection updated successfully.')
    },
    onError: (error) => {
      toast.error(getInspectionErrorMessage(error))
    },
  })
}

export function useDeleteInspectionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteInspection(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inspectionsQueryKey })
      toast.success('Inspection deleted successfully.')
    },
    onError: (error) => {
      if (error instanceof InspectionDeleteBlockedError) {
        toast.warning(
          'This inspection cannot be deleted because it is currently in use.'
        )
        return
      }

      toast.error(getInspectionErrorMessage(error))
    },
  })
}

export type { Inspection }
