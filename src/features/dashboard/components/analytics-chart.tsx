import { useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useI18n } from '@/lib/i18n'

const seededValue = (seed: number, min: number, span: number) => {
  const x = Math.sin(seed * 9973) * 10000
  return min + Math.floor((x - Math.floor(x)) * span)
}

export function AnalyticsChart() {
  const { t } = useI18n()
  const data = useMemo(
    () => [
      { name: t('mon'), clicks: seededValue(1, 100, 900), uniques: seededValue(11, 80, 700) },
      { name: t('tue'), clicks: seededValue(2, 100, 900), uniques: seededValue(12, 80, 700) },
      { name: t('wed'), clicks: seededValue(3, 100, 900), uniques: seededValue(13, 80, 700) },
      { name: t('thu'), clicks: seededValue(4, 100, 900), uniques: seededValue(14, 80, 700) },
      { name: t('fri'), clicks: seededValue(5, 100, 900), uniques: seededValue(15, 80, 700) },
      { name: t('sat'), clicks: seededValue(6, 100, 900), uniques: seededValue(16, 80, 700) },
      { name: t('sun'), clicks: seededValue(7, 100, 900), uniques: seededValue(17, 80, 700) },
    ],
    [t]
  )

  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Area
          type='monotone'
          dataKey='clicks'
          stroke='currentColor'
          className='text-primary'
          fill='currentColor'
          fillOpacity={0.15}
        />
        <Area
          type='monotone'
          dataKey='uniques'
          stroke='currentColor'
          className='text-muted-foreground'
          fill='currentColor'
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
