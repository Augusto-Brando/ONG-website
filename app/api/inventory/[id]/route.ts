// Estoque: edição e remoção de item.
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { inventoryItems } from '@/lib/schema'
import { audit, parseBody, parseId, requireArea } from '@/lib/api'
import { inventoryItemInput } from '@/lib/validators'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireArea('estoque')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id
  const data = await parseBody(req, inventoryItemInput)
  if (data instanceof Response) return data

  // `quantity` NÃO é alterada aqui: o saldo só muda por movimentações.
  const [updated] = await getDb()
    .update(inventoryItems)
    .set({
      name: data.name,
      category: data.category,
      unit: data.unit,
      minQuantity: String(data.minQuantity),
      notes: data.notes || null,
    })
    .where(eq(inventoryItems.id, id))
    .returning()
  if (!updated) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  await audit(auth, 'update', 'inventoryItems', id)
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireArea('estoque')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id

  const [deleted] = await getDb().delete(inventoryItems).where(eq(inventoryItems.id, id)).returning()
  if (!deleted) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  await audit(auth, 'delete', 'inventoryItems', id)
  return NextResponse.json({ success: true })
}