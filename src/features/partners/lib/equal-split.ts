import type { Car } from '@/services/carsService'
import type { Partner, ProfitShare } from '../data/schema'

export type EqualSplitRow = {
  partnerId: string
  carId: string
  carName: string
  contributionAmount: number
  investmentPercentage: number
  carCost: number
  sellingPrice: number
  netProfit: number
  partnerProfitShare: number
  status: ProfitShare['status']
}

export function getEqualSplitPartnerCount(partners: Partner[]) {
  return partners.length
}

export function getEqualSplitPercentage(partnerCount: number) {
  return partnerCount > 0 ? Number((100 / partnerCount).toFixed(2)) : 0
}

export function buildEqualSplitRows(
  partners: Partner[],
  cars: Car[]
): EqualSplitRow[] {
  const partnerCount = getEqualSplitPartnerCount(partners)

  if (partnerCount === 0 || cars.length === 0) {
    return []
  }

  const partnerPercentage = getEqualSplitPercentage(partnerCount)

  return cars.flatMap((car) => {
    const carCost = car.purchasePrice
    const netProfit = car.sellingPrice - carCost
    const contributionAmount = carCost / partnerCount
    const partnerProfitShare = netProfit / partnerCount
    const status: ProfitShare['status'] =
      netProfit < 0 ? 'Loss' : car.status === 'sold' ? 'Paid' : 'Pending'

    return partners.map((partner) => ({
      partnerId: partner.id,
      carId: car.id,
      carName: `${car.brand} ${car.model} ${car.year}`,
      contributionAmount,
      investmentPercentage: partnerPercentage,
      carCost,
      sellingPrice: car.sellingPrice,
      netProfit,
      partnerProfitShare,
      status,
    }))
  })
}

export function calculateEqualSplitPartnerTotals(
  partners: Partner[],
  cars: Car[]
) {
  const partnerCount = getEqualSplitPartnerCount(partners)
  const partnerPercentage = getEqualSplitPercentage(partnerCount)

  if (partnerCount === 0) {
    return {
      investmentPercentage: 0,
      totalContribution: 0,
      totalProfit: 0,
      totalLoss: 0,
      finalBalance: 0,
    }
  }

  const partnerContributionPerCar = cars.reduce(
    (sum, car) => sum + car.purchasePrice / partnerCount,
    0
  )
  const totalProfit = cars.reduce((sum, car) => {
    const netProfit = car.sellingPrice - car.purchasePrice
    return netProfit > 0 ? sum + netProfit / partnerCount : sum
  }, 0)
  const totalLoss = cars.reduce((sum, car) => {
    const netProfit = car.sellingPrice - car.purchasePrice
    return netProfit < 0 ? sum + Math.abs(netProfit / partnerCount) : sum
  }, 0)

  return {
    investmentPercentage: partnerPercentage,
    totalContribution: partnerContributionPerCar,
    totalProfit,
    totalLoss,
    finalBalance: partnerContributionPerCar + totalProfit - totalLoss,
  }
}
