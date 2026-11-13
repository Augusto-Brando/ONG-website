import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { adopters } from '@/lib/schema'
import { audit, parseBody, parseId, requireArea } from '@/lib/api'
import { adopterInput } from '@/lib/validators'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireArea('adocoes')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id
  const data = await parseBody(req, adopterInput)
  if (data instanceof Response) return data

  const db = getDb()
  const [current] = await db.select().from(adopters).where(eq(adopters.id, id)).limit(1)
  if (!current) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const consentAt = data.consentLgpd ? (current.consentAt ?? new Date()) : null

  const [updated] = await db
    .update(adopters)
    .set({
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      city: data.city || null,
      housingType: data.housingType || null,
      hasOtherPets: data.hasOtherPets ?? null,
      notes: data.notes || null,
      consentLgpd: data.consentLgpd,
      consentAt,
    })
    .where(eq(adopters.id, id))
    .returning()

  await audit(auth, 'update', 'adopters', id)
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireArea('adocoes')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id

  const [deleted] = await getDb().delete(adopters).where(eq(adopters.id, id)).returning()
  if (!deleted) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  await audit(auth, 'delete', 'adopters', id)
  return NextResponse.json({ success: true })
}
