'use client'

import { VStack, HStack } from '@astryxdesign/core/Stack'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatMoney } from '@/lib/format'
import type { DonationRow } from './types'

export function PendingPix({ rows, loading, busy, onStatus }: {
  rows: DonationRow[]
  loading: boolean
  busy: number | null
  onStatus: (row: DonationRow, status: 'confirmada' | 'recusada') => void
}) {
  return <VStack as="section" gap={3} aria-labelledby="pix-pendentes" className="mb-6 min-w-0 rounded-(--ant-raio-campo) border border-(--ant-areia) bg-(--ant-sol-suave) p-4">
    <h2 id="pix-pendentes" className="text-xl font-extrabold">Pix a confirmar ({loading ? '…' : rows.length})</h2>
    <p>Confira o valor e o identificador no extrato antes de confirmar. Só a confirmação atualiza a campanha e o financeiro.</p>
    {loading ? <p role="status">Buscando os Pix pendentes…</p> : !rows.length ? <p>Nenhum Pix aguardando confirmação.</p> : <VStack className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Valor</TableHead><TableHead>Campanha</TableHead><TableHead>Nome</TableHead><TableHead>Identificador Pix</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
        <TableBody>{rows.map(row => <TableRow key={row.id}>
          <TableCell>{formatDate(row.receivedAt)}</TableCell>
          <TableCell className="whitespace-nowrap font-bold">{formatMoney(row.amount)}</TableCell>
          <TableCell className="whitespace-normal">{row.campaign?.title || 'Sem campanha'}</TableCell>
          <TableCell>{row.donorName || 'Anônimo'}</TableCell>
          <TableCell className="font-[family-name:var(--font-mono),monospace]">{row.pixTxid || 'Não informado'}</TableCell>
          <TableCell><HStack gap={2}>
            <Button className="min-h-11 bg-(--ant-azul) text-(--ant-branco) hover:bg-(--ant-azul-escuro)" disabled={busy !== null} onClick={() => onStatus(row, 'confirmada')} aria-label={`Confirmar Pix ${row.pixTxid || row.id}`}>{busy === row.id ? 'Salvando…' : 'Confirmar'}</Button>
            <Button variant="outline" className="min-h-11" disabled={busy !== null} onClick={() => onStatus(row, 'recusada')} aria-label={`Recusar Pix ${row.pixTxid || row.id}`}>Recusar</Button>
          </HStack></TableCell>
        </TableRow>)}</TableBody>
      </Table>
    </VStack>}
  </VStack>
}
