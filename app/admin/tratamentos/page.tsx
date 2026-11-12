'use client'

// Tela do módulo de tratamentos veterinários.
import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { TreatmentDialog } from '@/components/admin/tratamentos/treatment-dialog'
import { UpcomingList } from '@/components/admin/tratamentos/upcoming-list'
import type { DogRow, TreatmentRow } from '@/components/admin/tratamentos/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatMoney, label, todayIso } from '@/lib/format'

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
  const [filterAnimal, setFilterAnimal] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const loadDogs = useCallback(async () => {
    const res = await fetch('/api/dogs')
    if (res.ok) {
      const data: DogRow[] = await res.json()
      setDogs(data.map((d) => ({ id: d.id, name: d.name, species: d.species })))
    }
  }, [])

  const loadTreatments = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterAnimal) params.set('animalId', filterAnimal)
    if (filterStatus) params.set('status', filterStatus)
    const qs = params.toString()
    const res = await fetch(`/api/treatments${qs ? `?${qs}` : ''}`)
    if (res.ok) setTreatments(await res.json())
    else toast.error('Erro ao carregar tratamentos.')
    setLoading(false)
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

  return (
    <AdminShell
      title="Tratamentos"
      description={`${treatments.length} tratamento(s)`}
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Novo tratamento
        </Button>
      }
    >
      {loading ? (
        <p className="py-20 text-center text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-8">
          <UpcomingList treatments={treatments} today={today} limitIso={limitIso} />

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="filter-animal">Animal</Label>
              <Select value={filterAnimal} onValueChange={setFilterAnimal}>
                <SelectTrigger id="filter-animal" className="w-48">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {dogs.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="filter-status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="filter-status" className="w-40">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="realizado">Realizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {treatments.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">Nenhum tratamento encontrado.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Veterinário</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Próx. Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treatments.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{formatDate(t.date)}</TableCell>
                      <TableCell className="font-medium">{t.animal?.name ?? '—'}</TableCell>
                      <TableCell>{label(t.type)}</TableCell>
                      <TableCell>{t.description || '—'}</TableCell>
                      <TableCell>{t.veterinarian || '—'}</TableCell>
                      <TableCell>{t.cost ? formatMoney(t.cost) : '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.status === 'realizado' ? 'default' : t.status === 'agendado' ? 'secondary' : 'outline'
                          }
                        >
                          {label(t.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(t.nextDate)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(t)}
                          aria-label={`Editar tratamento de ${t.animal?.name ?? ''}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(t)}
                          aria-label={`Remover tratamento de ${t.animal?.name ?? ''}`}
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
        </div>
      )}

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