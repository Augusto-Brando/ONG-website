'use client'

// Itens com saldo abaixo do estoque mínimo.
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Dashboard } from '@/app/api/dashboard/route'

type Item = NonNullable<Dashboard['estoque']>['abaixoDoMinimo'][number]

const numero = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

export function LowStockList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Nenhum item abaixo do mínimo.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Mínimo</TableHead>
            <TableHead className="text-right">Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="font-mono tabular-nums">
                {numero(item.quantity)} {item.unit}
              </TableCell>
              <TableCell className="font-mono tabular-nums text-muted-foreground">
                {numero(item.minQuantity)} {item.unit}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="destructive">Repor</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
