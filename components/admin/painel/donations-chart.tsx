'use client'

// Doações recebidas por mês (últimos 6 meses).
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { formatMoney } from '@/lib/format'
import type { Dashboard } from '@/app/api/dashboard/route'
import { compactMoney, MoneyTooltip } from './chart-tooltip'
import { monthLabel, monthLongLabel } from './format'

const config = {
  total: { label: 'Doações', color: 'var(--chart-3)' },
} satisfies ChartConfig

type DoacoesPorMes = NonNullable<Dashboard['doacoes']>['porMes']

export function DonationsChart({ data }: { data: DoacoesPorMes }) {
  const rows = data.map((mes) => ({ ...mes, mesLabel: monthLabel(mes.mes) }))
  const resumo = data.map((mes) => `${monthLongLabel(mes.mes)}: ${formatMoney(mes.total)}`).join('; ')

  return (
    <div className="space-y-2">
      <ChartContainer
        config={config}
        className="aspect-auto h-[260px] w-full"
        role="img"
        aria-label={`Gráfico de barras com o total de doações recebidas por mês. ${resumo}.`}
      >
        <BarChart data={rows} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="mesLabel" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={compactMoney} />
          <ChartTooltip content={<MoneyTooltip />} cursor={false} />
          <Bar dataKey="total" fill="var(--color-total)" radius={4} />
        </BarChart>
      </ChartContainer>

      <table className="sr-only">
        <caption>Doações recebidas por mês</caption>
        <thead>
          <tr>
            <th scope="col">Mês</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((mes) => (
            <tr key={mes.mes}>
              <th scope="row">{monthLongLabel(mes.mes)}</th>
              <td>{formatMoney(mes.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
