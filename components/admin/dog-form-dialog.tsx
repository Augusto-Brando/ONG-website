'use client'

import { Dispatch, RefObject, SetStateAction } from 'react'
import { ImagePlus, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Dog } from '@/lib/schema'

export type DogFormState = {
  name: string
  breed: string
  age: string
  weight: string
  description: string
  observations: string
  color: string
  available: boolean
  imageUrl: string
}

type NewPhoto = { file: File; preview: string }

type DogFormDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  editing: Dog | null
  form: DogFormState
  setForm: Dispatch<SetStateAction<DogFormState>>
  existingImages: string[]
  newPhotos: NewPhoto[]
  saving: boolean
  fileRef: RefObject<HTMLInputElement | null>
  onSubmit: (event: React.FormEvent) => void
  onPhotosChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveExisting: (url: string) => void
  onMakeCover: (url: string) => void
  onRemoveNewPhoto: (index: number) => void
}

const COLORS = [
  { label: 'Laranja', value: '#F97316' },
  { label: 'Roxo', value: '#8B5CF6' },
  { label: 'Rosa', value: '#EC4899' },
  { label: 'Azul', value: '#06B6D4' },
]

export const emptyDogForm: DogFormState = {
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

export function DogFormDialog({
  open,
  setOpen,
  editing,
  form,
  setForm,
  existingImages,
  newPhotos,
  saving,
  fileRef,
  onSubmit,
  onPhotosChange,
  onRemoveExisting,
  onMakeCover,
  onRemoveNewPhoto,
}: DogFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Animal' : 'Novo Animal'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Fotos</Label>
            <p className="text-xs text-muted-foreground">
              A primeira imagem é a capa. É possível adicionar várias fotos por animal.
            </p>

            {(existingImages.length > 0 || newPhotos.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {existingImages.map((url, idx) => (
                  <div key={url} className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                    <img src={url} alt={`foto ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5" /> Capa
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      {idx !== 0 && (
                        <button
                          type="button"
                          title="Tornar capa"
                          onClick={() => onMakeCover(url)}
                          className="bg-white/90 hover:bg-white text-foreground rounded-full w-7 h-7 flex items-center justify-center"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Remover"
                        onClick={() => onRemoveExisting(url)}
                        className="bg-white/90 hover:bg-white text-destructive rounded-full w-7 h-7 flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {newPhotos.map((photo, idx) => (
                  <div
                    key={photo.preview}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-dashed border-primary/40"
                  >
                    <img src={photo.preview} alt={`nova foto ${idx + 1}`} className="w-full h-full object-cover" />
                    {existingImages.length === 0 && idx === 0 && (
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5" /> Capa
                      </span>
                    )}
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      Nova
                    </span>
                    <button
                      type="button"
                      title="Remover"
                      onClick={() => onRemoveNewPhoto(idx)}
                      className="absolute top-1 right-1 bg-white/90 hover:bg-white text-destructive rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors py-4 flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-sm">Adicionar fotos</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPhotosChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Raça</Label>
              <Input id="breed" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Idade *</Label>
              <Input id="age" placeholder="ex: 2 anos" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso</Label>
              <Input id="weight" placeholder="ex: 15kg" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
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

          <div className="space-y-2">
            <Label>Cor do card</Label>
            <div className="flex gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  title={color.label}
                  onClick={() => setForm({ ...form, color: color.value })}
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: color.value,
                    borderColor: form.color === color.value ? '#000' : 'transparent',
                    outline: form.color === color.value ? `2px solid ${color.value}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

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
  )
}
