'use client'

// Receitas x despesas dos últimos 6 meses.
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatMoney } from '@/lib/format'
import type { Dashboard } from '@/app/api/dashboard/route'
import { compactMoney, MoneyTooltip } from './chart-tooltip'
import { monthLabel, monthLongLabel } from './format'

const config = {
  receitas: { label: 'Receitas', color: 'var(--chart-1)' },
  despesas: { label: 'Despesas', color: 'var(--chart-2)' },
} satisfies ChartConfig

type FinanceiroPorMes = NonNullable<Dashboard['financeiro']>['porMes']

export function FinanceChart({ data }: { data: FinanceiroPorMes }) {
  const rows = data.map((mes) => ({ ...mes, mesLabel: monthLabel(mes.mes) }))
  const resumo = data
    .map(
      (mes) =>
        `${monthLongLabel(mes.mes)}: receitas ${formatMoney(mes.receitas)} e despesas ${formatMoney(mes.despesas)}`,
    )
    .join('; ')

  return (
    <div className="space-y-2">
      <ChartContainer
        config={config}
        className="aspect-auto h-[260px] w-full"
        role="img"
        aria-label={`Gráfico de barras com receitas e despesas dos últimos 6 meses. ${resumo}.`}
      >
        <BarChart data={rows} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="mesLabel" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={compactMoney} />
          <ChartTooltip content={<MoneyTooltip />} cursor={false} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="receitas" fill="var(--color-receitas)" radius={4} />
          <Bar dataKey="despesas" fill="var(--color-despesas)" radius={4} />
        </BarChart>
      </ChartContainer>

      <table className="sr-only">
        <caption>Receitas e despesas por mês</caption>
        <thead>
          <tr>
            <th scope="col">Mês</th>
            <th scope="col">Receitas</th>
            <th scope="col">Despesas</th>
          </tr>
        </thead>
        <tbody>
          {data.map((mes) => (
            <tr key={mes.mes}>
              <th scope="row">{monthLongLabel(mes.mes)}</th>
              <td>{formatMoney(mes.receitas)}</td>
              <td>{formatMoney(mes.despesas)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
