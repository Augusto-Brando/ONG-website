// Interessados em adoção (adopters).
import { NextResponse } from 'next/server'
import { asc } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { adopters } from '@/lib/schema'
import { audit, parseBody, requireArea } from '@/lib/api'
import { adopterInput } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireArea('adocoes')
  if (auth instanceof Response) return auth
  const rows = await getDb().select().from(adopters).orderBy(asc(adopters.name))
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const auth = await requireArea('adocoes')
  if (auth instanceof Response) return auth
  const data = await parseBody(req, adopterInput)
  if (data instanceof Response) return data

  const [created] = await getDb()
    .insert(adopters)
    .values({
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      city: data.city || null,
      housingType: data.housingType || null,
      hasOtherPets: data.hasOtherPets ?? null,
      notes: data.notes || null,
      consentLgpd: data.consentLgpd,
      consentAt: data.consentLgpd ? new Date() : null,
    })
    .returning()

  await audit(auth, 'create', 'adopters', created.id)
  return NextResponse.json(created, { status: 201 })
}
