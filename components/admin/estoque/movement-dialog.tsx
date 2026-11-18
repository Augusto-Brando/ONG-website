'use client'

// Diálogo de movimentação de estoque (entrada/saída) para um item.
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { todayIso } from '@/lib/format'
import type { InventoryItem } from './types'

type MovementForm = {
  type: string
  quantity: number
  reason: string
  date: string
}

export function MovementDialog({
  open,
  onOpenChange,
  item,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<MovementForm>({ type: 'entrada', quantity: 1, reason: '', date: todayIso() })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm({ type: 'entrada', quantity: 1, reason: '', date: todayIso() })
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!item) return
    if (form.quantity <= 0) {
      toast.error('A quantidade deve ser maior que zero.')
      return
    }
    setSaving(true)
    const res = await fetch('/api/inventory/movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, type: form.type, quantity: form.quantity, reason: form.reason, date: form.date }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Movimentação registrada.')
      onOpenChange(false)
      onSaved()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Erro ao registrar a movimentação.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Movimentar {item ? `“${item.name}”` : ''}</DialogTitle>
          <DialogDescription>
            Saldo atual: {item ? Number(item.quantity).toLocaleString('pt-BR') : 0} {item?.unit ?? ''}.
            Entrada soma e saída subtrai do saldo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mov-type">Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="mov-type" className="w-full">
                  <SelectValue>{form.type === 'entrada' ? 'Entrada' : 'Saída'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mov-qty">Quantidade *</Label>
              <Input
                id="mov-qty"
                type="number"
                min={0.01}
                step="any"
                value={String(form.quantity)}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 0 })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mov-date">Data</Label>
            <Input
              id="mov-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mov-reason">Motivo</Label>
            <Input
              id="mov-reason"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Ex.: doação recebida, uso nos animais"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}