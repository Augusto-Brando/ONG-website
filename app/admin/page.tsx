'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PawPrint, Plus, Pencil, Trash2, LogOut, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Dog } from '@/lib/schema'

const COLORS = [
  { label: 'Laranja', value: '#F97316' },
  { label: 'Roxo', value: '#8B5CF6' },
  { label: 'Rosa', value: '#EC4899' },
  { label: 'Azul', value: '#06B6D4' },
]

const emptyForm = {
  name: '',
  breed: 'Vira-lata',
  age: '',
  weight: '',
  description: '',
  observations: '',
  color: '#F97316',
  available: true,
  imageUrl: '',
}

export default function AdminPage() {
  const router = useRouter()
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Dog | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function fetchDogs() {
    const res = await fetch('/api/dogs')
    if (res.ok) setDogs(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchDogs() }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setPhotoFile(null)
    setPhotoPreview('')
    setOpen(true)
  }

  function openEdit(dog: Dog) {
    setEditing(dog)
    setForm({
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      weight: dog.weight ?? '',
      description: dog.description,
      observations: dog.observations ?? '',
      color: dog.color,
      available: dog.available,
      imageUrl: dog.imageUrl,
    })
    setPhotoFile(null)
    setPhotoPreview(dog.imageUrl)
    setOpen(true)
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
    if (photoFile) fd.append('photo', photoFile)

    const url = editing ? `/api/dogs/${editing.id}` : '/api/dogs'
    const method = editing ? 'PUT' : 'POST'

    const res = await fetch(url, { method, body: fd })

    if (res.ok) {
      toast.success(editing ? 'Animal atualizado!' : 'Animal cadastrado!')
      setOpen(false)
      fetchDogs()
    } else {
      toast.error('Erro ao salvar. Verifique os dados e tente novamente.')
    }

    setSaving(false)
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/dogs/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Animal removido.')
      setDogs((prev) => prev.filter((d) => d.id !== id))
    } else {
      toast.error('Erro ao remover.')
    }
    setDeleteId(null)
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-primary leading-none">Admin</p>
              <p className="text-xs text-muted-foreground">Amor não tem Raça</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={openCreate} size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Animais Cadastrados</h1>
          <p className="text-sm text-muted-foreground mt-1">{dogs.length} animal(is) no cadastro</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando...</div>
        ) : dogs.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <PawPrint className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">Nenhum animal cadastrado ainda.</p>
            <Button onClick={openCreate} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Cadastrar primeiro
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dogs.map((dog) => (
              <div key={dog.id} className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="aspect-square relative overflow-hidden bg-muted">
                  {dog.imageUrl ? (
                    <img src={dog.imageUrl} alt={dog.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PawPrint className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div
                    className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: dog.color }}
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{dog.name}</p>
                      <p className="text-xs text-muted-foreground">{dog.breed} · {dog.age}</p>
                    </div>
                    <Badge variant={dog.available ? 'default' : 'secondary'} className="shrink-0 text-xs">
                      {dog.available ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </div>
                  {dog.weight && (
                    <p className="text-xs text-muted-foreground">Peso: {dog.weight}</p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2">{dog.description}</p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1 text-xs"
                      onClick={() => openEdit(dog)}
                    >
                      <Pencil className="w-3 h-3" /> Editar
                    </Button>
                    {deleteId === dog.id ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1 text-xs px-2"
                          onClick={() => handleDelete(dog.id)}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="px-2"
                          onClick={() => setDeleteId(null)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(dog.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Animal' : 'Novo Animal'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Photo */}
            <div className="space-y-2">
              <Label>Foto</Label>
              <div
                className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                    <PawPrint className="w-8 h-8" />
                    <span className="text-sm">Clique para selecionar</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Raça</Label>
                <Input
                  id="breed"
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Idade *</Label>
                <Input
                  id="age"
                  placeholder="ex: 2 anos"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso</Label>
                <Input
                  id="weight"
                  placeholder="ex: 15kg"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Fale sobre a personalidade do animal..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                rows={2}
                placeholder="Cuidados especiais, histórico, etc..."
                value={form.observations}
                onChange={(e) => setForm({ ...form, observations: e.target.value })}
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Cor do card</Label>
              <div className="flex gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onClick={() => setForm({ ...form, color: c.value })}
                    className="w-8 h-8 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: c.value,
                      borderColor: form.color === c.value ? '#000' : 'transparent',
                      outline: form.color === c.value ? `2px solid ${c.value}` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Available */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="available"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <Label htmlFor="available" className="cursor-pointer">Disponível para adoção</Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
