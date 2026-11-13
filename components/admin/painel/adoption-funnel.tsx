'use client'

// Funil de adoções: uma barra horizontal por etapa do processo.
import { STAGE_LABELS } from '@/lib/format'

// Ordem do processo (a mesma do enum adoption_stage), do primeiro contato ao encerramento.
const ORDEM = [
  'novo',
  'triagem',
  'entrevista',
  'visita',
  'aprovado',
  'adotado',
  'pos_adocao',
  'recusado',
  'desistiu',
]

const ENCERRADAS = new Set(['adotado', 'recusado', 'desistiu'])

export function AdoptionFunnel({ porEtapa }: { porEtapa: Record<string, number> }) {
  const etapas = ORDEM.map((etapa) => ({
    etapa,
    rotulo: STAGE_LABELS[etapa] ?? etapa,
    total: porEtapa[etapa] ?? 0,
  })).filter((item) => item.total > 0)

  if (etapas.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma solicitação de adoção registrada.</p>
  }

  const maior = Math.max(...etapas.map((item) => item.total))

  return (
    <ul className="space-y-3">
      {etapas.map((item) => {
        const largura = Math.max(4, Math.round((item.total / maior) * 100))
        const encerrada = ENCERRADAS.has(item.etapa)
        return (
          <li key={item.etapa}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="text-foreground">{item.rotulo}</span>
              <span className="font-mono font-medium tabular-nums text-muted-foreground">{item.total}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div
                className={`h-full rounded-full ${encerrada ? 'bg-muted-foreground/40' : 'bg-primary'}`}
                style={{ width: `${largura}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
