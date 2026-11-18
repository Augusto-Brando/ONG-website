'use client'

// Seção "Próximos 30 dias": tratamentos agendados ou com próxima data no período.
import { CalendarClock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatMoney, label } from '@/lib/format'
import type { TreatmentRow } from './types'

export function UpcomingList({
  treatments,
  today,
  limitIso,
}: {
  treatments: TreatmentRow[]
  today: string
  limitIso: string
}) {
  const rows = treatments
    .filter((t) => t.status === 'agendado' || (t.nextDate !== null && t.nextDate >= today && t.nextDate <= limitIso))
    .sort((a, b) => (a.nextDate ?? a.date).localeCompare(b.nextDate ?? b.date))

  if (rows.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-5 w-5 text-primary" aria-hidden="true" />
          Próximos 30 dias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Animal</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Próxima data</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{formatDate(t.date)}</TableCell>
                  <TableCell className="font-medium">{t.animal?.name ?? '—'}</TableCell>
                  <TableCell>{label(t.type)}</TableCell>
                  <TableCell>{t.cost ? formatMoney(t.cost) : '—'}</TableCell>
                  <TableCell>{formatDate(t.nextDate)}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === 'agendado' ? 'secondary' : 'outline'}>{label(t.status)}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}