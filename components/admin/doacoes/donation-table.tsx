'use client'

// Tabela de doações: data, doador (ou "Anônimo"), tipo, valor, forma e campanha.
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
import { DONATION_STATUS, type DonationRow } from './types'

function donorName(row: DonationRow): string {
  const nome = row.donorName?.trim()
  return nome && nome.length > 0 ? nome : 'Anônimo'
}

export function DonationTable({
  rows,
  loading,
  onEdit,
  onDelete,
}: {
  rows: DonationRow[]
  loading: boolean
  onEdit: (row: DonationRow) => void
  onDelete: (row: DonationRow) => void
}) {
  if (loading) {
    return <p className="py-20 text-center text-muted-foreground">Carregando...</p>
  }

  if (rows.length === 0) {
    return (
      <p className="py-20 text-center text-muted-foreground">
        Nenhuma doação encontrada no período selecionado.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Doador</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Forma</TableHead>
            <TableHead>Campanha</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap">{formatDate(row.receivedAt)}</TableCell>
              <TableCell className="font-medium">{donorName(row)}</TableCell>
              <TableCell>
                <Badge variant="outline">{label(row.type)}</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-right font-medium">
                {row.amount === null ? '—' : formatMoney(row.amount)}
              </TableCell>
              <TableCell>{label(row.method)}</TableCell>
              <TableCell className="max-w-[220px] truncate" title={row.campaign?.title ?? undefined}>
                {row.campaign?.title || '—'}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="outline">{DONATION_STATUS[row.status]}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(row)}
                    aria-label={`Editar doação de ${donorName(row)}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(row)}
                    aria-label={`Excluir doação de ${donorName(row)}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
