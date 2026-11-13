// Detalhe de uma solicitação de adoção: dados completos do interessado, animal e histórico.
import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { adopters, adoptionRequests, dogs, interactions } from '@/lib/schema'
import { audit, parseId, requireArea } from '@/lib/api'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireArea('adocoes')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id

  const db = getDb()
  const [request] = await db.select().from(adoptionRequests).where(eq(adoptionRequests.id, id)).limit(1)
  if (!request) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const [adopter] = await db.select().from(adopters).where(eq(adopters.id, request.adopterId)).limit(1)
  const animal = request.animalId
    ? ((
        await db
          .select({ id: dogs.id, name: dogs.name, imageUrl: dogs.imageUrl, status: dogs.status })
          .from(dogs)
          .where(eq(dogs.id, request.animalId))
          .limit(1)
      )[0] ?? null)
    : null

  const history = await db
    .select()
    .from(interactions)
    .where(eq(interactions.requestId, id))
    .orderBy(desc(interactions.createdAt), desc(interactions.id))

  return NextResponse.json({
    ...request,
    adopter: adopter ?? null,
    animal,
    interactions: history,
  })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireArea('adocoes')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id

  const [deleted] = await getDb().delete(adoptionRequests).where(eq(adoptionRequests.id, id)).returning()
  if (!deleted) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  await audit(auth, 'delete', 'adoption_requests', id)
  return NextResponse.json({ success: true })
}
