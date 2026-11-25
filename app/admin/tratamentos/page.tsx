'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Stethoscope, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { CarregandoLista, ErroLista, MolduraTabela, SemResultados, VazioLista } from '@/components/admin/lista/estados'
import { BarraFiltros, CampoBusca, FiltroSelect, type Opcao } from '@/components/admin/lista/filtros'
import { TreatmentDialog } from '@/components/admin/tratamentos/treatment-dialog'
import { UpcomingList } from '@/components/admin/tratamentos/upcoming-list'
import type { DogRow, TreatmentRow } from '@/components/admin/tratamentos/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { correspondeBusca, correspondeFiltro, descricaoContagem, TODOS } from '@/lib/busca'
import { formatDate, formatMoney, label, todayIso } from '@/lib/format'

const TIPOS: Opcao[] = ['vacina', 'vermifugo', 'castracao', 'consulta', 'medicacao', 'cirurgia', 'exame', 'outro'].map(
  (v) => ({ value: v, label: label(v) }),
)
const STATUS: Opcao[] = ['agendado', 'realizado', 'cancelado'].map((v) => ({ value: v, label: label(v) }))

function plusDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export default function TratamentosPage() {
  const [treatments, setTreatments] = useState<TreatmentRow[]>([])
  const [dogs, setDogs] = useState<DogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<TreatmentRow | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [filterAnimal, setFilterAnimal] = useState(TODOS)
  const [filterStatus, setFilterStatus] = useState(TODOS)
  const [filterTipo, setFilterTipo] = useState(TODOS)
  const [busca, setBusca] = useState('')

  const loadDogs = useCallback(async () => {
    const res = await fetch('/api/dogs')
    if (res.ok) {
      const data: DogRow[] = await res.json()
      setDogs(data.map((d) => ({ id: d.id, name: d.name, species: d.species })))
    }
  }, [])

  const loadTreatments = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterAnimal !== TODOS) params.set('animalId', filterAnimal)
    if (filterStatus !== TODOS) params.set('status', filterStatus)
    const qs = params.toString()
    try {
      const res = await fetch(`/api/treatments${qs ? `?${qs}` : ''}`)
      if (res.ok) {
        setTreatments(await res.json())
        setErro(null)
      } else setErro('Não foi possível carregar os tratamentos.')
    } catch {
      setErro('Falha de conexão ao carregar os tratamentos.')
    } finally {
      setLoading(false)
    }
  }, [filterAnimal, filterStatus])

  useEffect(() => {
    loadDogs()
  }, [loadDogs])

  useEffect(() => {
    setLoading(true)
    loadTreatments()
  }, [loadTreatments])

  function openCreate() {
    setEditingTreatment(null)
    setDialogOpen(true)
  }

  function openEdit(t: TreatmentRow) {
    setEditingTreatment(t)
    setDialogOpen(true)
  }

  async function handleDelete(t: TreatmentRow) {
    const animalName = t.animal?.name ?? 'esse animal'
    if (!confirm(`Remover tratamento de ${animalName}?`)) return
    const res = await fetch(`/api/treatments/${t.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Tratamento removido.')
      setTreatments((prev) => prev.filter((r) => r.id !== t.id))
    } else toast.error('Erro ao remover o tratamento.')
  }

  const today = todayIso()
  const limitIso = plusDays(today, 30)

  const filtrando = busca.trim() !== '' || filterAnimal !== TODOS || filterStatus !== TODOS || filterTipo !== TODOS

  const filtrados = useMemo(
    () =>
      treatments.filter(
        (t) =>
          correspondeFiltro(filterTipo, t.type) &&
          correspondeBusca(busca, t.animal?.name, t.description, t.veterinarian, label(t.type)),
      ),
    [treatments, busca, filterTipo],
  )

  const animais: Opcao[] = useMemo(() => dogs.map((d) => ({ value: String(d.id), label: d.name })), [dogs])

  function limparFiltros() {
    setBusca('')
    setFilterAnimal(TODOS)
    setFilterStatus(TODOS)
    setFilterTipo(TODOS)
  }

  return (
    <AdminShell
      title="Tratamentos"
      description={descricaoContagem(filtrados.length, treatments.length, 'tratamento', 'tratamentos', busca.trim() !== '' || filterTipo !== TODOS)}
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="size-4" aria-hidden="true" /> Novo tratamento
        </Button>
      }
    >
      <div className="space-y-6">
        {!loading && !erro && <UpcomingList treatments={treatments} today={today} limitIso={limitIso} />}

        <BarraFiltros rotulo="Filtros de tratamentos" ativos={filtrando} onLimpar={limparFiltros}>
          <CampoBusca
            id="busca-tratamentos"
            rotulo="Buscar por animal, descrição ou veterinário"
            valor={busca}
            onMudar={setBusca}
            placeholder="Ex.: Thor ou V10"
          />
          <FiltroSelect id="filter-animal" rotulo="Animal" valor={filterAnimal} onMudar={setFilterAnimal} opcoes={animais} />
          <FiltroSelect id="filter-tipo" rotulo="Tipo" valor={filterTipo} onMudar={setFilterTipo} opcoes={TIPOS} />
          <FiltroSelect id="filter-status" rotulo="Status" valor={filterStatus} onMudar={setFilterStatus} opcoes={STATUS} />
        </BarraFiltros>

        {loading ? (
          <CarregandoLista rotulo="Carregando tratamentos" />
        ) : erro ? (
          <ErroLista mensagem={erro} onTentar={loadTreatments} />
        ) : treatments.length === 0 && !filtrando ? (
          <VazioLista
            icone={Stethoscope}
            titulo="Nenhum tratamento registrado"
            descricao="Registre vacinas, consultas e castrações para acompanhar a saúde de cada animal."
            acao={
              <Button onClick={openCreate} variant="outline" size="sm" className="gap-2">
                <Plus className="size-4" aria-hidden="true" /> Registrar primeiro
              </Button>
            }
          />
        ) : filtrados.length === 0 ? (
          <SemResultados onLimpar={limparFiltros} />
        ) : (
          <MolduraTabela rotulo="Lista de tratamentos">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Animal</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead className="hidden xl:table-cell">Descrição</TableHead>
                  <TableHead className="hidden xl:table-cell">Veterinário</TableHead>
                  <TableHead className="hidden lg:table-cell">Custo</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Próx. data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{formatDate(t.date)}</TableCell>
                    <TableCell className="max-w-48 whitespace-normal">
                      <p className="font-semibold text-(--ant-tinta)">{t.animal?.name ?? '—'}</p>
                      <p className="text-xs text-(--ant-tinta-suave) md:hidden">{label(t.type)}</p>
                      <p className="line-clamp-1 text-xs text-(--ant-tinta-suave) xl:hidden">{t.description}</p>
                      <Badge
                        variant={t.status === 'realizado' ? 'default' : t.status === 'agendado' ? 'secondary' : 'outline'}
                        className="mt-1 sm:hidden"
                      >
                        {label(t.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{label(t.type)}</TableCell>
                    <TableCell className="hidden max-w-56 whitespace-normal xl:table-cell">{t.description || '—'}</TableCell>
                    <TableCell className="hidden xl:table-cell">{t.veterinarian || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell">{t.cost ? formatMoney(t.cost) : '—'}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={t.status === 'realizado' ? 'default' : t.status === 'agendado' ? 'secondary' : 'outline'}
                      >
                        {label(t.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDate(t.nextDate)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(t)}
                        aria-label={`Editar tratamento de ${t.animal?.name ?? ''}`}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(t)}
                        aria-label={`Remover tratamento de ${t.animal?.name ?? ''}`}
                      >
                        <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </MolduraTabela>
        )}
      </div>

      <TreatmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        dogs={dogs}
        treatment={editingTreatment}
        onSaved={loadTreatments}
      />
    </AdminShell>
  )
}
