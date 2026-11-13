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
  species: string
  sex: string
  status: string
  castrated: boolean
  vaccinated: boolean
  rescuedAt: string
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

const selectClass =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

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
  species: 'cao',
  sex: 'indefinido',
  status: 'disponivel',
  castrated: false,
  vaccinated: false,
  rescuedAt: '',
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
          <div className="space-y-2" role="group" aria-labelledby="fotos-label">
            <Label id="fotos-label">Fotos</Label>
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
                          aria-label="Tornar capa"
                          onClick={() => onMakeCover(url)}
                          className="bg-white/90 hover:bg-white text-foreground rounded-full w-7 h-7 flex items-center justify-center"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Remover"
                        aria-label="Remover foto"
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
                        aria-label="Remover foto"
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
            <input
              ref={fileRef}
              id="fotos-input"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPhotosChange}
            />
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

          <div className="space-y-2" role="group" aria-labelledby="cor-card-label">
            <Label id="cor-card-label">Cor do card</Label>
            <div className="flex gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  title={color.label}
                  aria-label={`Cor ${color.label}`}
                  aria-pressed={form.color === color.value}
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="species">Espécie</Label>
              <select id="species" className={selectClass} value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}>
                <option value="cao">Cão</option>
                <option value="gato">Gato</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sexo</Label>
              <select id="sex" className={selectClass} value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
                <option value="indefinido">Não informado</option>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Situação</Label>
              <select id="status" className={selectClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="disponivel">Disponível para adoção</option>
                <option value="em_processo">Em processo de adoção</option>
                <option value="em_tratamento">Em tratamento</option>
                <option value="adotado">Adotado</option>
                <option value="indisponivel">Indisponível</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Só animais com situação Disponível ou Em processo de adoção aparecem no site.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rescuedAt">Data do resgate</Label>
              <Input id="rescuedAt" type="date" value={form.rescuedAt} onChange={(e) => setForm({ ...form, rescuedAt: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 sm:pt-7">
              <input type="checkbox" id="castrated" checked={form.castrated} onChange={(e) => setForm({ ...form, castrated: e.target.checked })} className="h-4 w-4 accent-primary" />
              <Label htmlFor="castrated" className="cursor-pointer">Castrado</Label>
            </div>
            <div className="flex items-center gap-2 sm:pt-7">
              <input type="checkbox" id="vaccinated" checked={form.vaccinated} onChange={(e) => setForm({ ...form, vaccinated: e.target.checked })} className="h-4 w-4 accent-primary" />
              <Label htmlFor="vaccinated" className="cursor-pointer">Vacinado</Label>
            </div>
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
