// Solicitações de adoção: lista com dados do interessado e do animal.
import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { adopters, adoptionRequests, dogs } from '@/lib/schema'
import { audit, parseBody, requireArea } from '@/lib/api'
import { adoptionRequestInput } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireArea('adocoes')
  if (auth instanceof Response) return auth

  const rows = await getDb()
    .select({
      id: adoptionRequests.id,
      adopterId: adoptionRequests.adopterId,
      animalId: adoptionRequests.animalId,
      stage: adoptionRequests.stage,
      source: adoptionRequests.source,
      message: adoptionRequests.message,
      assignedTo: adoptionRequests.assignedTo,
      createdAt: adoptionRequests.createdAt,
      updatedAt: adoptionRequests.updatedAt,
      closedAt: adoptionRequests.closedAt,
      adopterName: adopters.name,
      adopterPhone: adopters.phone,
      adopterEmail: adopters.email,
      adopterCity: adopters.city,
      animalName: dogs.name,
      animalImageUrl: dogs.imageUrl,
    })
    .from(adoptionRequests)
    .innerJoin(adopters, eq(adopters.id, adoptionRequests.adopterId))
    .leftJoin(dogs, eq(dogs.id, adoptionRequests.animalId))
    .orderBy(desc(adoptionRequests.updatedAt))

  const items = rows.map((r) => ({
    id: r.id,
    adopterId: r.adopterId,
    animalId: r.animalId,
    stage: r.stage,
    source: r.source,
    message: r.message,
    assignedTo: r.assignedTo,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    closedAt: r.closedAt,
    adopter: {
      id: r.adopterId,
      name: r.adopterName,
      phone: r.adopterPhone,
      email: r.adopterEmail,
      city: r.adopterCity,
    },
    animal:
      r.animalId === null || r.animalName === null
        ? null
        : { id: r.animalId, name: r.animalName, imageUrl: r.animalImageUrl ?? '' },
  }))

  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const auth = await requireArea('adocoes')
  if (auth instanceof Response) return auth
  const data = await parseBody(req, adoptionRequestInput)
  if (data instanceof Response) return data

  const db = getDb()
  const [adopter] = await db
    .select({ id: adopters.id })
    .from(adopters)
    .where(eq(adopters.id, data.adopterId))
    .limit(1)
  if (!adopter) return NextResponse.json({ error: 'Interessado não encontrado' }, { status: 400 })

  if (data.animalId) {
    const [animal] = await db.select({ id: dogs.id }).from(dogs).where(eq(dogs.id, data.animalId)).limit(1)
    if (!animal) return NextResponse.json({ error: 'Animal não encontrado' }, { status: 400 })
  }

  const [created] = await db
    .insert(adoptionRequests)
    .values({
      adopterId: data.adopterId,
      animalId: data.animalId ?? null,
      stage: data.stage,
      source: data.source,
      message: data.message,
      assignedTo: data.assignedTo ?? null,
      updatedAt: new Date(),
    })
    .returning()

  await audit(auth, 'create', 'adoption_requests', created.id, { stage: created.stage, source: created.source })
  return NextResponse.json(created, { status: 201 })
}
