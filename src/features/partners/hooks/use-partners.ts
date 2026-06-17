import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCars } from '@/services/carsService'
import {
  createContribution,
  deleteContribution,
  getContributionById,
  getContributionsByCarId,
  getContributionsByPartnerId,
  getPartnerContributions,
  updateContribution,
  ContributionDeleteBlockedError,
  type CreatePartnerContributionData,
  type UpdatePartnerContributionData,
} from '@/services/partnerContributionsService'
import {
  createPartner,
  deletePartner,
  getActivePartners,
  getPartnerById,
  getPartners,
  updatePartner,
  PartnerDeleteBlockedError,
  type CreatePartnerData,
  type UpdatePartnerData,
} from '@/services/partnersService'
import {
  createProfitShare,
  deleteProfitShare,
  getProfitShareById,
  getProfitShares,
  getProfitSharesByCarId,
  getProfitSharesByPartnerId,
  updateProfitShare,
  type CreateProfitShareData,
  type UpdateProfitShareData,
} from '@/services/profitSharesService'
import { toast } from 'sonner'

export const partnersQueryKey = ['partners'] as const
export const contributionsQueryKey = ['partner-contributions'] as const
export const profitSharesQueryKey = ['profit-shares'] as const
export const partnerCarsQueryKey = ['partners', 'cars'] as const

function invalidateInvestmentQueries(
  queryClient: ReturnType<typeof useQueryClient>
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: partnersQueryKey }),
    queryClient.invalidateQueries({ queryKey: contributionsQueryKey }),
    queryClient.invalidateQueries({ queryKey: profitSharesQueryKey }),
  ])
}

export function usePartnersQuery() {
  return useQuery({
    queryKey: partnersQueryKey,
    queryFn: getPartners,
  })
}

export function usePartnerQuery(partnerId: string) {
  return useQuery({
    queryKey: [...partnersQueryKey, partnerId] as const,
    queryFn: () => getPartnerById(partnerId),
    enabled: Boolean(partnerId),
  })
}

export function useActivePartnersQuery() {
  return useQuery({
    queryKey: [...partnersQueryKey, 'active'] as const,
    queryFn: getActivePartners,
  })
}

export function usePartnerContributionsQuery() {
  return useQuery({
    queryKey: contributionsQueryKey,
    queryFn: getPartnerContributions,
  })
}

export function usePartnerContributionQuery(contributionId: string) {
  return useQuery({
    queryKey: [...contributionsQueryKey, contributionId] as const,
    queryFn: () => getContributionById(contributionId),
    enabled: Boolean(contributionId),
  })
}

export function useContributionsByPartnerQuery(partnerId: string) {
  return useQuery({
    queryKey: [...contributionsQueryKey, 'partner', partnerId] as const,
    queryFn: () => getContributionsByPartnerId(partnerId),
    enabled: Boolean(partnerId),
  })
}

export function useContributionsByCarQuery(carId: string) {
  return useQuery({
    queryKey: [...contributionsQueryKey, 'car', carId] as const,
    queryFn: () => getContributionsByCarId(carId),
    enabled: Boolean(carId),
  })
}

export function useProfitSharesQuery() {
  return useQuery({
    queryKey: profitSharesQueryKey,
    queryFn: getProfitShares,
  })
}

export function useProfitShareQuery(profitShareId: string) {
  return useQuery({
    queryKey: [...profitSharesQueryKey, profitShareId] as const,
    queryFn: () => getProfitShareById(profitShareId),
    enabled: Boolean(profitShareId),
  })
}

export function useProfitSharesByPartnerQuery(partnerId: string) {
  return useQuery({
    queryKey: [...profitSharesQueryKey, 'partner', partnerId] as const,
    queryFn: () => getProfitSharesByPartnerId(partnerId),
    enabled: Boolean(partnerId),
  })
}

export function useProfitSharesByCarQuery(carId: string) {
  return useQuery({
    queryKey: [...profitSharesQueryKey, 'car', carId] as const,
    queryFn: () => getProfitSharesByCarId(carId),
    enabled: Boolean(carId),
  })
}

export function usePartnerCarsQuery() {
  return useQuery({
    queryKey: partnerCarsQueryKey,
    queryFn: getCars,
  })
}

export function useCreatePartnerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePartnerData) => createPartner(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: partnersQueryKey })
      toast.success('Partner added successfully.')
    },
    onError: () => {
      toast.error('Failed to save partner.')
    },
  })
}

export function useUpdatePartnerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerData }) =>
      updatePartner(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: partnersQueryKey })
      toast.success('Partner updated successfully.')
    },
    onError: () => {
      toast.error('Failed to save partner.')
    },
  })
}

export function useDeletePartnerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePartner(id),
    onSuccess: async () => {
      await invalidateInvestmentQueries(queryClient)
      toast.success('Partner deleted successfully.')
    },
    onError: (error) => {
      if (error instanceof PartnerDeleteBlockedError) {
        toast.warning(
          'This partner cannot be deleted because related investment records exist.'
        )
        return
      }

      toast.error('Failed to delete partner.')
    },
  })
}

export function useCreateContributionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePartnerContributionData) =>
      createContribution(data),
    onSuccess: async () => {
      await invalidateInvestmentQueries(queryClient)
      toast.success('Contribution added successfully.')
    },
    onError: () => {
      toast.error('Failed to save contribution.')
    },
  })
}

export function useUpdateContributionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdatePartnerContributionData
    }) => updateContribution(id, data),
    onSuccess: async () => {
      await invalidateInvestmentQueries(queryClient)
      toast.success('Contribution updated successfully.')
    },
    onError: () => {
      toast.error('Failed to save contribution.')
    },
  })
}

export function useDeleteContributionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteContribution(id),
    onSuccess: async () => {
      await invalidateInvestmentQueries(queryClient)
      toast.success('Contribution deleted successfully.')
    },
    onError: (error) => {
      if (error instanceof ContributionDeleteBlockedError) {
        toast.warning(
          'This contribution cannot be deleted because related profit share records exist.'
        )
        return
      }

      toast.error('Failed to delete contribution.')
    },
  })
}

export function useCreateProfitShareMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProfitShareData) => createProfitShare(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profitSharesQueryKey })
    },
    onError: () => {
      toast.error('Failed to load profit shares.')
    },
  })
}

export function useUpdateProfitShareMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfitShareData }) =>
      updateProfitShare(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profitSharesQueryKey })
    },
    onError: () => {
      toast.error('Failed to load profit shares.')
    },
  })
}

export function useDeleteProfitShareMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProfitShare(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profitSharesQueryKey })
    },
    onError: () => {
      toast.error('Failed to load profit shares.')
    },
  })
}
