'use client'
import { ArrowLeftRight } from 'lucide-react'
import { MolduraTabela, VazioLista } from '@/components/admin/lista/estados'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, label } from '@/lib/format'
import type { Movement } from './types'

export function MovementsList({ movements }: { movements: Movement[] }) {
  if (movements.length === 0) {
    return <VazioLista icone={ArrowLeftRight} titulo="Nenhuma movimentação registrada" />
  }
  return (
    <MolduraTabela rotulo="Últimas movimentações do estoque">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="hidden sm:table-cell">Tipo</TableHead>
            <TableHead className="text-right sm:text-left">Quantidade</TableHead>
            <TableHead className="hidden md:table-cell">Motivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{formatDate(m.date)}</TableCell>
              <TableCell className="max-w-48 whitespace-normal">
                <p className="font-semibold text-(--ant-tinta)">{m.item ? m.item.name : '—'}</p>
                <p className="line-clamp-1 text-xs text-(--ant-tinta-suave) md:hidden">{m.reason}</p>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant={m.type === 'entrada' ? 'secondary' : 'outline'}>{label(m.type)}</Badge>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap sm:text-left">
                <span className="sm:hidden">{m.type === 'entrada' ? '+ ' : '- '}</span>
                {Number(m.quantity).toLocaleString('pt-BR')} {m.item?.unit ?? ''}
                <span className="sr-only sm:hidden"> ({label(m.type)})</span>
              </TableCell>
              <TableCell className="hidden max-w-64 whitespace-normal md:table-cell">{m.reason || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MolduraTabela>
  )
}
