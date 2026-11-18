'use client'

// Diálogo de criar/editar item de estoque.
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { label } from '@/lib/format'
import type { InventoryItem } from './types'

const CATEGORIES = ['racao', 'medicamento', 'higiene', 'limpeza', 'acessorio', 'outro']

type ItemForm = {
  name: string
  category: string
  unit: string
  minQuantity: number
  notes: string
}

const EMPTY: ItemForm = { name: '', category: 'racao', unit: 'un', minQuantity: 0, notes: '' }

export function ItemDialog({
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
  const [form, setForm] = useState<ItemForm>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      item
        ? {
            name: item.name,
            category: item.category,
            unit: item.unit,
            minQuantity: Number(item.minQuantity),
            notes: item.notes ?? '',
          }
        : EMPTY,
    )
  }, [open, item])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.name.trim().length < 2) {
      toast.error('Informe um nome para o item.')
      return
    }
    setSaving(true)
    const res = await fetch(item ? `/api/inventory/${item.id}` : '/api/inventory', {
      method: item ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      toast.success(item ? 'Item atualizado.' : 'Item cadastrado.')
      onOpenChange(false)
      onSaved()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Erro ao salvar o item.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Editar item' : 'Novo item'}</DialogTitle>
          <DialogDescription>Itens do estoque da ONG (ração, medicamentos, higiene...).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Nome *</Label>
            <Input
              id="item-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex.: Ração para filhotes"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="item-category">Categoria</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger id="item-category" className="w-full">
                  <SelectValue>{label(form.category)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {label(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-unit">Unidade</Label>
              <Input
                id="item-unit"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="un, kg, cx..."
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-min">Quantidade mínima (alerta)</Label>
            <Input
              id="item-min"
              type="number"
              min={0}
              step="any"
              value={String(form.minQuantity)}
              onChange={(e) => setForm({ ...form, minQuantity: Math.max(0, Number(e.target.value) || 0) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-notes">Observações</Label>
            <Textarea
              id="item-notes"
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