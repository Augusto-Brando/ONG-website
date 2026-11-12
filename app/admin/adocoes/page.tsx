'use client'

// CRM de adoções: quadro Kanban por etapa + seção recolhida de encerradas.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { NewRequestDialog } from '@/components/admin/adocoes/new-request-dialog'
import { RequestCard } from '@/components/admin/adocoes/request-card'
import { RequestDetailDialog } from '@/components/admin/adocoes/request-detail-dialog'
import { ACTIVE_STAGES, CLOSED_STAGE_LIST, type RequestListItem } from '@/components/admin/adocoes/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { STAGE_LABELS } from '@/lib/format'
import type { AdoptionStage } from '@/lib/schema'

export default function AdocoesPage() {
  const [items, setItems] = useState<RequestListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)

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

  const grouped = useMemo(() => {
    const map = new Map<AdoptionStage, RequestListItem[]>()
    for (const stage of [...ACTIVE_STAGES, ...CLOSED_STAGE_LIST]) map.set(stage, [])
    for (const item of items) map.get(item.stage)?.push(item)
    return map
  }, [items])

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
        className="w-[270px] shrink-0 rounded-lg border border-border bg-muted/30 p-3"
      >
        <header className="mb-3 flex items-center justify-between gap-2">
          <h2 id={`coluna-${stage}`} className="text-sm font-semibold text-foreground">
            {STAGE_LABELS[stage] ?? stage}
          </h2>
          <Badge variant="secondary">{columnItems.length}</Badge>
        </header>
        <div className="space-y-2">
          {columnItems.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
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
      description={`${items.length} solicitação(ões) no CRM`}
      actions={
        <Button onClick={() => setNewOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Nova solicitação
        </Button>
      }
    >
      {loading ? (
        <p className="py-20 text-center text-muted-foreground">Carregando...</p>
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
          {items.length === 0 && (
            <p className="mb-4 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhuma solicitação de adoção ainda. Elas chegam pelo formulário do site ou pelo botão
              “Nova solicitação”.
            </p>
          )}

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
