'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { NewRequestDialog } from '@/components/admin/adocoes/new-request-dialog'
import { RequestCard } from '@/components/admin/adocoes/request-card'
import { RequestDetailDialog } from '@/components/admin/adocoes/request-detail-dialog'
import { ACTIVE_STAGES, CLOSED_STAGE_LIST, SOURCES, type RequestListItem } from '@/components/admin/adocoes/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { BarraFiltros, CampoBusca, FiltroSelect } from '@/components/admin/lista/filtros'
import { TODOS } from '@/lib/busca'
import { label, STAGE_LABELS } from '@/lib/format'
import type { AdoptionStage } from '@/lib/schema'

const SOURCE_OPTIONS = SOURCES.map((src) => ({ value: src, label: label(src) }))

export default function AdocoesPage() {
  const [items, setItems] = useState<RequestListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>(TODOS)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/adoption-requests')
      if (!res.ok) {
        setError('Não foi possível carregar as solicitações.')
        toast.error('Erro ao carregar solicitações de adoção.')
        return
      }
      setItems(await res.json())
      setError(null)
    } catch {
      setError('Falha de conexão ao carregar as solicitações.')
      toast.error('Falha de conexão.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function clearFilters() {
    setSearch('')
    setSourceFilter(TODOS)
  }

  const hasFilters = search.trim() !== '' || sourceFilter !== TODOS

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      if (sourceFilter !== TODOS && item.source !== sourceFilter) return false
      if (!q) return true
      const adopterMatch = item.adopter.name.toLowerCase().includes(q)
      const animalMatch = (item.animal?.name ?? '').toLowerCase().includes(q)
      return adopterMatch || animalMatch
    })
  }, [items, search, sourceFilter])

  const grouped = useMemo(() => {
    const map = new Map<AdoptionStage, RequestListItem[]>()
    for (const stage of [...ACTIVE_STAGES, ...CLOSED_STAGE_LIST]) map.set(stage, [])
    for (const item of filteredItems) map.get(item.stage)?.push(item)
    return map
  }, [filteredItems])

  const closedCount = CLOSED_STAGE_LIST.reduce((total, stage) => total + (grouped.get(stage)?.length ?? 0), 0)

  function openDetail(item: RequestListItem) {
    setSelectedId(item.id)
    setDetailOpen(true)
  }

  async function handleStageChange(item: RequestListItem, stage: AdoptionStage) {
    if (stage === item.stage) return
    setUpdatingId(item.id)
    try {
      const res = await fetch(`/api/adoption-requests/${item.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Erro ao mudar a etapa.')
        return
      }
      const updated = (await res.json()) as { stage: AdoptionStage; updatedAt: string; closedAt: string | null }
      setItems((prev) =>
        prev
          .map((i) =>
            i.id === item.id ? { ...i, stage: updated.stage, updatedAt: updated.updatedAt, closedAt: updated.closedAt } : i,
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      )
      toast.success(`Etapa alterada para ${STAGE_LABELS[stage] ?? stage}.`)
    } catch {
      toast.error('Falha de conexão ao mudar a etapa.')
    } finally {
      setUpdatingId(null)
    }
  }

  function renderColumn(stage: AdoptionStage) {
    const columnItems = grouped.get(stage) ?? []
    return (
      <section
        key={stage}
        aria-labelledby={`coluna-${stage}`}
        className="w-[276px] shrink-0 rounded-xl border border-[var(--ant-areia)] bg-[var(--ant-creme)]/60 p-3"
      >
        <header className="mb-3 flex items-center justify-between gap-2">
          <h2 id={`coluna-${stage}`} className="text-sm font-semibold text-[var(--ant-tinta)]">
            {STAGE_LABELS[stage] ?? stage}
          </h2>
          <Badge variant="secondary">{columnItems.length}</Badge>
        </header>
        <div className="space-y-2.5">
          {columnItems.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[var(--ant-areia-forte)] px-3 py-6 text-center text-xs text-[var(--ant-tinta-suave)]">
              Nenhuma
            </p>
          ) : (
            columnItems.map((item) => (
              <RequestCard
                key={item.id}
                item={item}
                onOpen={openDetail}
                onStageChange={handleStageChange}
                updating={updatingId === item.id}
              />
            ))
          )}
        </div>
      </section>
    )
  }

  return (
    <AdminShell
      title="Adoções"
      description={
        hasFilters
          ? `Mostrando ${filteredItems.length} de ${items.length} solicitação(ões)`
          : `${items.length} solicitação(ões) no CRM`
      }
      actions={
        <Button onClick={() => setNewOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Nova solicitação
        </Button>
      }
    >
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-3" role="status" aria-label="Carregando solicitações de adoção">
          {ACTIVE_STAGES.slice(0, 4).map((stage) => (
            <div
              key={stage}
              className="w-[276px] shrink-0 space-y-2.5 rounded-xl border border-[var(--ant-areia)] bg-[var(--ant-creme)]/60 p-3"
            >
              <div className="h-5 w-24 animate-pulse rounded bg-[var(--ant-esqueleto)]" />
              <div className="h-32 animate-pulse rounded-xl bg-[var(--ant-esqueleto)]" />
              <div className="h-32 animate-pulse rounded-xl bg-[var(--ant-esqueleto)]" />
            </div>
          ))}
        </div>
      ) : error && items.length === 0 ? (
        <div className="space-y-3 py-16 text-center">
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
          <Button variant="outline" onClick={load}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <>
          {items.length > 0 && (
            <div className="mb-4">
              <BarraFiltros rotulo="Filtros de adoções" ativos={hasFilters} onLimpar={clearFilters}>
                <CampoBusca
                  id="busca-adocoes"
                  rotulo="Buscar por interessado ou animal"
                  valor={search}
                  onMudar={setSearch}
                  placeholder="Ex.: Maria ou Thor"
                />
                <FiltroSelect
                  id="filtro-origem"
                  rotulo="Origem"
                  valor={sourceFilter}
                  onMudar={setSourceFilter}
                  opcoes={SOURCE_OPTIONS}
                  rotuloTodos="Todas as origens"
                />
              </BarraFiltros>
            </div>
          )}

          {items.length === 0 ? (
            <p className="mb-4 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhuma solicitação de adoção ainda. Elas chegam pelo formulário do site ou pelo botão
              “Nova solicitação”.
            </p>
          ) : filteredItems.length === 0 ? (
            <div className="mb-4 space-y-3 rounded-xl border border-dashed border-[var(--ant-areia-forte)] px-4 py-8 text-center">
              <p className="text-sm text-[var(--ant-tinta-suave)]">
                Nenhuma solicitação encontrada com os filtros atuais.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          ) : null}

          <div className="flex gap-3 overflow-x-auto pb-3">{ACTIVE_STAGES.map(renderColumn)}</div>

          <Collapsible className="mt-4">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between gap-2 sm:w-auto">
                <span>Encerradas ({closedCount})</span>
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="flex gap-3 overflow-x-auto pb-3">{CLOSED_STAGE_LIST.map(renderColumn)}</div>
            </CollapsibleContent>
          </Collapsible>
        </>
      )}

      <RequestDetailDialog
        requestId={selectedId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onChanged={load}
      />
      <NewRequestDialog open={newOpen} onOpenChange={setNewOpen} onCreated={load} />
    </AdminShell>
  )
}
