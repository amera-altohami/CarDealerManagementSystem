import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useI18n } from '@/lib/i18n'

export function Overview() {
  const { t } = useI18n()
  const data = [
    { name: t('jan'), total: Math.floor(Math.random() * 5000) + 1000 },
    { name: t('feb'), total: Math.floor(Math.random() * 5000) + 1000 },
    { name: t('mar'), total: Math.floor(Math.random() * 5000) + 1000 },
    { name: t('apr'), total: Math.floor(Math.random() * 5000) + 1000 },
    { name: t('may'), total: Math.floor(Math.random() * 5000) + 1000 },
    { name: t('jun'), total: Math.floor(Math.random() * 5000) + 1000 },
    { name: t('jul'), total: Math.floor(Math.random() * 5000) + 1000 },
    { name: t('aug'), total: Math.floor(Math.random() * 5000) + 1000 },
    { name: t('sep'), total: Math.floor(Math.random() * 5000) + 1000 },
    { name: t('oct'), total: Math.floor(Math.random() * 5000) + 1000 },
    { name: t('nov'), total: Math.floor(Math.random() * 5000) + 1000 },
    { name: t('dec'), total: Math.floor(Math.random() * 5000) + 1000 },
  ]

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
