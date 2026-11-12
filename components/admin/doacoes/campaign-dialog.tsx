'use client'

// Diálogo de criação/edição de campanha.
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { todayIso } from '@/lib/format'
import type { CampaignForm, CampaignRow } from './types'

const empty: CampaignForm = {
  title: '',
  description: '',
  goalAmount: '',
  startDate: todayIso(),
  endDate: '',
  active: true,
}

export function CampaignDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: CampaignRow | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<CampaignForm>(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setForm({
        title: editing.title,
        description: editing.description ?? '',
        goalAmount: editing.goalAmount === null ? '' : String(editing.goalAmount),
        startDate: editing.startDate,
        endDate: editing.endDate ?? '',
        active: editing.active,
      })
    } else {
      setForm(empty)
    }
  }, [open, editing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const meta = form.goalAmount.trim() === '' ? null : Number(form.goalAmount)
    if (meta !== null && (!Number.isFinite(meta) || meta < 0)) {
      toast.error('Informe uma meta válida.')
      return
    }
    setSaving(true)
    const res = await fetch(editing ? `/api/campaigns/${editing.id}` : '/api/campaigns', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description,
        goalAmount: meta,
        startDate: form.startDate,
        endDate: form.endDate.trim() === '' ? null : form.endDate,
        active: form.active,
      }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success(editing ? 'Campanha atualizada.' : 'Campanha criada.')
      onOpenChange(false)
      onSaved()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Erro ao salvar a campanha.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar campanha' : 'Nova campanha'}</DialogTitle>
          <DialogDescription>
            Campanhas agrupam doações e mostram o progresso da meta de arrecadação.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex.: Natal sem abandono"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-description">Descrição</Label>
            <Textarea
              id="campaign-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex.: Ração e vacinas para o fim de ano."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalAmount">Meta (R$)</Label>
            <Input
              id="goalAmount"
              type="number"
              min="0"
              step="0.01"
              value={form.goalAmount}
              onChange={(e) => setForm({ ...form, goalAmount: e.target.value })}
              placeholder="0,00"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="campaign-active"
              checked={form.active}
              onCheckedChange={(c) => setForm({ ...form, active: c === true })}
            />
            <Label htmlFor="campaign-active">Campanha ativa</Label>
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
