'use client'

// Tela Financeiro: cartões do período, filtros, tabela e diálogo de lançamentos.
import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { SummaryCards } from '@/components/admin/financeiro/summary-cards'
import { TransactionDialog } from '@/components/admin/financeiro/transaction-dialog'
import { TransactionTable } from '@/components/admin/financeiro/transaction-table'
import type { TransactionRow, TransactionsSummary } from '@/components/admin/financeiro/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

/** Intervalo padrão: mês atual. */
function currentMonth() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const lastDay = new Date(year, month, 0).getDate()
  return { from: `${year}-${pad(month)}-01`, to: `${year}-${pad(month)}-${pad(lastDay)}` }
}

const emptySummary: TransactionsSummary = { receitas: 0, despesas: 0, saldo: 0 }

export default function FinanceiroPage() {
  const [filters, setFilters] = useState({ ...currentMonth(), kind: 'todos' })
  const [rows, setRows] = useState<TransactionRow[]>([])
  const [summary, setSummary] = useState<TransactionsSummary>(emptySummary)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TransactionRow | null>(null)

  const load = useCallback(async (current: { from: string; to: string; kind: string }) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (current.from) params.set('from', current.from)
    if (current.to) params.set('to', current.to)
    if (current.kind && current.kind !== 'todos') params.set('kind', current.kind)
    try {
      const res = await fetch(`/api/transactions?${params.toString()}`)
      if (!res.ok) {
        toast.error('Erro ao carregar os lançamentos.')
        return
      }
      const data = await res.json()
      setRows(Array.isArray(data.items) ? data.items : [])
      setSummary(data.summary ?? emptySummary)
    } catch {
      toast.error('Erro de conexão ao carregar os lançamentos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(filters)
  }, [filters, load])

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(row: TransactionRow) {
    setEditing(row)
    setDialogOpen(true)
  }

  async function handleDelete(row: TransactionRow) {
    if (!confirm(`Excluir o lançamento "${row.description || row.category}"?`)) return
    const res = await fetch(`/api/transactions/${row.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Lançamento excluído.')
      load(filters)
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Erro ao excluir o lançamento.')
    }
  }

  return (
    <AdminShell
      title="Financeiro"
      description={`${rows.length} lançamento(s) no período selecionado`}
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Novo lançamento
        </Button>
      }
    >
      <div className="space-y-6">
        <SummaryCards summary={summary} />

        <section
          aria-label="Filtros do financeiro"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
        >
          <div className="space-y-2">
            <Label htmlFor="from">De</Label>
            <Input
              id="from"
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">Até</Label>
            <Input
              id="to"
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kind-filter">Tipo</Label>
            <Select
              value={filters.kind}
              onValueChange={(v) => setFilters({ ...filters, kind: v })}
            >
              <SelectTrigger id="kind-filter" className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setFilters({ ...currentMonth(), kind: 'todos' })}
            >
              Limpar
            </Button>
          </div>
        </section>

        <TransactionTable rows={rows} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={() => load(filters)}
      />
    </AdminShell>
  )
}
