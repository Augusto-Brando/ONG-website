'use client'

// Diálogo de criação/edição de doação. A campanha vem de GET /api/campaigns.
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { todayIso } from '@/lib/format'
import { DONATION_TYPES, NONE, PAYMENT_METHODS, type CampaignRow, type DonationForm, type DonationRow } from './types'

const empty: DonationForm = {
  donorName: '',
  donorEmail: '',
  donorPhone: '',
  type: 'dinheiro',
  amount: '',
  description: '',
  method: NONE,
  campaignId: NONE,
  receivedAt: todayIso(),
}

export function DonationDialog({
  open,
  onOpenChange,
  editing,
  campaigns,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: DonationRow | null
  campaigns: CampaignRow[]
  onSaved: () => void
}) {
  const [form, setForm] = useState<DonationForm>(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setForm({
        donorName: editing.donorName ?? '',
        donorEmail: editing.donorEmail ?? '',
        donorPhone: editing.donorPhone ?? '',
        type: editing.type,
        amount: editing.amount === null ? '' : String(editing.amount),
        description: editing.description ?? '',
        method: editing.method ?? NONE,
        campaignId: editing.campaignId === null ? NONE : String(editing.campaignId),
        receivedAt: editing.receivedAt,
      })
    } else {
      setForm(empty)
    }
  }, [open, editing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valor = form.amount.trim() === '' ? null : Number(form.amount)
    if (valor !== null && (!Number.isFinite(valor) || valor < 0)) {
      toast.error('Informe um valor válido.')
      return
    }
    setSaving(true)
    const res = await fetch(editing ? `/api/donations/${editing.id}` : '/api/donations', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donorName: form.donorName.trim() === '' ? null : form.donorName.trim(),
        donorEmail: form.donorEmail.trim(),
        donorPhone: form.donorPhone.trim() === '' ? null : form.donorPhone.trim(),
        type: form.type,
        amount: valor,
        description: form.description,
        method: form.method === NONE ? null : form.method,
        campaignId: form.campaignId === NONE ? null : Number(form.campaignId),
        receivedAt: form.receivedAt,
      }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success(editing ? 'Doação atualizada.' : 'Doação registrada.')
      onOpenChange(false)
      onSaved()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Erro ao salvar a doação.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar doação' : 'Nova doação'}</DialogTitle>
          <DialogDescription>
            Doações em dinheiro entram automaticamente como receita no financeiro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="donorName">Doador</Label>
            <Input
              id="donorName"
              value={form.donorName}
              onChange={(e) => setForm({ ...form, donorName: e.target.value })}
              placeholder="Deixe em branco para doar como Anônimo"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="donorEmail">E-mail</Label>
              <Input
                id="donorEmail"
                type="email"
                value={form.donorEmail}
                onChange={(e) => setForm({ ...form, donorEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donorPhone">Telefone</Label>
              <Input
                id="donorPhone"
                type="tel"
                value={form.donorPhone}
                onChange={(e) => setForm({ ...form, donorPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="donation-type">Tipo *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="donation-type" className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {DONATION_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="method">Forma</Label>
              <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                <SelectTrigger id="method" className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Não informada</SelectItem>
                  {PAYMENT_METHODS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="receivedAt">Data da doação *</Label>
              <Input
                id="receivedAt"
                type="date"
                value={form.receivedAt}
                onChange={(e) => setForm({ ...form, receivedAt: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign">Campanha</Label>
            <Select value={form.campaignId} onValueChange={(v) => setForm({ ...form, campaignId: v })}>
              <SelectTrigger id="campaign" className="w-full">
                <SelectValue placeholder="Sem campanha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Sem campanha</SelectItem>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={String(campaign.id)}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex.: 20 kg de ração adulto"
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
