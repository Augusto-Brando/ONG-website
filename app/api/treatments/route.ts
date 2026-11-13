// Tratamentos veterinários: listagem e criação (com lançamento financeiro).
import { NextResponse } from 'next/server'
import { and, desc, eq, inArray, type SQL } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { dogs, treatments, transactions, type Treatment } from '@/lib/schema'
import { audit, parseBody, requireArea } from '@/lib/api'
import { treatmentInput } from '@/lib/validators'
import { label } from '@/lib/format'

export const dynamic = 'force-dynamic'

const STATUSES = ['agendado', 'realizado', 'cancelado']

export async function GET(req: Request) {
  const auth = await requireArea('tratamentos')
  if (auth instanceof Response) return auth

  const sp = new URL(req.url).searchParams
  const conds: SQL[] = []
  const rawAnimal = sp.get('animalId')
  if (rawAnimal) {
    const n = Number(rawAnimal)
    if (Number.isInteger(n) && n > 0) conds.push(eq(treatments.animalId, n))
  }
  const rawStatus = sp.get('status')
  if (rawStatus && STATUSES.includes(rawStatus)) conds.push(eq(treatments.status, rawStatus as Treatment["status"]))

  const rows = await getDb()
    .select()
    .from(treatments)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(treatments.date), desc(treatments.id))

  const ids = [...new Set(rows.map((r) => r.animalId))]
  const animals = ids.length ? await getDb().select().from(dogs).where(inArray(dogs.id, ids)) : []
  const byId = new Map(animals.map((a) => [a.id, a]))
  const out = rows.map((t) => {
    const animal = byId.get(t.animalId)
    return {
      ...t,
      animal: animal ? { id: animal.id, name: animal.name, species: animal.species } : null,
    }
  })
  return NextResponse.json(out)
}

/** Gera o lançamento de despesa do tratamento, se aplicável. */
async function upsertTreatmentTransaction(treatmentId: number, type: string, animalName: string, date: string, cost: string | null, status: string) {
  const wantsTxn = status === 'realizado' && cost !== null && Number(cost) > 0
  const [txn] = await getDb().select().from(transactions).where(eq(transactions.treatmentId, treatmentId))
  if (wantsTxn && cost !== null) {
    const values = {
      description: `${label(type)} - ${animalName}`,
      amount: cost,
      date,
    }
    if (txn) {
      await getDb().update(transactions).set(values).where(eq(transactions.id, txn.id))
    } else {
      await getDb().insert(transactions).values({
        kind: 'despesa',
        category: 'veterinario',
        treatmentId,
        ...values,
      })
    }
  } else if (!wantsTxn && txn) {
    await getDb().delete(transactions).where(eq(transactions.id, txn.id))
  }
}

export async function POST(req: Request) {
  const auth = await requireArea('tratamentos')
  if (auth instanceof Response) return auth
  const data = await parseBody(req, treatmentInput)
  if (data instanceof Response) return data

  const [animal] = await getDb().select().from(dogs).where(eq(dogs.id, data.animalId))
  if (!animal) return NextResponse.json({ error: 'Animal não encontrado' }, { status: 404 })

  const cost = data.cost != null ? String(data.cost) : null
  const [created] = await getDb()
    .insert(treatments)
    .values({
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
    .returning()

  // Tratamento realizado com custo > 0 vira despesa veterinária.
  await upsertTreatmentTransaction(created.id, created.type, animal.name, created.date, created.cost, created.status)

  await audit(auth, 'create', 'treatments', created.id, { treatmentId: created.id })
  return NextResponse.json(created, { status: 201 })
}