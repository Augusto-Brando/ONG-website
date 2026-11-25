'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeftRight, Package, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { ItemDialog } from '@/components/admin/estoque/item-dialog'
import { MovementDialog } from '@/components/admin/estoque/movement-dialog'
import { MovementsList } from '@/components/admin/estoque/movements-list'
import type { InventoryItem, Movement } from '@/components/admin/estoque/types'
import { CarregandoLista, ErroLista, MolduraTabela, SemResultados, VazioLista } from '@/components/admin/lista/estados'
import { BarraFiltros, CampoBusca, FiltroSelect, type Opcao } from '@/components/admin/lista/filtros'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { correspondeBusca, correspondeFiltro, descricaoContagem, TODOS } from '@/lib/busca'
import { label } from '@/lib/format'

const CATEGORIAS: Opcao[] = ['racao', 'medicamento', 'higiene', 'limpeza', 'acessorio', 'outro'].map((v) => ({
  value: v,
  label: label(v),
}))
const SITUACOES: Opcao[] = [
  { value: 'baixo', label: 'Estoque baixo' },
  { value: 'ok', label: 'OK' },
]

export default function EstoquePage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [movItem, setMovItem] = useState<InventoryItem | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState(TODOS)
  const [situacao, setSituacao] = useState(TODOS)

  const load = useCallback(async () => {
    try {
      const [itemsRes, movRes] = await Promise.all([fetch('/api/inventory'), fetch('/api/inventory/movements')])
      if (itemsRes.ok) {
        setItems(await itemsRes.json())
        setErro(null)
      } else setErro('Não foi possível carregar o estoque.')
      if (movRes.ok) setMovements(await movRes.json())
      else toast.error('Erro ao carregar as movimentações.')
    } catch {
      setErro('Falha de conexão ao carregar o estoque.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditingItem(null)
    setItemDialogOpen(true)
  }

  function openEdit(item: InventoryItem) {
    setEditingItem(item)
    setItemDialogOpen(true)
  }

  async function handleDelete(item: InventoryItem) {
    if (!confirm(`Remover ${item.name}? As movimentações do item também serão excluídas.`)) return
    const res = await fetch(`/api/inventory/${item.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Item removido.')
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } else toast.error('Erro ao remover o item.')
  }

  const lowItems = items.filter((i) => i.low)
  const filtrando = busca.trim() !== '' || categoria !== TODOS || situacao !== TODOS

  const filtrados = useMemo(
    () =>
      items.filter(
        (i) =>
          correspondeFiltro(categoria, i.category) &&
          correspondeFiltro(situacao, i.low ? 'baixo' : 'ok') &&
          correspondeBusca(busca, i.name, i.notes),
      ),
    [items, busca, categoria, situacao],
  )

  function limparFiltros() {
    setBusca('')
    setCategoria(TODOS)
    setSituacao(TODOS)
  }

  return (
    <AdminShell
      title="Estoque"
      description={descricaoContagem(filtrados.length, items.length, 'item cadastrado', 'itens cadastrados', filtrando)}
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="size-4" aria-hidden="true" /> Novo item
        </Button>
      }
    >
      {loading ? (
        <CarregandoLista rotulo="Carregando o estoque" />
      ) : erro && items.length === 0 ? (
        <ErroLista mensagem={erro} onTentar={load} />
      ) : (
        <div className="space-y-6">
          {lowItems.length > 0 && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-(--ant-sol) bg-(--ant-sol-suave) px-4 py-3 text-sm text-(--ant-tinta)"
            >
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-(--ant-laranja-texto)" aria-hidden="true" />
              <span className="min-w-0">
                <strong>
                  {lowItems.length} {lowItems.length === 1 ? 'item abaixo' : 'itens abaixo'} do mínimo
                </strong>{' '}
                — {lowItems.map((i) => i.name).join(', ')}
                {situacao !== 'baixo' && (
                  <>
                    {' '}
                    <button
                      type="button"
                      className="font-semibold text-(--ant-azul) underline underline-offset-2"
                      onClick={() => setSituacao('baixo')}
                    >
                      Ver só esses
                    </button>
                  </>
                )}
              </span>
            </div>
          )}

          {items.length === 0 ? (
            <VazioLista
              icone={Package}
              titulo="Nenhum item cadastrado no estoque"
              descricao="Cadastre ração, remédios e materiais com a quantidade mínima para receber o alerta de estoque baixo."
              acao={
                <Button onClick={openCreate} variant="outline" size="sm" className="gap-2">
                  <Plus className="size-4" aria-hidden="true" /> Cadastrar primeiro
                </Button>
              }
            />
          ) : (
            <>
              <BarraFiltros rotulo="Filtros do estoque" ativos={filtrando} onLimpar={limparFiltros}>
                <CampoBusca id="busca-estoque" rotulo="Buscar item" valor={busca} onMudar={setBusca} placeholder="Ex.: ração filhote" />
                <FiltroSelect id="filtro-categoria" rotulo="Categoria" valor={categoria} onMudar={setCategoria} opcoes={CATEGORIAS} rotuloTodos="Todas" />
                <FiltroSelect id="filtro-situacao-estoque" rotulo="Situação" valor={situacao} onMudar={setSituacao} opcoes={SITUACOES} rotuloTodos="Todas" />
              </BarraFiltros>

              {filtrados.length === 0 ? (
                <SemResultados onLimpar={limparFiltros} />
              ) : (
                <MolduraTabela rotulo="Itens do estoque">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="hidden md:table-cell">Categoria</TableHead>
                        <TableHead className="hidden sm:table-cell">Saldo</TableHead>
                        <TableHead className="hidden lg:table-cell">Mínimo</TableHead>
                        <TableHead className="hidden sm:table-cell">Situação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtrados.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="max-w-56 whitespace-normal">
                            <p className="font-semibold text-(--ant-tinta)">{item.name}</p>
                            <p className="text-xs text-(--ant-tinta-suave) sm:hidden">
                              {Number(item.quantity).toLocaleString('pt-BR')} {item.unit} · mín.{' '}
                              {Number(item.minQuantity).toLocaleString('pt-BR')}
                            </p>
                            <p className="text-xs text-(--ant-tinta-suave) max-sm:hidden md:hidden">{label(item.category)}</p>
                            {item.low && (
                              <Badge variant="destructive" className="mt-1 sm:hidden">
                                Estoque baixo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{label(item.category)}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {Number(item.quantity).toLocaleString('pt-BR')} {item.unit}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {Number(item.minQuantity).toLocaleString('pt-BR')} {item.unit}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {item.low ? <Badge variant="destructive">Estoque baixo</Badge> : <Badge variant="secondary">OK</Badge>}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-1 gap-1.5"
                              onClick={() => setMovItem(item)}
                              aria-label={`Movimentar ${item.name}`}
                            >
                              <ArrowLeftRight className="size-4" aria-hidden="true" />
                              <span className="max-sm:sr-only">Movimentar</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label={`Editar ${item.name}`}>
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} aria-label={`Remover ${item.name}`}>
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

          <section aria-labelledby="movs-title">
            <h2 id="movs-title" className="mb-3 text-lg font-semibold text-(--ant-tinta)">
              Últimas movimentações
            </h2>
            <MovementsList movements={movements} />
          </section>
        </div>
      )}

      <ItemDialog open={itemDialogOpen} onOpenChange={setItemDialogOpen} item={editingItem} onSaved={load} />
      <MovementDialog
        open={movItem !== null}
        onOpenChange={(o) => {
          if (!o) setMovItem(null)
        }}
        item={movItem}
        onSaved={load}
      />
    </AdminShell>
  )
}
