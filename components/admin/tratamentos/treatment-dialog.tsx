'use client'

// Diálogo de criar/editar tratamento veterinário.
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { label, todayIso } from '@/lib/format'
import type { DogRow, TreatmentRow } from './types'

const TREATMENT_TYPES = ['vacina', 'vermifugo', 'castracao', 'consulta', 'medicacao', 'cirurgia', 'exame', 'outro']
const STATUSES = ['agendado', 'realizado', 'cancelado']

type TreatmentForm = {
  animalId: number
  type: string
  description: string
  veterinarian: string
  date: string
  nextDate: string
  cost: number
  status: string
  notes: string
}

const EMPTY: TreatmentForm = {
  animalId: 0,
  type: 'consulta',
  description: '',
  veterinarian: '',
  date: todayIso(),
  nextDate: '',
  cost: 0,
  status: 'realizado',
  notes: '',
}

export function TreatmentDialog({
  open,
  onOpenChange,
  dogs,
  treatment,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  dogs: DogRow[]
  treatment: TreatmentRow | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<TreatmentForm>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (treatment) {
      setForm({
        animalId: treatment.animalId,
        type: treatment.type,
        description: treatment.description,
        veterinarian: treatment.veterinarian ?? '',
        date: treatment.date,
        nextDate: treatment.nextDate ?? '',
        cost: treatment.cost ? Number(treatment.cost) : 0,
        status: treatment.status,
        notes: treatment.notes ?? '',
      })
    } else {
      setForm(EMPTY)
    }
  }, [open, treatment])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.animalId) {
      toast.error('Selecione um animal.')
      return
    }
    setSaving(true)
    const res = await fetch(treatment ? `/api/treatments/${treatment.id}` : '/api/treatments', {
      method: treatment ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        animalId: form.animalId,
        type: form.type,
        description: form.description,
        veterinarian: form.veterinarian || null,
        date: form.date,
        nextDate: form.nextDate || null,
        cost: form.cost > 0 ? form.cost : null,
        status: form.status,
        notes: form.notes || null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success(treatment ? 'Tratamento atualizado.' : 'Tratamento cadastrado.')
      onOpenChange(false)
      onSaved()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Erro ao salvar o tratamento.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{treatment ? 'Editar tratamento' : 'Novo tratamento'}</DialogTitle>
          <DialogDescription>Registre ou edite tratamentos veterinários dos animais.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trt-animal">Animal *</Label>
            <Select
              value={form.animalId ? String(form.animalId) : ''}
              onValueChange={(v) => setForm({ ...form, animalId: Number(v) })}
            >
              <SelectTrigger id="trt-animal" className="w-full">
                <SelectValue placeholder="Selecione o animal..." />
              </SelectTrigger>
              <SelectContent>
                {dogs.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trt-type">Tipo *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="trt-type" className="w-full">
                  <SelectValue>{label(form.type)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TREATMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {label(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trt-status">Status *</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger id="trt-status" className="w-full">
                  <SelectValue>{label(form.status)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {label(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trt-date">Data *</Label>
              <Input
                id="trt-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trt-next">Próxima data</Label>
              <Input
                id="trt-next"
                type="date"
                value={form.nextDate}
                onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trt-vet">Veterinário</Label>
              <Input
                id="trt-vet"
                value={form.veterinarian}
                onChange={(e) => setForm({ ...form, veterinarian: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trt-cost">Custo (R$)</Label>
              <Input
                id="trt-cost"
                type="number"
                min={0}
                step="0.01"
                value={String(form.cost)}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="trt-desc">Descrição</Label>
            <Input
              id="trt-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trt-notes">Observações</Label>
            <Textarea
              id="trt-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}