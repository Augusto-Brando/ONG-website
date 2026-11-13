import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { volunteers } from '@/lib/schema'
import { audit, parseBody, parseId, requireArea } from '@/lib/api'
import { volunteerInput } from '@/lib/validators'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireArea('voluntarios')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id
  const data = await parseBody(req, volunteerInput)
  if (data instanceof Response) return data

  const [updated] = await getDb()
    .update(volunteers)
    .set({ ...data, email: data.email || null })
    .where(eq(volunteers.id, id))
    .returning()
  if (!updated) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  await audit(auth, 'update', 'volunteers', id)
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireArea('voluntarios')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id

  const [deleted] = await getDb().delete(volunteers).where(eq(volunteers.id, id)).returning()
  if (!deleted) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  await audit(auth, 'delete', 'volunteers', id)
  return NextResponse.json({ success: true })
}
