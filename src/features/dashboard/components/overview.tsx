import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useI18n } from '@/lib/i18n'

const seededValue = (seed: number, min: number, span: number) => {
  const x = Math.sin(seed * 9973) * 10000
  return min + Math.floor((x - Math.floor(x)) * span)
}

export function Overview() {
  const { t } = useI18n()
  const data = useMemo(
    () => [
      { name: t('jan'), total: seededValue(1, 1000, 5000) },
      { name: t('feb'), total: seededValue(2, 1000, 5000) },
      { name: t('mar'), total: seededValue(3, 1000, 5000) },
      { name: t('apr'), total: seededValue(4, 1000, 5000) },
      { name: t('may'), total: seededValue(5, 1000, 5000) },
      { name: t('jun'), total: seededValue(6, 1000, 5000) },
      { name: t('jul'), total: seededValue(7, 1000, 5000) },
      { name: t('aug'), total: seededValue(8, 1000, 5000) },
      { name: t('sep'), total: seededValue(9, 1000, 5000) },
      { name: t('oct'), total: seededValue(10, 1000, 5000) },
      { name: t('nov'), total: seededValue(11, 1000, 5000) },
      { name: t('dec'), total: seededValue(12, 1000, 5000) },
    ],
    [t]
  )

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          direction='ltr'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
