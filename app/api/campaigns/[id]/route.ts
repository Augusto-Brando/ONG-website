// Edição, encerramento e exclusão de uma campanha.
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { campaigns } from '@/lib/schema'
import { audit, parseBody, parseId, requireArea } from '@/lib/api'
import { campaignInput } from '@/lib/validators'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireArea('doacoes')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id
  const data = await parseBody(req, campaignInput)
  if (data instanceof Response) return data

  const [updated] = await getDb()
    .update(campaigns)
    .set({
      title: data.title,
      description: data.description ?? '',
      goalAmount:
        data.goalAmount === null || data.goalAmount === undefined ? null : data.goalAmount.toFixed(2),
      startDate: data.startDate,
      endDate: data.endDate ?? null,
      active: data.active,
    })
    .where(eq(campaigns.id, id))
    .returning()
  if (!updated) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  await audit(auth, 'update', 'campaigns', id)
  return NextResponse.json({
    ...updated,
    goalAmount: updated.goalAmount === null ? null : Number(updated.goalAmount),
  })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireArea('doacoes')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id

  const [deleted] = await getDb().delete(campaigns).where(eq(campaigns.id, id)).returning()
  if (!deleted) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  await audit(auth, 'delete', 'campaigns', id)
  return NextResponse.json({ success: true })
}
