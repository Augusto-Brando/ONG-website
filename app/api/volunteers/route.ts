// MÓDULO DE REFERÊNCIA: copie este padrão nas rotas novas.
import { NextResponse } from 'next/server'
import { desc } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { volunteers } from '@/lib/schema'
import { audit, parseBody, requireArea } from '@/lib/api'
import { volunteerInput } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireArea('voluntarios')
  if (auth instanceof Response) return auth
  const rows = await getDb().select().from(volunteers).orderBy(desc(volunteers.createdAt))
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const auth = await requireArea('voluntarios')
  if (auth instanceof Response) return auth
  const data = await parseBody(req, volunteerInput)
  if (data instanceof Response) return data

  const [created] = await getDb()
    .insert(volunteers)
    .values({ ...data, email: data.email || null })
    .returning()
  await audit(auth, 'create', 'volunteers', created.id)
  return NextResponse.json(created, { status: 201 })
}
