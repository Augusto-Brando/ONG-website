'use client'

// Diálogo de criação/edição de lançamento. A categoria sugere valores de um
// <datalist>; lançamentos que vieram de uma doação não são editáveis por aqui.
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
import { CATEGORY_OPTIONS, type TransactionForm, type TransactionRow } from './types'

const empty: TransactionForm = {
  kind: 'receita',
  category: '',
  description: '',
  amount: '',
  date: todayIso(),
}

export function TransactionDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: TransactionRow | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<TransactionForm>(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setForm({
        kind: editing.kind,
        category: editing.category,
        description: editing.description,
        amount: String(editing.amount),
        date: editing.date,
      })
    } else {
      setForm(empty)
    }
  }, [open, editing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valor = Number(form.amount)
    if (!Number.isFinite(valor) || valor <= 0) {
      toast.error('Informe um valor maior que zero.')
      return
    }
    setSaving(true)
    const res = await fetch(editing ? `/api/transactions/${editing.id}` : '/api/transactions', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: form.kind,
        category: form.category,
        description: form.description,
        amount: valor,
        date: form.date,
      }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success(editing ? 'Lançamento atualizado.' : 'Lançamento criado.')
      onOpenChange(false)
      onSaved()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Erro ao salvar o lançamento.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar lançamento' : 'Novo lançamento'}</DialogTitle>
          <DialogDescription>
            Registre receitas e despesas do período. Doações entram automaticamente no financeiro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kind">Tipo *</Label>
            <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
              <SelectTrigger id="kind" className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Input
              id="category"
              list="categorias-lancamento"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Ex.: racao"
              required
            />
            <datalist id="categorias-lancamento">
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex.: compra de ração para o canil"
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
