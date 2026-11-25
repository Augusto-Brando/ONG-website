'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PublicUser } from '@/lib/users'

const EMPTY = { name: '', email: '', role: 'voluntario' as PublicUser['role'], active: true, password: '' }

export const ROLE_HELP: Record<PublicUser['role'], string> = {
  admin: 'Acesso a tudo, inclusive usuários.',
  voluntario: 'Animais, tratamentos, estoque, adoções, notícias e voluntários.',
  financeiro: 'Doações, financeiro, relatórios e estoque.',
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: PublicUser | null
  onSaved: () => void
}) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(user ? { name: user.name, email: user.email, role: user.role, active: user.active, password: '' } : EMPTY)
  }, [open, user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { password, ...rest } = form
    try {
      const res = await fetch(user ? `/api/users/${user.id}` : '/api/users', {
        method: user ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(password ? { ...rest, password } : rest),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success(user ? 'Usuário atualizado.' : 'Usuário criado.')
        onOpenChange(false)
        onSaved()
      } else {
        toast.error(data.issues?.password?.[0] || data.error || 'Erro ao salvar.')
      }
    } catch {
      toast.error('Falha de conexão ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
          <DialogDescription>{ROLE_HELP[form.role]}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Nome *</Label>
            <Input id="user-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email">E-mail *</Label>
            <Input
              id="user-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-role">Perfil *</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as PublicUser['role'] })}>
              <SelectTrigger id="user-role">
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
            <Label htmlFor="user-password">{user ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}</Label>
            <Input
              id="user-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!user}
              aria-describedby="user-password-help"
            />
            <p id="user-password-help" className="text-xs text-(--ant-tinta-suave)">
              Mínimo de 8 caracteres.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="user-active" checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c === true })} />
            <Label htmlFor="user-active">Ativo (pode entrar no painel)</Label>
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
