'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PawPrint, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { DogFormDialog, emptyDogForm } from '@/components/admin/dog-form-dialog'
import { CarregandoLista, ErroLista, MolduraTabela, SemResultados, VazioLista } from '@/components/admin/lista/estados'
import { BarraFiltros, CampoBusca, FiltroSelect, type Opcao } from '@/components/admin/lista/filtros'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { correspondeBusca, correspondeFiltro, descricaoContagem, TODOS } from '@/lib/busca'
import { label } from '@/lib/format'
import type { Dog } from '@/lib/schema'

const ESPECIES: Opcao[] = ['cao', 'gato'].map((v) => ({ value: v, label: label(v) }))
const SITUACOES: Opcao[] = ['disponivel', 'em_processo', 'em_tratamento', 'adotado', 'indisponivel'].map((v) => ({
  value: v,
  label: label(v),
}))

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
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [especie, setEspecie] = useState(TODOS)
  const [situacao, setSituacao] = useState(TODOS)
  const fileRef = useRef<HTMLInputElement>(null)

  async function fetchDogs() {
    try {
      const res = await fetch('/api/dogs')
      if (res.ok) {
        setDogs(await res.json())
        setErro(null)
      } else setErro('Não foi possível carregar os animais.')
    } catch {
      setErro('Falha de conexão ao carregar os animais.')
    } finally {
      setLoading(false)
    }
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

  const filtrando = busca.trim() !== '' || especie !== TODOS || situacao !== TODOS

  const filtrados = useMemo(
    () =>
      dogs.filter(
        (dog) =>
          correspondeFiltro(especie, dog.species) &&
          correspondeFiltro(situacao, dog.status) &&
          correspondeBusca(busca, dog.name, dog.breed),
      ),
    [dogs, busca, especie, situacao],
  )

  function limparFiltros() {
    setBusca('')
    setEspecie(TODOS)
    setSituacao(TODOS)
  }

  return (
    <AdminShell
      title="Animais"
      description={descricaoContagem(filtrados.length, dogs.length, 'animal no cadastro', 'animais no cadastro', filtrando)}
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="size-4" aria-hidden="true" /> Adicionar
        </Button>
      }
    >
      {loading ? (
        <CarregandoLista rotulo="Carregando animais" />
      ) : erro && dogs.length === 0 ? (
        <ErroLista mensagem={erro} onTentar={fetchDogs} />
      ) : dogs.length === 0 ? (
        <VazioLista
          icone={PawPrint}
          titulo="Nenhum animal cadastrado ainda"
          descricao="Cadastre o primeiro animal para ele aparecer na vitrine do site."
          acao={
            <Button onClick={openCreate} variant="outline" size="sm" className="gap-2">
              <Plus className="size-4" aria-hidden="true" /> Cadastrar primeiro
            </Button>
          }
        />
      ) : (
        <>
          <BarraFiltros rotulo="Filtros de animais" ativos={filtrando} onLimpar={limparFiltros}>
            <CampoBusca
              id="busca-animais"
              rotulo="Buscar por nome ou raça"
              valor={busca}
              onMudar={setBusca}
              placeholder="Ex.: Thor ou SRD"
            />
            <FiltroSelect id="filtro-especie" rotulo="Espécie" valor={especie} onMudar={setEspecie} opcoes={ESPECIES} rotuloTodos="Todas" />
            <FiltroSelect id="filtro-situacao" rotulo="Situação" valor={situacao} onMudar={setSituacao} opcoes={SITUACOES} rotuloTodos="Todas" />
          </BarraFiltros>

          {filtrados.length === 0 ? (
            <SemResultados onLimpar={limparFiltros} />
          ) : (
            <MolduraTabela rotulo="Lista de animais">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">
                      <span className="sr-only">Foto</span>
                    </TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead className="hidden md:table-cell">Sexo</TableHead>
                    <TableHead className="hidden lg:table-cell">Saúde</TableHead>
                    <TableHead className="hidden sm:table-cell">Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((dog) => (
                    <TableRow key={dog.id}>
                      <TableCell>
                        <span className="relative block size-10">
                          {dog.imageUrl ? (
                            <img src={dog.imageUrl} alt="" className="size-10 rounded-lg object-cover" />
                          ) : (
                            <span className="flex size-10 items-center justify-center rounded-lg bg-(--ant-foto-1)">
                              <PawPrint className="size-5 text-(--ant-cacau)" aria-hidden="true" />
                            </span>
                          )}
                          <span
                            aria-hidden="true"
                            className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-(--ant-branco)"
                            style={{ backgroundColor: dog.color }}
                          />
                        </span>
                      </TableCell>
                      <TableCell className="max-w-56 whitespace-normal">
                        <p className="font-semibold text-(--ant-tinta)">{dog.name}</p>
                        <p className="text-xs text-(--ant-tinta-suave)">
                          {label(dog.species)} · {dog.breed} · {dog.age}
                        </p>
                        <Badge variant={dog.available ? 'default' : 'secondary'} className="mt-1 sm:hidden">
                          {label(dog.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{label(dog.sex)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {dog.castrated || dog.vaccinated ? (
                          <span className="flex flex-wrap gap-1">
                            {dog.castrated && <Badge variant="outline">Castrado</Badge>}
                            {dog.vaccinated && <Badge variant="outline">Vacinado</Badge>}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={dog.available ? 'default' : 'secondary'}>{label(dog.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {deleteId === dog.id ? (
                          <>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleDelete(dog.id)}
                              aria-label={`Confirmar remoção de ${dog.name}`}
                            >
                              <Check className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="ml-1"
                              onClick={() => setDeleteId(null)}
                              aria-label={`Cancelar remoção de ${dog.name}`}
                            >
                              <X className="size-4" aria-hidden="true" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(dog)} aria-label={`Editar ${dog.name}`}>
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(dog.id)}
                              aria-label={`Remover ${dog.name}`}
                            >
                              <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </MolduraTabela>
          )}
        </>
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
