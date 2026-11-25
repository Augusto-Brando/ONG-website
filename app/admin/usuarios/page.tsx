'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell, useMe } from '@/components/admin/admin-shell'
import { CarregandoLista, ErroLista, MolduraTabela, SemResultados, VazioLista } from '@/components/admin/lista/estados'
import { BarraFiltros, CampoBusca, FiltroSelect, type Opcao } from '@/components/admin/lista/filtros'
import { UserDialog } from '@/components/admin/usuarios/user-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { correspondeBusca, correspondeFiltro, descricaoContagem, TODOS } from '@/lib/busca'
import { formatDate, label } from '@/lib/format'
import type { PublicUser } from '@/lib/users'

const PERFIS: Opcao[] = ['admin', 'voluntario', 'financeiro'].map((v) => ({ value: v, label: label(v) }))
const SITUACOES: Opcao[] = [
  { value: 'ativo', label: 'Ativos' },
  { value: 'inativo', label: 'Inativos' },
]

export default function UsuariosPage() {
  const me = useMe()
  const [rows, setRows] = useState<PublicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PublicUser | null>(null)
  const [busca, setBusca] = useState('')
  const [perfil, setPerfil] = useState(TODOS)
  const [situacao, setSituacao] = useState(TODOS)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        setRows(await res.json())
        setErro(null)
      } else setErro('Não foi possível carregar os usuários.')
    } catch {
      setErro('Falha de conexão ao carregar os usuários.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtrando = busca.trim() !== '' || perfil !== TODOS || situacao !== TODOS

  const filtrados = useMemo(
    () =>
      rows.filter(
        (u) =>
          correspondeFiltro(perfil, u.role) &&
          correspondeFiltro(situacao, u.active ? 'ativo' : 'inativo') &&
          correspondeBusca(busca, u.name, u.email),
      ),
    [rows, busca, perfil, situacao],
  )

  function limparFiltros() {
    setBusca('')
    setPerfil(TODOS)
    setSituacao(TODOS)
  }

  function openCreate() {
    setEditing(null)
    setOpen(true)
  }

  function openEdit(u: PublicUser) {
    setEditing(u)
    setOpen(true)
  }

  async function handleDelete(u: PublicUser) {
    if (!confirm(`Excluir o usuário ${u.name}?`)) return
    const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      toast.success('Usuário excluído.')
      setRows((prev) => prev.filter((r) => r.id !== u.id))
    } else toast.error(data.error || 'Erro ao excluir.')
  }

  return (
    <AdminShell
      title="Usuários"
      description={
        filtrando
          ? descricaoContagem(filtrados.length, rows.length, 'usuário', 'usuários', true)
          : 'Quem pode entrar no painel e o que cada perfil enxerga'
      }
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="size-4" aria-hidden="true" /> Novo usuário
        </Button>
      }
    >
      {loading ? (
        <CarregandoLista rotulo="Carregando usuários" />
      ) : erro && rows.length === 0 ? (
        <ErroLista mensagem={erro} onTentar={load} />
      ) : rows.length === 0 ? (
        <VazioLista icone={Users} titulo="Nenhum usuário cadastrado" />
      ) : (
        <>
          <BarraFiltros rotulo="Filtros de usuários" ativos={filtrando} onLimpar={limparFiltros}>
            <CampoBusca
              id="busca-usuarios"
              rotulo="Buscar por nome ou e-mail"
              valor={busca}
              onMudar={setBusca}
              placeholder="Ex.: maria@"
            />
            <FiltroSelect id="filtro-perfil" rotulo="Perfil" valor={perfil} onMudar={setPerfil} opcoes={PERFIS} />
            <FiltroSelect id="filtro-situacao-usuario" rotulo="Situação" valor={situacao} onMudar={setSituacao} opcoes={SITUACOES} />
          </BarraFiltros>

          {filtrados.length === 0 ? (
            <SemResultados onLimpar={limparFiltros} />
          ) : (
            <MolduraTabela rotulo="Lista de usuários">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">E-mail</TableHead>
                    <TableHead className="hidden sm:table-cell">Perfil</TableHead>
                    <TableHead className="hidden sm:table-cell">Situação</TableHead>
                    <TableHead className="hidden lg:table-cell">Último acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="max-w-56 whitespace-normal">
                        <p className="font-semibold text-(--ant-tinta)">
                          {u.name}{' '}
                          {me?.uid === u.id && <span className="text-xs font-normal text-(--ant-tinta-suave)">(você)</span>}
                        </p>
                        <p className="text-xs break-all text-(--ant-tinta-suave) md:hidden">{u.email}</p>
                        <p className="mt-1 flex flex-wrap gap-1 sm:hidden">
                          <Badge variant="outline">{label(u.role)}</Badge>
                          <Badge variant={u.active ? 'default' : 'secondary'}>{u.active ? 'Ativo' : 'Inativo'}</Badge>
                        </p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{u.email}</TableCell>
                      <TableCell className="hidden sm:table-cell">{label(u.role)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={u.active ? 'default' : 'secondary'}>{u.active ? 'Ativo' : 'Inativo'}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Nunca'}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(u)} aria-label={`Editar ${u.name}`}>
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(u)}
                          disabled={me?.uid === u.id}
                          aria-label={`Excluir ${u.name}`}
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
        </>
      )}

      <UserDialog open={open} onOpenChange={setOpen} user={editing} onSaved={load} />
    </AdminShell>
  )
}
