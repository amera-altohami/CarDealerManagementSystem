import { carsMockData, formatCarName, type Car } from '@/data/carsMockData'
import {
  type Partner,
  type PartnerContribution,
  type ProfitShare,
} from './schema'

type PartnerSeed = Omit<
  Partner,
  | 'investmentPercentage'
  | 'totalContribution'
  | 'totalProfit'
  | 'totalLoss'
  | 'finalBalance'
>

const partnerSeeds: PartnerSeed[] = [
  {
    id: 'partner-001',
    name: 'North Yard Partners',
    email: 'northyard@example.com',
    phone: '+1 (214) 555-0177',
    status: 'Active',
    notes: 'Primary investor for Toyota and domestic inventory.',
    createdAt: '2026-01-08',
  },
  {
    id: 'partner-002',
    name: 'Alpha Capital',
    email: 'alpha.capital@example.com',
    phone: '+1 (312) 555-0190',
    status: 'Active',
    notes: 'Prefers clean title sedans and fast-turnover vehicles.',
    createdAt: '2026-01-19',
  },
  {
    id: 'partner-003',
    name: 'Premium Auto Fund',
    email: 'premium.fund@example.com',
    phone: '+1 (602) 555-0144',
    status: 'Active',
    notes: 'Focused on premium and luxury inventory.',
    createdAt: '2026-02-04',
  },
  {
    id: 'partner-004',
    name: 'Luxury Fleet Partners',
    email: 'fleet@example.com',
    phone: '+1 (213) 555-0121',
    status: 'Active',
    notes: 'Large partner on higher-ticket purchases.',
    createdAt: '2026-03-02',
  },
  {
    id: 'partner-005',
    name: 'Workshop Team',
    email: 'workshop@example.com',
    phone: '+1 (404) 555-0119',
    status: 'Inactive',
    notes: 'Small operational partner for repair-heavy cars.',
    createdAt: '2026-03-12',
  },
]

type PartnerContributionSeed = Omit<PartnerContribution, 'investmentPercentage'>

const fallbackCarCosts: Record<string, number> = {
  'mock-loss-001': 8500,
}

function findCar(carId: string): Car | undefined {
  return carsMockData.find((car) => car.id === carId)
}

function getCarInvestmentBase(carId: string) {
  const car = findCar(carId)

  return car?.totalCost ?? fallbackCarCosts[carId] ?? 0
}

export function calculateContributionPercentage(
  carId: string,
  contributionAmount: number
) {
  const investmentBase = getCarInvestmentBase(carId)

  if (investmentBase <= 0) {
    return 0
  }

  return Number(((contributionAmount / investmentBase) * 100).toFixed(2))
}

const partnerContributionSeeds: PartnerContributionSeed[] = [
  {
    id: 'contribution-001',
    partnerId: 'partner-001',
    carId: 'car-001',
    carName: 'Toyota Camry 2020',
    contributionAmount: 4800,
    contributionDate: '2026-03-18',
    paymentMethod: 'Zelle',
    notes: 'Initial purchase contribution.',
  },
  {
    id: 'contribution-002',
    partnerId: 'partner-001',
    carId: 'car-004',
    carName: 'Ford Explorer 2018',
    contributionAmount: 5400,
    contributionDate: '2025-12-09',
    paymentMethod: 'Bank Transfer',
    notes: 'Funded part of purchase and shipping.',
  },
  {
    id: 'contribution-003',
    partnerId: 'partner-002',
    carId: 'car-002',
    carName: 'Honda Civic 2019',
    contributionAmount: 6200,
    contributionDate: '2026-04-02',
    paymentMethod: 'Cash',
    notes: 'Clean title sedan investment.',
  },
  {
    id: 'contribution-004',
    partnerId: 'partner-003',
    carId: 'car-003',
    carName: 'BMW X5 2021',
    contributionAmount: 14000,
    contributionDate: '2026-02-14',
    paymentMethod: 'Bank Transfer',
    notes: 'Luxury inventory purchase contribution.',
  },
  {
    id: 'contribution-005',
    partnerId: 'partner-004',
    carId: 'car-005',
    carName: 'Mercedes-Benz C-Class 2022',
    contributionAmount: 29300,
    contributionDate: '2026-05-11',
    paymentMethod: 'Bank Transfer',
    notes: 'Large capital allocation for new purchase.',
  },
  {
    id: 'contribution-006',
    partnerId: 'partner-005',
    carId: 'car-001',
    carName: 'Toyota Camry 2020',
    contributionAmount: 1600,
    contributionDate: '2026-03-21',
    paymentMethod: 'Card',
    notes: 'Workshop contribution toward repair budget.',
  },
  {
    id: 'contribution-007',
    partnerId: 'partner-005',
    carId: 'mock-loss-001',
    carName: 'Ford Fusion 2018',
    contributionAmount: 4250,
    contributionDate: '2026-01-10',
    paymentMethod: 'Other',
    notes: 'Legacy mock record used to show loss handling.',
  },
]

export const partnerContributionsMock: PartnerContribution[] =
  partnerContributionSeeds.map((contribution) => ({
    ...contribution,
    investmentPercentage: calculateContributionPercentage(
      contribution.carId,
      contribution.contributionAmount
    ),
  }))

export function createProfitShareFromContribution(
  contribution: PartnerContribution
): ProfitShare {
  const car = findCar(contribution.carId)
  const profitShareId = `profit-${contribution.id.replace('contribution-', '')}`

  if (!car) {
    const carCost = 8500
    const sellingPrice = 8000
    const netProfit = sellingPrice - carCost

    return {
      id: profitShareId,
      partnerId: contribution.partnerId,
      carId: contribution.carId,
      carName: contribution.carName,
      carCost,
      sellingPrice,
      netProfit,
      partnerPercentage: contribution.investmentPercentage,
      partnerProfitShare: (netProfit * contribution.investmentPercentage) / 100,
      status: 'Loss',
    }
  }

  const netProfit = car.sellingPrice - car.totalCost

  return {
    id: profitShareId,
    partnerId: contribution.partnerId,
    carId: contribution.carId,
    carName: formatCarName(car),
    carCost: car.totalCost,
    sellingPrice: car.sellingPrice,
    netProfit,
    partnerPercentage: contribution.investmentPercentage,
    partnerProfitShare: (netProfit * contribution.investmentPercentage) / 100,
    status: netProfit < 0 ? 'Loss' : car.status === 'sold' ? 'Paid' : 'Pending',
  }
}

export const profitSharesMock: ProfitShare[] = partnerContributionsMock.map(
  createProfitShareFromContribution
)

export function calculatePartnerTotals(
  partnerId: string,
  contributions: PartnerContribution[] = partnerContributionsMock,
  profitShares: ProfitShare[] = profitSharesMock
) {
  const partnerContributions = contributions.filter(
    (contribution) => contribution.partnerId === partnerId
  )
  const partnerProfitShares = profitShares.filter(
    (profitShare) => profitShare.partnerId === partnerId
  )
  const totalContribution = partnerContributions.reduce(
    (sum, contribution) => sum + contribution.contributionAmount,
    0
  )
  const totalInvestmentBase = partnerContributions.reduce(
    (sum, contribution) => sum + getCarInvestmentBase(contribution.carId),
    0
  )
  const investmentPercentage =
    totalInvestmentBase > 0
      ? Number(((totalContribution / totalInvestmentBase) * 100).toFixed(2))
      : 0
  const totalProfit = partnerProfitShares.reduce(
    (sum, profitShare) =>
      profitShare.partnerProfitShare > 0
        ? sum + profitShare.partnerProfitShare
        : sum,
    0
  )
  const totalLoss = partnerProfitShares.reduce(
    (sum, profitShare) =>
      profitShare.partnerProfitShare < 0
        ? sum + Math.abs(profitShare.partnerProfitShare)
        : sum,
    0
  )

  return {
    investmentPercentage,
    totalContribution,
    totalProfit,
    totalLoss,
    finalBalance: totalContribution + totalProfit - totalLoss,
  }
}

export function buildPartnersList(
  contributions: PartnerContribution[] = partnerContributionsMock,
  profitShares: ProfitShare[] = profitSharesMock
): Partner[] {
  return partnerSeeds.map((partner) => ({
    ...partner,
    ...calculatePartnerTotals(partner.id, contributions, profitShares),
  }))
}

export const partnersMockData: Partner[] = buildPartnersList()

export function getPartnerById(partnerId: string) {
  return partnersMockData.find((partner) => partner.id === partnerId)
}

export function getPartnerContributions(partnerId: string) {
  return partnerContributionsMock.filter(
    (contribution) => contribution.partnerId === partnerId
  )
}

export function getPartnerProfitShares(partnerId: string) {
  return profitSharesMock.filter(
    (profitShare) => profitShare.partnerId === partnerId
  )
}
