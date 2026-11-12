'use client'

// Detalhe da solicitação: dados do interessado, histórico de interações e registro de nova interação.
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatDate, label, STAGE_LABELS } from '@/lib/format'
import type { RequestDetail } from './types'

const INTERACTION_TYPES = ['nota', 'ligacao', 'whatsapp', 'email', 'visita'] as const

function formatDateTime(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function Field({ labelText, children }: { labelText: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{labelText}</dt>
      <dd className="text-sm text-foreground">{children || '—'}</dd>
    </div>
  )
}

export function RequestDetailDialog({
  requestId,
  open,
  onOpenChange,
  onChanged,
}: {
  requestId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}) {
  const [detail, setDetail] = useState<RequestDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<string>('nota')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(
    async (id: number) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/adoption-requests/${id}`)
        if (!res.ok) {
          setError('Não foi possível carregar a solicitação.')
          setDetail(null)
          return
        }
        setDetail(await res.json())
      } catch {
        setError('Falha de conexão ao carregar a solicitação.')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (!open || !requestId) return
    setType('nota')
    setContent('')
    setDetail(null)
    load(requestId)
  }, [open, requestId, load])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!requestId) return
    if (!content.trim()) {
      toast.error('Escreva o conteúdo da interação.')
      return
    }
    setSaving(true)
    const res = await fetch(`/api/adoption-requests/${requestId}/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Erro ao registrar interação.')
      return
    }
    toast.success('Interação registrada.')
    setContent('')
    load(requestId)
    onChanged()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{detail ? detail.adopter?.name ?? 'Solicitação' : 'Solicitação'}</DialogTitle>
          <DialogDescription>
            {detail
              ? `Etapa: ${STAGE_LABELS[detail.stage] ?? detail.stage} · Criada em ${formatDate(detail.createdAt)}`
              : 'Carregando dados da solicitação...'}
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>}

        {error && !loading && (
          <div className="space-y-3">
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
            <Button variant="outline" onClick={() => requestId && load(requestId)}>
              Tentar novamente
            </Button>
          </div>
        )}

        {detail && !loading && (
          <div className="space-y-6">
            <section aria-labelledby="dados-interessado" className="space-y-3">
              <h3 id="dados-interessado" className="text-sm font-semibold text-foreground">
                Interessado
              </h3>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field labelText="Nome">{detail.adopter?.name}</Field>
                <Field labelText="Telefone">{detail.adopter?.phone}</Field>
                <Field labelText="E-mail">{detail.adopter?.email}</Field>
                <Field labelText="Cidade">{detail.adopter?.city}</Field>
                <Field labelText="Moradia">{detail.adopter?.housingType}</Field>
                <Field labelText="Outros animais">
                  {detail.adopter?.hasOtherPets === null || detail.adopter?.hasOtherPets === undefined
                    ? '—'
                    : detail.adopter.hasOtherPets
                      ? 'Sim'
                      : 'Não'}
                </Field>
                <Field labelText="Consentimento LGPD">
                  {detail.adopter?.consentLgpd
                    ? `Sim${detail.adopter.consentAt ? ` (${formatDate(detail.adopter.consentAt)})` : ''}`
                    : 'Não'}
                </Field>
                <Field labelText="Animal">
                  {detail.animal ? `${detail.animal.name} · ${label(detail.animal.status)}` : 'Não definido'}
                </Field>
              </dl>
              {detail.message && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Mensagem do interessado</p>
                  <p className="mt-1 whitespace-pre-line rounded-md bg-muted px-3 py-2 text-sm text-foreground">
                    {detail.message}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Origem: {label(detail.source)}</Badge>
                <Badge variant="outline">Atualizada em {formatDateTime(detail.updatedAt)}</Badge>
                {detail.closedAt && <Badge variant="outline">Encerrada em {formatDate(detail.closedAt)}</Badge>}
              </div>
            </section>

            <section aria-labelledby="historico" className="space-y-3">
              <h3 id="historico" className="text-sm font-semibold text-foreground">
                Histórico de interações
              </h3>
              {detail.interactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma interação registrada ainda.</p>
              ) : (
                <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {detail.interactions.map((it) => (
                    <li key={it.id} className="rounded-md border border-border px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="secondary" className="text-[11px]">
                          {label(it.type)}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">{formatDateTime(it.createdAt)}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-line text-sm text-foreground">{it.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="nova-interacao" className="space-y-3">
              <h3 id="nova-interacao" className="text-sm font-semibold text-foreground">
                Registrar interação
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="interaction-type">Tipo</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="interaction-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERACTION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {label(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interaction-content">Conteúdo *</Label>
                  <Textarea
                    id="interaction-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    maxLength={4000}
                    required
                    placeholder="O que aconteceu neste contato?"
                  />
                </div>
                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? 'Salvando...' : 'Registrar'}
                </Button>
              </form>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
