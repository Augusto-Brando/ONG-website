'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { HandHeart, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { CarregandoLista, ErroLista, MolduraTabela, SemResultados, VazioLista } from '@/components/admin/lista/estados'
import { BarraFiltros, CampoBusca, FiltroSelect, type Opcao } from '@/components/admin/lista/filtros'
import { VolunteerDialog } from '@/components/admin/voluntarios/volunteer-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { correspondeBusca, correspondeFiltro, descricaoContagem, TODOS } from '@/lib/busca'
import type { Volunteer } from '@/lib/schema'

const SITUACOES: Opcao[] = [
  { value: 'ativo', label: 'Ativos' },
  { value: 'inativo', label: 'Inativos' },
]

export default function VoluntariosPage() {
  const [rows, setRows] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Volunteer | null>(null)
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState(TODOS)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/volunteers')
      if (res.ok) {
        setRows(await res.json())
        setErro(null)
      } else setErro('Não foi possível carregar os voluntários.')
    } catch {
      setErro('Falha de conexão ao carregar os voluntários.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtrando = busca.trim() !== '' || situacao !== TODOS

  const filtrados = useMemo(
    () =>
      rows.filter(
        (v) =>
          correspondeFiltro(situacao, v.active ? 'ativo' : 'inativo') &&
          correspondeBusca(busca, v.name, v.skills, v.availability),
      ),
    [rows, busca, situacao],
  )

  function limparFiltros() {
    setBusca('')
    setSituacao(TODOS)
  }

  function openCreate() {
    setEditing(null)
    setOpen(true)
  }

  function openEdit(v: Volunteer) {
    setEditing(v)
    setOpen(true)
  }

  async function handleDelete(v: Volunteer) {
    if (!confirm(`Remover ${v.name}?`)) return
    const res = await fetch(`/api/volunteers/${v.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Voluntário removido.')
      setRows((prev) => prev.filter((r) => r.id !== v.id))
    } else toast.error('Erro ao remover.')
  }

  return (
    <AdminShell
      title="Voluntários"
      description={descricaoContagem(filtrados.length, rows.length, 'voluntário', 'voluntários', filtrando)}
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="size-4" aria-hidden="true" /> Adicionar
        </Button>
      }
    >
      {loading ? (
        <CarregandoLista rotulo="Carregando voluntários" />
      ) : erro && rows.length === 0 ? (
        <ErroLista mensagem={erro} onTentar={load} />
      ) : rows.length === 0 ? (
        <VazioLista
          icone={HandHeart}
          titulo="Nenhum voluntário cadastrado"
          descricao="Cadastre quem ajuda a ONG para a equipe ter os contatos à mão."
          acao={
            <Button onClick={openCreate} variant="outline" size="sm" className="gap-2">
              <Plus className="size-4" aria-hidden="true" /> Cadastrar primeiro
            </Button>
          }
        />
      ) : (
        <>
          <BarraFiltros rotulo="Filtros de voluntários" ativos={filtrando} onLimpar={limparFiltros}>
            <CampoBusca
              id="busca-voluntarios"
              rotulo="Buscar por nome, habilidade ou disponibilidade"
              valor={busca}
              onMudar={setBusca}
              placeholder="Ex.: Ana ou passeios"
            />
            <FiltroSelect id="filtro-situacao-vol" rotulo="Situação" valor={situacao} onMudar={setSituacao} opcoes={SITUACOES} />
          </BarraFiltros>

          {filtrados.length === 0 ? (
            <SemResultados onLimpar={limparFiltros} />
          ) : (
            <MolduraTabela rotulo="Lista de voluntários">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Contato</TableHead>
                    <TableHead className="hidden lg:table-cell">Disponibilidade</TableHead>
                    <TableHead className="hidden lg:table-cell">Habilidades</TableHead>
                    <TableHead className="hidden sm:table-cell">Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="max-w-56 whitespace-normal">
                        <p className="font-semibold text-(--ant-tinta)">{v.name}</p>
                        <p className="text-xs text-(--ant-tinta-suave) md:hidden">
                          {[v.phone, v.email].filter(Boolean).join(' · ') || 'Sem contato'}
                        </p>
                        <Badge variant={v.active ? 'default' : 'secondary'} className="mt-1 sm:hidden">
                          {v.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {[v.phone, v.email].filter(Boolean).join(' · ') || '—'}
                      </TableCell>
                      <TableCell className="hidden max-w-48 whitespace-normal lg:table-cell">{v.availability || '—'}</TableCell>
                      <TableCell className="hidden max-w-48 whitespace-normal lg:table-cell">{v.skills || '—'}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={v.active ? 'default' : 'secondary'}>{v.active ? 'Ativo' : 'Inativo'}</Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(v)} aria-label={`Editar ${v.name}`}>
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v)} aria-label={`Remover ${v.name}`}>
                          <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </MolduraTabela>
          )}
        </>
      )}

      <VolunteerDialog open={open} onOpenChange={setOpen} volunteer={editing} onSaved={load} />
    </AdminShell>
  )
}
