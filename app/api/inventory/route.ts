// Estoque: itens (listagem e criação). Padrão do módulo de referência volunteers.
import { NextResponse } from 'next/server'
import { asc } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { inventoryItems } from '@/lib/schema'
import { audit, parseBody, requireArea } from '@/lib/api'
import { inventoryItemInput } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireArea('estoque')
  if (auth instanceof Response) return auth
  const rows = await getDb().select().from(inventoryItems).orderBy(asc(inventoryItems.name))
  const out = rows.map((r) => ({ ...r, low: Number(r.quantity) < Number(r.minQuantity) }))
  return NextResponse.json(out)
}

export async function POST(req: Request) {
  const auth = await requireArea('estoque')
  if (auth instanceof Response) return auth
  const data = await parseBody(req, inventoryItemInput)
  if (data instanceof Response) return data

  // Quantidade inicial 0; o saldo só muda via /api/inventory/movements.
  const [created] = await getDb()
    .insert(inventoryItems)
    .values({
      name: data.name,
      category: data.category,
      unit: data.unit,
      quantity: '0',
      minQuantity: String(data.minQuantity),
      notes: data.notes || null,
    })
    .returning()
  await audit(auth, 'create', 'inventoryItems', created.id, { itemId: created.id })
  return NextResponse.json(created, { status: 201 })
}