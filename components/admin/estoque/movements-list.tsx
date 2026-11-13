'use client'

// Lista das últimas movimentações do estoque (mais recentes primeiro).
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, label } from '@/lib/format'
import type { Movement } from './types'

export function MovementsList({ movements }: { movements: Movement[] }) {
  if (movements.length === 0) {
    return <p className="py-10 text-center text-muted-foreground">Nenhuma movimentação registrada.</p>
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Motivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{formatDate(m.date)}</TableCell>
              <TableCell className="font-medium">{m.item ? m.item.name : '—'}</TableCell>
              <TableCell>
                <Badge variant={m.type === 'entrada' ? 'secondary' : 'outline'}>{label(m.type)}</Badge>
              </TableCell>
              <TableCell>
                {Number(m.quantity).toLocaleString('pt-BR')} {m.item?.unit ?? ''}
              </TableCell>
              <TableCell>{m.reason || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}