'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { MolduraTabela } from '@/components/admin/lista/estados'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatMoney, label } from '@/lib/format'
import type { TransactionRow } from './types'

export function TransactionTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: TransactionRow[]
  onEdit: (row: TransactionRow) => void
  onDelete: (row: TransactionRow) => void
}) {
  return (
    <MolduraTabela rotulo="Lista de lançamentos">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Lançamento</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead className="hidden lg:table-cell">Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap">{formatDate(row.date)}</TableCell>
              <TableCell className="max-w-64 whitespace-normal">
                <p className="line-clamp-2 font-semibold text-(--ant-tinta)">{row.description || label(row.category)}</p>
                <p className="text-xs text-(--ant-tinta-suave) lg:hidden">{row.category}</p>
                <span className="mt-1 flex flex-wrap gap-1 md:hidden">
                  <Badge variant={row.kind === 'receita' ? 'default' : 'secondary'}>{label(row.kind)}</Badge>
                  {row.donationId ? <Badge variant="outline">via doação</Badge> : null}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="flex flex-wrap items-center gap-1">
                  <Badge variant={row.kind === 'receita' ? 'default' : 'secondary'}>{label(row.kind)}</Badge>
                  {row.donationId ? <Badge variant="outline">via doação</Badge> : null}
                </span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">{row.category}</TableCell>
              <TableCell
                className={`text-right font-medium whitespace-nowrap ${
                  row.kind === 'receita' ? 'text-(--ant-azul)' : 'text-(--ant-erro-texto-forte)'
                }`}
              >
                {row.kind === 'despesa' ? '- ' : '+ '}
                {formatMoney(row.amount)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {row.donationId ? (
                  <span className="text-xs text-(--ant-tinta-suave)">Altere pela doação</span>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(row)}
                      aria-label={`Editar lançamento ${row.description || row.category}`}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(row)}
                      aria-label={`Excluir lançamento ${row.description || row.category}`}
                    >
                      <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MolduraTabela>
  )
}
