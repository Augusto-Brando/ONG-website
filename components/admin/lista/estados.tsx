'use client'

import type { ReactNode } from 'react'
import { AlertTriangle, SearchX, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MolduraTabela({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div
      role="region"
      aria-label={rotulo}
      tabIndex={0}
      className="overflow-x-auto rounded-xl border border-(--ant-areia) focus-visible:outline-2 focus-visible:outline-(--ant-foco)"
    >
      {children}
    </div>
  )
}

export function CarregandoLista({ rotulo, linhas = 5 }: { rotulo: string; linhas?: number }) {
  return (
    <div role="status" className="space-y-2">
      <span className="sr-only">{rotulo}</span>
      {Array.from({ length: linhas }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="h-12 animate-pulse rounded-lg bg-(--ant-esqueleto) motion-reduce:animate-none"
        />
      ))}
    </div>
  )
}

export function ErroLista({ mensagem, onTentar }: { mensagem: string; onTentar: () => void }) {
  return (
    <div className="space-y-3 rounded-xl border border-dashed border-(--ant-areia-forte) px-4 py-10 text-center">
      <p role="alert" className="flex items-center justify-center gap-2 text-sm text-(--ant-erro-texto-forte)">
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        {mensagem}
      </p>
      <Button type="button" variant="outline" size="sm" onClick={onTentar}>
        Tentar de novo
      </Button>
    </div>
  )
}

export function VazioLista({
  icone: Icone,
  titulo,
  descricao,
  acao,
}: {
  icone: LucideIcon
  titulo: string
  descricao?: string
  acao?: ReactNode
}) {
  return (
    <div className="space-y-3 rounded-xl border border-dashed border-(--ant-areia-forte) px-4 py-12 text-center">
      <Icone className="mx-auto size-10 text-(--ant-tinta-suave)" aria-hidden="true" />
      <p className="font-semibold text-(--ant-tinta)">{titulo}</p>
      {descricao && <p className="mx-auto max-w-prose text-sm text-(--ant-tinta-suave)">{descricao}</p>}
      {acao}
    </div>
  )
}

export function SemResultados({ onLimpar }: { onLimpar: () => void }) {
  return (
    <VazioLista
      icone={SearchX}
      titulo="Nada encontrado com esses filtros"
      descricao="Tente outro termo ou limpe os filtros para ver a lista inteira."
      acao={
        <Button type="button" variant="outline" size="sm" onClick={onLimpar}>
          Limpar filtros
        </Button>
      }
    />
  )
}
