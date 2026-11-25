'use client'

import type { ReactNode } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TODOS } from '@/lib/busca'

export type Opcao = { value: string; label: string }

const ROTULO = 'text-xs text-(--ant-tinta-suave)'

export function BarraFiltros({
  rotulo,
  ativos,
  onLimpar,
  children,
}: {
  rotulo: string
  ativos: boolean
  onLimpar: () => void
  children: ReactNode
}) {
  return (
    <section
      aria-label={rotulo}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-(--ant-areia) bg-(--ant-branco) p-3"
    >
      {children}
      {ativos && (
        <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5" onClick={onLimpar}>
          <X className="size-3.5" aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </section>
  )
}

export function CampoBusca({
  id,
  rotulo,
  valor,
  onMudar,
  placeholder,
}: {
  id: string
  rotulo: string
  valor: string
  onMudar: (valor: string) => void
  placeholder?: string
}) {
  return (
    <div className="w-full min-w-48 flex-1 space-y-1 sm:w-auto">
      <Label htmlFor={id} className={ROTULO}>
        {rotulo}
      </Label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-(--ant-tinta-suave)"
          aria-hidden="true"
        />
        <Input
          id={id}
          type="search"
          value={valor}
          onChange={(e) => onMudar(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="pl-8"
        />
      </div>
    </div>
  )
}

export function FiltroSelect({
  id,
  rotulo,
  valor,
  onMudar,
  opcoes,
  rotuloTodos = 'Todos',
}: {
  id: string
  rotulo: string
  valor: string
  onMudar: (valor: string) => void
  opcoes: readonly Opcao[]
  rotuloTodos?: string
}) {
  return (
    <div className="w-full space-y-1 sm:w-44">
      <Label htmlFor={id} className={ROTULO}>
        {rotulo}
      </Label>
      <Select value={valor || TODOS} onValueChange={onMudar}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={rotuloTodos} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>{rotuloTodos}</SelectItem>
          {opcoes.map((opcao) => (
            <SelectItem key={opcao.value} value={opcao.value}>
              {opcao.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function FiltroData({
  id,
  rotulo,
  valor,
  onMudar,
  min,
  max,
  invalido,
}: {
  id: string
  rotulo: string
  valor: string
  onMudar: (valor: string) => void
  min?: string
  max?: string
  invalido?: boolean
}) {
  return (
    <div className="w-full space-y-1 sm:w-40">
      <Label htmlFor={id} className={ROTULO}>
        {rotulo}
      </Label>
      <Input
        id={id}
        type="date"
        value={valor}
        min={min || undefined}
        max={max || undefined}
        aria-invalid={invalido || undefined}
        onChange={(e) => onMudar(e.target.value)}
      />
    </div>
  )
}
