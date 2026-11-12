'use client'

// "Nova solicitação": escolhe um interessado existente ou cadastra um novo, e o animal.
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { label } from '@/lib/format'
import type { AdopterRecord } from './types'
import { SOURCES } from './types'

type DogOption = { id: number; name: string; available: boolean }

const NO_ANIMAL = 'none'

export function NewRequestDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [mode, setMode] = useState<'existente' | 'novo'>('existente')
  const [adopters, setAdopters] = useState<AdopterRecord[]>([])
  const [dogs, setDogs] = useState<DogOption[]>([])
  const [loading, setLoading] = useState(false)
  const [adopterId, setAdopterId] = useState<string>('')
  const [animalId, setAnimalId] = useState<string>(NO_ANIMAL)
  const [source, setSource] = useState<string>('outro')
  const [message, setMessage] = useState('')
  const [novo, setNovo] = useState({ name: '', phone: '', email: '', city: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch('/api/adopters').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/dogs').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([adoptersData, dogsData]) => {
        if (cancelled) return
        setAdopters(Array.isArray(adoptersData) ? adoptersData : [])
        setDogs(
          Array.isArray(dogsData)
            ? dogsData.map((d: { id: number; name: string; available?: boolean }) => ({
                id: d.id,
                name: d.name,
                available: d.available !== false,
              }))
            : [],
        )
      })
      .catch(() => {
        if (!cancelled) toast.error('Erro ao carregar interessados e animais.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  function reset() {
    setMode('existente')
    setAdopterId('')
    setAnimalId(NO_ANIMAL)
    setSource('outro')
    setMessage('')
    setNovo({ name: '', phone: '', email: '', city: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      let targetId: number | null = mode === 'existente' ? Number(adopterId) || null : null

      if (mode === 'novo') {
        if (novo.name.trim().length < 2 || novo.phone.trim().length < 8) {
          toast.error('Informe nome e telefone do interessado.')
          return
        }
        const res = await fetch('/api/adopters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: novo.name,
            phone: novo.phone,
            email: novo.email,
            city: novo.city,
            consentLgpd: true,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          toast.error(data.error || 'Erro ao cadastrar o interessado.')
          return
        }
        const created = (await res.json()) as AdopterRecord
        targetId = created.id
      }

      if (!targetId) {
        toast.error('Escolha um interessado.')
        return
      }

      const res = await fetch('/api/adoption-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adopterId: targetId,
          animalId: animalId === NO_ANIMAL ? null : Number(animalId),
          stage: 'novo',
          source,
          message,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Erro ao criar a solicitação.')
        return
      }

      toast.success('Solicitação criada.')
      reset()
      onOpenChange(false)
      onCreated()
    } catch {
      toast.error('Falha de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) reset()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova solicitação</DialogTitle>
          <DialogDescription>Registre um interesse de adoção recebido fora do site.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Interessado</legend>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={mode === 'existente' ? 'default' : 'outline'}
                onClick={() => setMode('existente')}
                aria-pressed={mode === 'existente'}
              >
                Já cadastrado
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === 'novo' ? 'default' : 'outline'}
                onClick={() => setMode('novo')}
                aria-pressed={mode === 'novo'}
              >
                Cadastrar novo
              </Button>
            </div>

            {mode === 'existente' ? (
              <div className="space-y-2">
                <Label htmlFor="new-request-adopter">Interessado *</Label>
                <Select value={adopterId} onValueChange={setAdopterId} disabled={loading}>
                  <SelectTrigger id="new-request-adopter" className="w-full">
                    <SelectValue placeholder={loading ? 'Carregando...' : 'Selecione'} />
                  </SelectTrigger>
                  <SelectContent>
                    {adopters.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.name} · {a.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!loading && adopters.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Nenhum interessado cadastrado. Use “Cadastrar novo”.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="new-adopter-name">Nome *</Label>
                  <Input
                    id="new-adopter-name"
                    value={novo.name}
                    onChange={(e) => setNovo({ ...novo, name: e.target.value })}
                    required
                    minLength={2}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-adopter-phone">Telefone *</Label>
                    <Input
                      id="new-adopter-phone"
                      type="tel"
                      value={novo.phone}
                      onChange={(e) => setNovo({ ...novo, phone: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-adopter-email">E-mail</Label>
                    <Input
                      id="new-adopter-email"
                      type="email"
                      value={novo.email}
                      onChange={(e) => setNovo({ ...novo, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-adopter-city">Cidade</Label>
                  <Input
                    id="new-adopter-city"
                    value={novo.city}
                    onChange={(e) => setNovo({ ...novo, city: e.target.value })}
                  />
                </div>
              </div>
            )}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="new-request-animal">Animal</Label>
            <Select value={animalId} onValueChange={setAnimalId} disabled={loading}>
              <SelectTrigger id="new-request-animal" className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_ANIMAL}>Sem animal definido</SelectItem>
                {dogs.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                    {d.available ? '' : ' (indisponível)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-request-source">Origem</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger id="new-request-source" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {label(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-request-message">Mensagem</Label>
            <Textarea
              id="new-request-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={2000}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || loading}>
              {saving ? 'Salvando...' : 'Criar solicitação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
