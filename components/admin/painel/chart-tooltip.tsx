'use client'

// Tooltip dos gráficos do painel: valores em reais e o nome da série.
import { formatMoney } from '@/lib/format'

type TooltipItem = {
  name?: string | number
  dataKey?: string | number
  value?: string | number
  color?: string
}

export function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipItem[]
  label?: string | number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      <ul className="space-y-1">
        {payload.map((item) => (
          <li key={String(item.dataKey)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              {item.name}
            </span>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {formatMoney(Number(item.value ?? 0))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Eixo Y compacto: 1.500 → "1,5k". */
export function compactMoney(value: number) {
  return value >= 1000
    ? `${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`
    : String(value)
}
