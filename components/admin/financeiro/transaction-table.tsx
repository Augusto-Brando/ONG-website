'use client'

// Tabela de lançamentos do financeiro.
import { Pencil, Trash2 } from 'lucide-react'
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
  loading,
  onEdit,
  onDelete,
}: {
  rows: TransactionRow[]
  loading: boolean
  onEdit: (row: TransactionRow) => void
  onDelete: (row: TransactionRow) => void
}) {
  if (loading) {
    return <p className="py-20 text-center text-muted-foreground">Carregando...</p>
  }

  if (rows.length === 0) {
    return (
      <p className="py-20 text-center text-muted-foreground">
        Nenhum lançamento no período selecionado.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap">{formatDate(row.date)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1">
                  <Badge variant={row.kind === 'receita' ? 'default' : 'secondary'}>
                    {label(row.kind)}
                  </Badge>
                  {row.donationId ? (
                    <Badge variant="outline">via doação</Badge>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell className="max-w-[240px] truncate" title={row.description}>
                {row.description || '—'}
              </TableCell>
              <TableCell
                className={`whitespace-nowrap text-right font-medium ${
                  row.kind === 'receita' ? 'text-emerald-600' : 'text-destructive'
                }`}
              >
                {row.kind === 'despesa' ? '- ' : '+ '}
                {formatMoney(row.amount)}
              </TableCell>
              <TableCell className="text-right">
                {row.donationId ? (
                  <span className="text-xs text-muted-foreground">Altere pela doação</span>
                ) : (
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(row)}
                      aria-label={`Editar lançamento ${row.description || row.category}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(row)}
                      aria-label={`Excluir lançamento ${row.description || row.category}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
