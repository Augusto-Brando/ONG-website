'use client'

// Cartão do Kanban: mini foto do animal, adotante, dias na etapa e troca de etapa por Select (acessível por teclado).
import { Clock } from 'lucide-react'
import { Pata } from '@/components/marca/Pata'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { daysSince, formatDate, formatDaysInStage, label, STAGE_LABELS } from '@/lib/format'
import type { AdoptionStage } from '@/lib/schema'
import { ALL_STAGES, CLOSED_STAGE_LIST, type RequestListItem } from './types'

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
  const daysInStage = daysSince(item.updatedAt)
  const isClosed = CLOSED_STAGE_LIST.includes(item.stage)
  const isStale = !isClosed && daysInStage !== null && daysInStage >= 7
  const stageTimeLabel = formatDaysInStage(item.updatedAt)

  return (
    <article className="rounded-xl border border-[var(--ant-areia)] bg-[var(--ant-branco)] p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-2.5">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[var(--ant-areia)] bg-[var(--ant-sol-suave)] flex items-center justify-center">
          {item.animal?.imageUrl ? (
            <img
              src={item.animal.imageUrl}
              alt={`Foto de ${item.animal.name}`}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <Pata tamanho={22} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--ant-tinta)] leading-snug">
            <button
              type="button"
              onClick={() => onOpen(item)}
              className="w-full truncate rounded-md text-left hover:text-[var(--ant-azul)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Abrir solicitação de ${item.adopter.name}${item.animal ? ` para ${item.animal.name}` : ''}`}
            >
              {item.adopter.name}
            </button>
          </h3>
          <p className="mt-0.5 truncate text-xs font-medium text-[var(--ant-azul-texto-suave)]">
            {item.animal ? item.animal.name : 'Sem animal definido'}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary" className="text-[11px]">
          {label(item.source)}
        </Badge>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            isStale
              ? 'bg-[var(--ant-pessego)] text-[var(--ant-laranja-texto)]'
              : 'bg-[var(--ant-creme)] text-[var(--ant-tinta-suave)]'
          }`}
          title={`Última movimentação em ${formatDate(item.updatedAt)} · criado em ${formatDate(item.createdAt)}`}
        >
          <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>{stageTimeLabel}</span>
        </span>
      </div>

      <div className="mt-3 space-y-1">
        <Label htmlFor={`stage-${item.id}`} className="text-[11px] text-[var(--ant-tinta-suave)]">
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
