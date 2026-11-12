'use client'

// Cartões de resumo do período (Receitas, Despesas e Saldo).
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'
import type { TransactionsSummary } from './types'

export function SummaryCards({ summary }: { summary: TransactionsSummary }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card className="gap-2 py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Receitas</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <p className="text-2xl font-bold text-emerald-600">{formatMoney(summary.receitas)}</p>
        </CardContent>
      </Card>

      <Card className="gap-2 py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <p className="text-2xl font-bold text-destructive">{formatMoney(summary.despesas)}</p>
        </CardContent>
      </Card>

      <Card className="gap-2 py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Saldo do período</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <p
            className={`text-2xl font-bold ${
              summary.saldo >= 0 ? 'text-emerald-600' : 'text-destructive'
            }`}
          >
            {formatMoney(summary.saldo)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
