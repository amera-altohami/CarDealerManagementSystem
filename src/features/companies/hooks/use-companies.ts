import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createCompany,
  deleteCompany,
  getAllCompanies,
  getCompanyById,
  getCompaniesByType,
  getCompanyUsageSummary,
  updateCompany,
  type Company,
  type CreateCompanyData,
  type CompanyUsageSummary,
  type UpdateCompanyData,
} from '@/services/companiesService'
import { getFirestoreErrorMessage } from '@/lib/firebase-errors'
import type { CompanyType } from '../model'

export const companiesQueryKey = ['companies'] as const

export function useCompaniesQuery() {
  return useQuery({
    queryKey: companiesQueryKey,
    queryFn: getAllCompanies,
  })
}

export function useCompanyQuery(companyId: string) {
  return useQuery({
    queryKey: [...companiesQueryKey, companyId] as const,
    queryFn: () => getCompanyById(companyId),
    enabled: Boolean(companyId),
  })
}

export function useCompanyUsageQuery(companyId: string) {
  return useQuery({
    queryKey: [...companiesQueryKey, companyId, 'usage'] as const,
    queryFn: () => getCompanyUsageSummary(companyId),
    enabled: Boolean(companyId),
  })
}

export function useCompaniesByTypeQuery(type: CompanyType) {
  return useQuery({
    queryKey: [...companiesQueryKey, 'type', type] as const,
    queryFn: () => getCompaniesByType(type),
    enabled: Boolean(type),
  })
}

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCompanyData) => createCompany(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: companiesQueryKey })
      toast.success('Company created successfully.')
    },
    onError: (error) => {
      toast.error(getFirestoreErrorMessage(error))
    },
  })
}

export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyData }) =>
      updateCompany(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: companiesQueryKey })
      toast.success('Company updated successfully.')
    },
    onError: (error) => {
      toast.error(getFirestoreErrorMessage(error))
    },
  })
}

export function useDeleteCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: companiesQueryKey })
      toast.success('Company deleted successfully.')
    },
    onError: (error) => {
      if (error instanceof Error && error.message === 'company-delete-blocked') {
        toast.error(
          'This company cannot be deleted because it has linked records.'
        )
        return
      }

      toast.error(getFirestoreErrorMessage(error))
    },
  })
}

export type { Company }
export type { CompanyUsageSummary }
