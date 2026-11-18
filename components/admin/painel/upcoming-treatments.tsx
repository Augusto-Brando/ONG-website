'use client'

// Tratamentos agendados ou com retorno previsto nos próximos 30 dias.
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, label } from '@/lib/format'
import type { Dashboard } from '@/app/api/dashboard/route'

type Tratamento = NonNullable<Dashboard['tratamentos']>['proximos'][number]

export function UpcomingTreatments({ items }: { items: Tratamento[] }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Nenhum tratamento nos próximos 30 dias.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Animal</TableHead>
            <TableHead>Tratamento</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.animal}</TableCell>
              <TableCell>{label(item.type)}</TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(item.date)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
