'use client'

import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell, useMe } from '@/components/admin/admin-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, label } from '@/lib/format'
import type { PublicUser } from '@/lib/users'

const empty = { name: '', email: '', role: 'voluntario' as PublicUser['role'], active: true, password: '' }

const ROLE_HELP: Record<PublicUser['role'], string> = {
  admin: 'Acesso a tudo, inclusive usuários.',
  voluntario: 'Animais, tratamentos, estoque, adoções, notícias e voluntários.',
  financeiro: 'Doações, financeiro, relatórios e estoque.',
}

export default function UsuariosPage() {
  const me = useMe()
  const [rows, setRows] = useState<PublicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/users')
    if (res.ok) setRows(await res.json())
    else toast.error('Erro ao carregar usuários.')
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

  function openEdit(u: PublicUser) {
    setEditingId(u.id)
    setForm({ name: u.name, email: u.email, role: u.role, active: u.active, password: '' })
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { password, ...rest } = form
    const res = await fetch(editingId ? `/api/users/${editingId}` : '/api/users', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(password ? { ...rest, password } : rest),
    })
    setSaving(false)
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      toast.success(editingId ? 'Usuário atualizado.' : 'Usuário criado.')
      setOpen(false)
      load()
    } else {
      toast.error(data.issues?.password?.[0] || data.error || 'Erro ao salvar.')
    }
  }

  async function handleDelete(u: PublicUser) {
    if (!confirm(`Excluir o usuário ${u.name}?`)) return
    const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      toast.success('Usuário excluído.')
      setRows((prev) => prev.filter((r) => r.id !== u.id))
    } else toast.error(data.error || 'Erro ao excluir.')
  }

  return (
    <AdminShell
      title="Usuários"
      description="Quem pode entrar no painel e o que cada perfil enxerga"
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Novo usuário
        </Button>
      }
    >
      {loading ? (
        <p className="py-20 text-center text-muted-foreground">Carregando...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Último acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.name} {me?.uid === u.id && <span className="text-xs text-muted-foreground">(você)</span>}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{label(u.role)}</TableCell>
                  <TableCell>
                    <Badge variant={u.active ? 'default' : 'secondary'}>{u.active ? 'Ativo' : 'Inativo'}</Badge>
                  </TableCell>
                  <TableCell>{u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Nunca'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(u)} aria-label={`Editar ${u.name}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(u)}
                      disabled={me?.uid === u.id}
                      aria-label={`Excluir ${u.name}`}
                    >
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
            <DialogTitle>{editingId ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
            <DialogDescription>{ROLE_HELP[form.role]}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Perfil *</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as PublicUser['role'] })}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="voluntario">Voluntário</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{editingId ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editingId}
                aria-describedby="password-help"
              />
              <p id="password-help" className="text-xs text-muted-foreground">
                Mínimo de 8 caracteres.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="active" checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c === true })} />
              <Label htmlFor="active">Ativo (pode entrar no painel)</Label>
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
