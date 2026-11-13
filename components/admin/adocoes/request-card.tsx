'use client'

// Cartão do Kanban: dados resumidos + troca de etapa por Select (acessível por teclado).
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, label, STAGE_LABELS } from '@/lib/format'
import type { AdoptionStage } from '@/lib/schema'
import { ALL_STAGES, type RequestListItem } from './types'

export function RequestCard({
  item,
  onOpen,
  onStageChange,
  updating,
}: {
  item: RequestListItem
  onOpen: (item: RequestListItem) => void
  onStageChange: (item: RequestListItem, stage: AdoptionStage) => void
  updating: boolean
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-3 shadow-sm">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="w-full rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Abrir solicitação de ${item.adopter.name}`}
      >
        <p className="text-sm font-semibold text-foreground">{item.adopter.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.animal ? item.animal.name : 'Sem animal definido'}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[11px]">
            {label(item.source)}
          </Badge>
          <span className="text-[11px] text-muted-foreground">{formatDate(item.createdAt)}</span>
        </div>
      </button>

      <div className="mt-3 space-y-1">
        <Label htmlFor={`stage-${item.id}`} className="text-[11px] text-muted-foreground">
          Etapa
        </Label>
        <Select
          value={item.stage}
          onValueChange={(v) => onStageChange(item, v as AdoptionStage)}
          disabled={updating}
        >
          <SelectTrigger id={`stage-${item.id}`} size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_STAGES.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {STAGE_LABELS[stage] ?? stage}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </article>
  )
}
