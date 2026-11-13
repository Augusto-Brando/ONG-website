'use client'

// MÓDULO DE REFERÊNCIA (tela): lista + diálogo de criar/editar + excluir.
// Copie este padrão nas telas novas: AdminShell, fetch na API, toast, Table, Dialog.
import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Volunteer } from '@/lib/schema'

const empty = { name: '', email: '', phone: '', availability: '', skills: '', active: true, consentLgpd: false }

export default function VoluntariosPage() {
  const [rows, setRows] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/volunteers')
    if (res.ok) setRows(await res.json())
    else toast.error('Erro ao carregar voluntários.')
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(empty)
    setOpen(true)
  }

  function openEdit(v: Volunteer) {
    setEditingId(v.id)
    setForm({
      name: v.name,
      email: v.email ?? '',
      phone: v.phone ?? '',
      availability: v.availability ?? '',
      skills: v.skills ?? '',
      active: v.active,
      consentLgpd: v.consentLgpd,
    })
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(editingId ? `/api/volunteers/${editingId}` : '/api/volunteers', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      toast.success(editingId ? 'Voluntário atualizado.' : 'Voluntário cadastrado.')
      setOpen(false)
      load()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Erro ao salvar.')
    }
  }

  async function handleDelete(v: Volunteer) {
    if (!confirm(`Remover ${v.name}?`)) return
    const res = await fetch(`/api/volunteers/${v.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Voluntário removido.')
      setRows((prev) => prev.filter((r) => r.id !== v.id))
    } else toast.error('Erro ao remover.')
  }

  return (
    <AdminShell
      title="Voluntários"
      description={`${rows.length} voluntário(s) cadastrado(s)`}
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Adicionar
        </Button>
      }
    >
      {loading ? (
        <p className="py-20 text-center text-muted-foreground">Carregando...</p>
      ) : rows.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">Nenhum voluntário cadastrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Disponibilidade</TableHead>
                <TableHead>Habilidades</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{[v.phone, v.email].filter(Boolean).join(' · ') || '—'}</TableCell>
                  <TableCell>{v.availability || '—'}</TableCell>
                  <TableCell>{v.skills || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={v.active ? 'default' : 'secondary'}>{v.active ? 'Ativo' : 'Inativo'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(v)} aria-label={`Editar ${v.name}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(v)} aria-label={`Remover ${v.name}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar voluntário' : 'Novo voluntário'}</DialogTitle>
            <DialogDescription>Dados usados apenas para contato pela equipe da ONG.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Disponibilidade</Label>
              <Input id="availability" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="Ex.: sábados de manhã" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Habilidades</Label>
              <Input id="skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Ex.: passeios, redes sociais" />
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Checkbox id="active" checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c === true })} />
                <Label htmlFor="active">Ativo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="consent" checked={form.consentLgpd} onCheckedChange={(c) => setForm({ ...form, consentLgpd: c === true })} />
                <Label htmlFor="consent">Autorizou o uso dos dados (LGPD)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
