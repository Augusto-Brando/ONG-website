// Tratamentos veterinários: edição e remoção (mantém o lançamento vinculado coerente).
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { dogs, treatments, transactions } from '@/lib/schema'
import { audit, parseBody, parseId, requireArea } from '@/lib/api'
import { treatmentInput } from '@/lib/validators'
import { label } from '@/lib/format'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireArea('tratamentos')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id
  const data = await parseBody(req, treatmentInput)
  if (data instanceof Response) return data

  const [existing] = await getDb().select().from(treatments).where(eq(treatments.id, id))
  if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const [animal] = await getDb().select().from(dogs).where(eq(dogs.id, data.animalId))
  if (!animal) return NextResponse.json({ error: 'Animal não encontrado' }, { status: 404 })

  const cost = data.cost != null ? String(data.cost) : null
  const [updated] = await getDb()
    .update(treatments)
    .set({
      animalId: data.animalId,
      type: data.type,
      description: data.description,
      veterinarian: data.veterinarian || null,
      date: data.date,
      nextDate: data.nextDate || null,
      cost,
      status: data.status,
      notes: data.notes || null,
    })
    .where(eq(treatments.id, id))
    .returning()

  // Mantém o lançamento financeiro coerente: atualiza, cria ou remove.
  const wantsTxn = updated.status === 'realizado' && updated.cost !== null && Number(updated.cost) > 0
  const [txn] = await getDb().select().from(transactions).where(eq(transactions.treatmentId, id))
  if (wantsTxn && updated.cost !== null) {
    const values = {
      description: `${label(updated.type)} - ${animal.name}`,
      amount: updated.cost,
      date: updated.date,
    }
    if (txn) {
      await getDb().update(transactions).set(values).where(eq(transactions.id, txn.id))
    } else {
      await getDb().insert(transactions).values({
        kind: 'despesa',
        category: 'veterinario',
        treatmentId: id,
        ...values,
      })
    }
  } else if (!wantsTxn && txn) {
    await getDb().delete(transactions).where(eq(transactions.id, txn.id))
  }

  await audit(auth, 'update', 'treatments', id, { linkedTransaction: wantsTxn })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireArea('tratamentos')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id

  // Remove antes o lançamento financeiro vinculado.
  await getDb().delete(transactions).where(eq(transactions.treatmentId, id))
  const [deleted] = await getDb().delete(treatments).where(eq(treatments.id, id)).returning()
  if (!deleted) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  await audit(auth, 'delete', 'treatments', id)
  return NextResponse.json({ success: true })
}