'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Volunteer } from '@/lib/schema'

const EMPTY = { name: '', email: '', phone: '', availability: '', skills: '', active: true, consentLgpd: false }

export function VolunteerDialog({
  open,
  onOpenChange,
  volunteer,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  volunteer: Volunteer | null
  onSaved: () => void
}) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      volunteer
        ? {
            name: volunteer.name,
            email: volunteer.email ?? '',
            phone: volunteer.phone ?? '',
            availability: volunteer.availability ?? '',
            skills: volunteer.skills ?? '',
            active: volunteer.active,
            consentLgpd: volunteer.consentLgpd,
          }
        : EMPTY,
    )
  }, [open, volunteer])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(volunteer ? `/api/volunteers/${volunteer.id}` : '/api/volunteers', {
        method: volunteer ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success(volunteer ? 'Voluntário atualizado.' : 'Voluntário cadastrado.')
        onOpenChange(false)
        onSaved()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Erro ao salvar.')
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
          <DialogTitle>{volunteer ? 'Editar voluntário' : 'Novo voluntário'}</DialogTitle>
          <DialogDescription>Dados usados apenas para contato pela equipe da ONG.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vol-name">Nome *</Label>
            <Input id="vol-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vol-phone">Telefone</Label>
              <Input id="vol-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vol-email">E-mail</Label>
              <Input
                id="vol-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vol-availability">Disponibilidade</Label>
            <Input
              id="vol-availability"
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value })}
              placeholder="Ex.: sábados de manhã"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vol-skills">Habilidades</Label>
            <Input
              id="vol-skills"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="Ex.: passeios, redes sociais"
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Checkbox id="vol-active" checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c === true })} />
              <Label htmlFor="vol-active">Ativo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="vol-consent"
                checked={form.consentLgpd}
                onCheckedChange={(c) => setForm({ ...form, consentLgpd: c === true })}
              />
              <Label htmlFor="vol-consent">Autorizou o uso dos dados (LGPD)</Label>
            </div>
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
