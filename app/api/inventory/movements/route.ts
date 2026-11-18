// Estoque: movimentações (listagem e gravação de entrada/saída).
import { NextResponse } from 'next/server'
import { desc, eq, inArray, sql, type SQL } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { inventoryItems, inventoryMovements } from '@/lib/schema'
import { audit, parseBody, requireArea } from '@/lib/api'
import { inventoryMovementInput } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const auth = await requireArea('estoque')
  if (auth instanceof Response) return auth

  const rawId = new URL(req.url).searchParams.get('itemId')
  let cond: SQL | undefined
  if (rawId) {
    const n = Number(rawId)
    if (Number.isInteger(n) && n > 0) cond = eq(inventoryMovements.itemId, n)
  }

  const rows = cond
    ? await getDb().select().from(inventoryMovements).where(cond).orderBy(desc(inventoryMovements.id)).limit(100)
    : await getDb().select().from(inventoryMovements).orderBy(desc(inventoryMovements.id)).limit(100)

  const ids = [...new Set(rows.map((r) => r.itemId))]
  const items = ids.length
    ? await getDb().select().from(inventoryItems).where(inArray(inventoryItems.id, ids))
    : []
  const byId = new Map(items.map((i) => [i.id, i]))
  const out = rows.map((m) => {
    const item = byId.get(m.itemId)
    return {
      ...m,
      item: item ? { id: item.id, name: item.name, unit: item.unit } : null,
    }
  })
  return NextResponse.json(out)
}

export async function POST(req: Request) {
  const auth = await requireArea('estoque')
  if (auth instanceof Response) return auth
  const data = await parseBody(req, inventoryMovementInput)
  if (data instanceof Response) return data

  const [item] = await getDb().select().from(inventoryItems).where(eq(inventoryItems.id, data.itemId))
  if (!item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })

  const qty = data.quantity
  // Saída maior que o saldo: recusa sem gravar nada.
  if (data.type === 'saida' && qty > Number(item.quantity)) {
    return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 409 })
  }

  const [movement] = await getDb()
    .insert(inventoryMovements)
    .values({
      itemId: data.itemId,
      type: data.type,
      quantity: String(qty),
      reason: data.reason,
      date: data.date,
      donationId: data.donationId ?? null,
      userId: auth.uid || null,
    })
    .returning()

  // Atualiza o saldo com SQL atômico (nunca o valor lido antes).
  const delta = data.type === 'saida' ? -qty : qty
  await getDb()
    .update(inventoryItems)
    .set({ quantity: sql`${inventoryItems.quantity} + ${delta}` })
    .where(eq(inventoryItems.id, data.itemId))

  await audit(auth, data.type, 'inventoryMovements', movement.id, {
    itemId: data.itemId,
    type: data.type,
    quantity: qty,
  })
  return NextResponse.json(movement, { status: 201 })
}