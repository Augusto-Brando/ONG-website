'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { SummaryCards } from '@/components/admin/financeiro/summary-cards'
import { TransactionDialog } from '@/components/admin/financeiro/transaction-dialog'
import { TransactionTable } from '@/components/admin/financeiro/transaction-table'
import type { TransactionRow, TransactionsSummary } from '@/components/admin/financeiro/types'
import { CarregandoLista, ErroLista, SemResultados, VazioLista } from '@/components/admin/lista/estados'
import { BarraFiltros, CampoBusca, FiltroData, FiltroSelect, type Opcao } from '@/components/admin/lista/filtros'
import { Button } from '@/components/ui/button'
import { correspondeBusca, descricaoContagem, TODOS } from '@/lib/busca'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function currentMonth() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const lastDay = new Date(year, month, 0).getDate()
  return { from: `${year}-${pad(month)}-01`, to: `${year}-${pad(month)}-${pad(lastDay)}` }
}

const emptySummary: TransactionsSummary = { receitas: 0, despesas: 0, saldo: 0 }

const TIPOS: Opcao[] = [
  { value: 'receita', label: 'Receita' },
  { value: 'despesa', label: 'Despesa' },
]

export default function FinanceiroPage() {
  const [filters, setFilters] = useState({ ...currentMonth(), kind: TODOS })
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState<string | null>(null)
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
    if (current.kind && current.kind !== TODOS) params.set('kind', current.kind)
    try {
      const res = await fetch(`/api/transactions?${params.toString()}`)
      if (!res.ok) {
        setErro('Não foi possível carregar os lançamentos.')
        return
      }
      setErro(null)
      const data = await res.json()
      setRows(Array.isArray(data.items) ? data.items : [])
      setSummary(data.summary ?? emptySummary)
    } catch {
      setErro('Falha de conexão ao carregar os lançamentos.')
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

  const padrao = currentMonth()
  const periodoInvalido = Boolean(filters.from && filters.to && filters.from > filters.to)
  const filtrando =
    busca.trim() !== '' || filters.kind !== TODOS || filters.from !== padrao.from || filters.to !== padrao.to

  const filtrados = useMemo(
    () => rows.filter((r) => correspondeBusca(busca, r.description, r.category)),
    [rows, busca],
  )

  function limparFiltros() {
    setFilters({ ...currentMonth(), kind: TODOS })
    setBusca('')
  }

  return (
    <AdminShell
      title="Financeiro"
      description={`${descricaoContagem(filtrados.length, rows.length, 'lançamento', 'lançamentos', busca.trim() !== '')} no período selecionado`}
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="size-4" aria-hidden="true" /> Novo lançamento
        </Button>
      }
    >
      <div className="space-y-6">
        <SummaryCards summary={summary} />

        <BarraFiltros rotulo="Filtros do financeiro" ativos={filtrando} onLimpar={limparFiltros}>
          <CampoBusca
            id="busca-financeiro"
            rotulo="Buscar por descrição ou categoria"
            valor={busca}
            onMudar={setBusca}
            placeholder="Ex.: veterinário"
          />
          <FiltroData
            id="from"
            rotulo="De"
            valor={filters.from}
            max={filters.to}
            invalido={periodoInvalido}
            onMudar={(v) => setFilters({ ...filters, from: v })}
          />
          <FiltroData
            id="to"
            rotulo="Até"
            valor={filters.to}
            min={filters.from}
            invalido={periodoInvalido}
            onMudar={(v) => setFilters({ ...filters, to: v })}
          />
          <FiltroSelect
            id="kind-filter"
            rotulo="Tipo"
            valor={filters.kind}
            onMudar={(v) => setFilters({ ...filters, kind: v })}
            opcoes={TIPOS}
          />
        </BarraFiltros>
        {periodoInvalido && (
          <p role="alert" className="text-sm text-(--ant-erro-texto-forte)">
            A data inicial não pode ser depois da data final.
          </p>
        )}

        {loading ? (
          <CarregandoLista rotulo="Carregando lançamentos" />
        ) : erro ? (
          <ErroLista mensagem={erro} onTentar={() => load(filters)} />
        ) : rows.length === 0 && busca.trim() === '' ? (
          <VazioLista
            icone={Wallet}
            titulo="Nenhum lançamento no período"
            descricao="Troque as datas acima ou registre um lançamento novo. Doações confirmadas e tratamentos com custo entram sozinhos."
          />
        ) : filtrados.length === 0 ? (
          <SemResultados onLimpar={limparFiltros} />
        ) : (
          <TransactionTable rows={filtrados} onEdit={openEdit} onDelete={handleDelete} />
        )}
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
