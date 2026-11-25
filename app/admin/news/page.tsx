'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Newspaper, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { CarregandoLista, ErroLista, MolduraTabela, SemResultados, VazioLista } from '@/components/admin/lista/estados'
import { BarraFiltros, CampoBusca, FiltroSelect, type Opcao } from '@/components/admin/lista/filtros'
import { NewsDialog } from '@/components/admin/noticias/news-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { correspondeBusca, correspondeFiltro, descricaoContagem, TODOS } from '@/lib/busca'
import { formatDate } from '@/lib/format'
import type { News } from '@/lib/schema'

const SITUACOES: Opcao[] = [
  { value: 'ativa', label: 'Ativas' },
  { value: 'inativa', label: 'Inativas' },
]

export default function AdminNewsPage() {
  const [items, setItems] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<News | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState(TODOS)

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch('/api/news')
      if (res.ok) {
        setItems(await res.json())
        setErro(null)
      } else setErro('Não foi possível carregar as notícias.')
    } catch {
      setErro('Falha de conexão ao carregar as notícias.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const filtrando = busca.trim() !== '' || situacao !== TODOS

  const filtrados = useMemo(
    () =>
      items.filter(
        (n) =>
          correspondeFiltro(situacao, n.published ? 'ativa' : 'inativa') &&
          correspondeBusca(busca, n.title, n.summary),
      ),
    [items, busca, situacao],
  )

  function limparFiltros() {
    setBusca('')
    setSituacao(TODOS)
  }

  function openCreate() {
    setEditing(null)
    setOpen(true)
  }

  function openEdit(item: News) {
    setEditing(item)
    setOpen(true)
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/news/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Notícia removida.')
      setItems((prev) => prev.filter((n) => n.id !== id))
    } else {
      toast.error('Erro ao remover.')
    }
    setDeleteId(null)
  }

  return (
    <AdminShell
      title="Notícias"
      description={descricaoContagem(filtrados.length, items.length, 'notícia no cadastro', 'notícias no cadastro', filtrando)}
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="size-4" aria-hidden="true" /> Nova notícia
        </Button>
      }
    >
      {loading ? (
        <CarregandoLista rotulo="Carregando notícias" />
      ) : erro && items.length === 0 ? (
        <ErroLista mensagem={erro} onTentar={fetchNews} />
      ) : items.length === 0 ? (
        <VazioLista
          icone={Newspaper}
          titulo="Nenhuma notícia cadastrada ainda"
          descricao="As notícias ativas aparecem na home do site."
          acao={
            <Button onClick={openCreate} variant="outline" size="sm" className="gap-2">
              <Plus className="size-4" aria-hidden="true" /> Cadastrar primeira
            </Button>
          }
        />
      ) : (
        <>
          <BarraFiltros rotulo="Filtros de notícias" ativos={filtrando} onLimpar={limparFiltros}>
            <CampoBusca
              id="busca-noticias"
              rotulo="Buscar no título ou resumo"
              valor={busca}
              onMudar={setBusca}
              placeholder="Ex.: feira de adoção"
            />
            <FiltroSelect id="filtro-situacao-noticia" rotulo="Situação" valor={situacao} onMudar={setSituacao} opcoes={SITUACOES} rotuloTodos="Todas" />
          </BarraFiltros>

          {filtrados.length === 0 ? (
            <SemResultados onLimpar={limparFiltros} />
          ) : (
            <MolduraTabela rotulo="Lista de notícias">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-20 sm:table-cell">
                      <span className="sr-only">Capa</span>
                    </TableHead>
                    <TableHead>Notícia</TableHead>
                    <TableHead className="hidden md:table-cell">Data</TableHead>
                    <TableHead className="hidden sm:table-cell">Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="hidden sm:table-cell">
                        {item.coverImageUrl ? (
                          <img src={item.coverImageUrl} alt="" className="aspect-video w-16 rounded-md object-cover" />
                        ) : (
                          <span className="flex aspect-video w-16 items-center justify-center rounded-md bg-(--ant-foto-2)">
                            <Newspaper className="size-4 text-(--ant-cacau)" aria-hidden="true" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-80 whitespace-normal">
                        <p className="line-clamp-2 font-semibold text-(--ant-tinta)">{item.title}</p>
                        <p className="line-clamp-1 text-xs text-(--ant-tinta-suave)">{item.summary}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-(--ant-tinta-suave) md:hidden">
                          {formatDate(item.publishedAt)}
                          <Badge variant={item.published ? 'default' : 'secondary'} className="sm:hidden">
                            {item.published ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(item.publishedAt)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={item.published ? 'default' : 'secondary'}>{item.published ? 'Ativa' : 'Inativa'}</Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {deleteId === item.id ? (
                          <>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleDelete(item.id)}
                              aria-label={`Confirmar exclusão da notícia ${item.title}`}
                            >
                              <Check className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="ml-1"
                              onClick={() => setDeleteId(null)}
                              aria-label={`Cancelar exclusão da notícia ${item.title}`}
                            >
                              <X className="size-4" aria-hidden="true" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label={`Editar notícia ${item.title}`}>
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(item.id)}
                              aria-label={`Excluir notícia ${item.title}`}
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

      <NewsDialog open={open} onOpenChange={setOpen} news={editing} onSaved={fetchNews} />
    </AdminShell>
  )
}
