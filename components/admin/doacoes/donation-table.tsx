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
import { DONATION_STATUS, type DonationRow } from './types'

export function donorName(row: DonationRow): string {
  const nome = row.donorName?.trim()
  return nome && nome.length > 0 ? nome : 'Anônimo'
}

export function DonationTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: DonationRow[]
  onEdit: (row: DonationRow) => void
  onDelete: (row: DonationRow) => void
}) {
  return (
    <MolduraTabela rotulo="Lista de doações">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Doador</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="hidden lg:table-cell">Forma</TableHead>
            <TableHead className="hidden xl:table-cell">Campanha</TableHead>
            <TableHead className="hidden sm:table-cell">Situação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap">{formatDate(row.receivedAt)}</TableCell>
              <TableCell className="max-w-48 whitespace-normal">
                <p className="font-semibold text-(--ant-tinta)">{donorName(row)}</p>
                <p className="text-xs text-(--ant-tinta-suave) md:hidden">{label(row.type)}</p>
                <Badge variant="outline" className="mt-1 sm:hidden">
                  {DONATION_STATUS[row.status]}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline">{label(row.type)}</Badge>
              </TableCell>
              <TableCell className="text-right font-medium whitespace-nowrap">
                {row.amount === null ? '—' : formatMoney(row.amount)}
              </TableCell>
              <TableCell className="hidden lg:table-cell">{label(row.method)}</TableCell>
              <TableCell className="hidden max-w-56 truncate xl:table-cell" title={row.campaign?.title ?? undefined}>
                {row.campaign?.title || '—'}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="outline">{DONATION_STATUS[row.status]}</Badge>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <Button variant="ghost" size="icon" onClick={() => onEdit(row)} aria-label={`Editar doação de ${donorName(row)}`}>
                  <Pencil className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(row)}
                  aria-label={`Excluir doação de ${donorName(row)}`}
                >
                  <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MolduraTabela>
  )
}
