// Edição e exclusão de lançamentos. Lançamentos gerados por uma doação
// (donationId preenchido) não podem ser alterados por aqui.
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { transactions } from '@/lib/schema'
import { audit, parseBody, parseId, requireArea } from '@/lib/api'
import { transactionInput } from '@/lib/validators'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireArea('financeiro')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id
  const data = await parseBody(req, transactionInput)
  if (data instanceof Response) return data

  const db = getDb()
  const [existing] = await db.select().from(transactions).where(eq(transactions.id, id))
  if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  if (existing.donationId) {
    return NextResponse.json({ error: 'Altere pela doação' }, { status: 409 })
  }

  const [updated] = await db
    .update(transactions)
    .set({
      kind: data.kind,
      category: data.category,
      description: data.description ?? '',
      amount: data.amount.toFixed(2),
      date: data.date,
    })
    .where(eq(transactions.id, id))
    .returning()
  if (!updated) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  await audit(auth, 'update', 'transactions', id)
  return NextResponse.json({ ...updated, amount: Number(updated.amount) })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireArea('financeiro')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id

  const db = getDb()
  const [existing] = await db.select().from(transactions).where(eq(transactions.id, id))
  if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  if (existing.donationId) {
    return NextResponse.json({ error: 'Altere pela doação' }, { status: 409 })
  }

  await db.delete(transactions).where(eq(transactions.id, id))

  await audit(auth, 'delete', 'transactions', id)
  return NextResponse.json({ success: true })
}
