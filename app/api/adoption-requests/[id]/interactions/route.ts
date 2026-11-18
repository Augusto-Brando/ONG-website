// Registro de interação (nota, ligação, whatsapp...) em uma solicitação.
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { adoptionRequests, interactions } from '@/lib/schema'
import { audit, parseBody, parseId, requireArea } from '@/lib/api'
import { interactionInput } from '@/lib/validators'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Ctx) {
  const auth = await requireArea('adocoes')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id
  const data = await parseBody(req, interactionInput)
  if (data instanceof Response) return data

  const db = getDb()
  const [request] = await db
    .select({ id: adoptionRequests.id })
    .from(adoptionRequests)
    .where(eq(adoptionRequests.id, id))
    .limit(1)
  if (!request) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const [created] = await db
    .insert(interactions)
    .values({ requestId: id, userId: auth.uid || null, type: data.type, content: data.content })
    .returning()

  await audit(auth, 'create', 'interactions', created.id, { requestId: id, type: created.type })
  return NextResponse.json(created, { status: 201 })
}
