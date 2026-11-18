'use client'

// Tela do módulo de estoque: itens, alerta de estoque baixo, movimentações.
import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { ItemDialog } from '@/components/admin/estoque/item-dialog'
import { MovementDialog } from '@/components/admin/estoque/movement-dialog'
import { MovementsList } from '@/components/admin/estoque/movements-list'
import type { InventoryItem, Movement } from '@/components/admin/estoque/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { label } from '@/lib/format'

export default function EstoquePage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [movItem, setMovItem] = useState<InventoryItem | null>(null)

  const load = useCallback(async () => {
    const [itemsRes, movRes] = await Promise.all([fetch('/api/inventory'), fetch('/api/inventory/movements')])
    if (itemsRes.ok) setItems(await itemsRes.json())
    else toast.error('Erro ao carregar o estoque.')
    if (movRes.ok) setMovements(await movRes.json())
    setLoading(false)
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

  return (
    <AdminShell
      title="Estoque"
      description={`${items.length} item(ns) cadastrado(s)`}
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Novo item
        </Button>
      }
    >
      {loading ? (
        <p className="py-20 text-center text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-8">
          {lowItems.length > 0 && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm"
            >
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
              <span>
                <strong>
                  {lowItems.length} {lowItems.length === 1 ? 'item abaixo' : 'itens abaixo'} do mínimo
                </strong>{' '}
                — {lowItems.map((i) => i.name).join(', ')}
              </span>
            </div>
          )}

          {items.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">Nenhum item cadastrado no estoque.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{label(item.category)}</TableCell>
                      <TableCell>
                        {Number(item.quantity).toLocaleString('pt-BR')} {item.unit}
                      </TableCell>
                      <TableCell>
                        {Number(item.minQuantity).toLocaleString('pt-BR')} {item.unit}
                      </TableCell>
                      <TableCell>
                        {item.low ? (
                          <Badge variant="destructive">Estoque baixo</Badge>
                        ) : (
                          <Badge variant="secondary">OK</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-1" onClick={() => setMovItem(item)}>
                          Movimentar
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label={`Editar ${item.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} aria-label={`Remover ${item.name}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <section aria-labelledby="movs-title">
            <h2 id="movs-title" className="mb-3 text-lg font-semibold text-foreground">
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