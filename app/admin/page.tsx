'use client'

import { useEffect, useRef, useState } from 'react'
import { PawPrint, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DogFormDialog, emptyDogForm } from '@/components/admin/dog-form-dialog'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { label } from '@/lib/format'
import type { Dog } from '@/lib/schema'

function buildImageList(dog: Dog): string[] {
  return Array.from(
    new Set([dog.imageUrl, ...((dog.images as string[] | null) ?? [])].filter(Boolean)),
  )
}

export default function AdminPage() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Dog | null>(null)
  const [form, setForm] = useState(emptyDogForm)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newPhotos, setNewPhotos] = useState<{ file: File; preview: string }[]>([])
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
    setForm(emptyDogForm)
    setExistingImages([])
    setNewPhotos([])
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
      species: dog.species,
      sex: dog.sex,
      status: dog.status,
      castrated: dog.castrated,
      vaccinated: dog.vaccinated,
      rescuedAt: dog.rescuedAt ?? '',
    })
    setExistingImages(buildImageList(dog))
    setNewPhotos([])
    setOpen(true)
  }

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setNewPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ])
    e.target.value = ''
  }

  function removeExisting(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url))
  }

  function makeCover(url: string) {
    setExistingImages((prev) => [url, ...prev.filter((u) => u !== url)])
  }

  function removeNewPhoto(index: number) {
    setNewPhotos((prev) => {
      const item = prev[index]
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
    fd.set('existingImages', JSON.stringify(existingImages))
    fd.set('imageUrl', existingImages[0] ?? '')
    newPhotos.forEach(({ file }) => fd.append('photos', file))

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

  return (
    <AdminShell
      title="Animais"
      description={`${dogs.length} animal(is) no cadastro`}
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="w-4 h-4" aria-hidden="true" /> Adicionar
        </Button>
      }
    >
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
                      <p className="text-xs text-muted-foreground">{label(dog.species)} · {dog.breed} · {dog.age}</p>
                    </div>
                    <Badge variant={dog.available ? 'default' : 'secondary'} className="shrink-0 text-xs">
                      {label(dog.status)}
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
                          aria-label={`Confirmar remoção de ${dog.name}`}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="px-2"
                          onClick={() => setDeleteId(null)}
                          aria-label="Cancelar remoção"
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
                        aria-label={`Remover ${dog.name}`}
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

      <DogFormDialog
        open={open}
        setOpen={setOpen}
        editing={editing}
        form={form}
        setForm={setForm}
        existingImages={existingImages}
        newPhotos={newPhotos}
        saving={saving}
        fileRef={fileRef}
        onSubmit={handleSave}
        onPhotosChange={handlePhotos}
        onRemoveExisting={removeExisting}
        onMakeCover={makeCover}
        onRemoveNewPhoto={removeNewPhoto}
      />
    </AdminShell>
  )
}
