// Campanhas: cada campanha vem com o total arrecadado e a contagem de doações.
import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { campaigns, donations } from '@/lib/schema'
import { audit, parseBody, requireArea } from '@/lib/api'
import { campaignInput } from '@/lib/validators'

export const dynamic = 'force-dynamic'

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export async function GET() {
  const auth = await requireArea('doacoes')
  if (auth instanceof Response) return auth

  const db = getDb()
  const rows = await db.select().from(campaigns).orderBy(desc(campaigns.startDate), desc(campaigns.id))
  const donationRows = await db
    .select({ campaignId: donations.campaignId, amount: donations.amount })
    .from(donations)
    .where(eq(donations.status, 'confirmada')) // Pix do site só conta depois de confirmado

  const totals = new Map<number, { raised: number; count: number }>()
  for (const donation of donationRows) {
    if (donation.campaignId === null) continue
    const current = totals.get(donation.campaignId) ?? { raised: 0, count: 0 }
    current.raised += Number(donation.amount ?? 0)
    current.count += 1
    totals.set(donation.campaignId, current)
  }

  const items = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    goalAmount: row.goalAmount === null ? null : Number(row.goalAmount),
    startDate: row.startDate,
    endDate: row.endDate,
    active: row.active,
    raised: round2(totals.get(row.id)?.raised ?? 0),
    donationsCount: totals.get(row.id)?.count ?? 0,
  }))

  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const auth = await requireArea('doacoes')
  if (auth instanceof Response) return auth
  const data = await parseBody(req, campaignInput)
  if (data instanceof Response) return data

  const [created] = await getDb()
    .insert(campaigns)
    .values({
      title: data.title,
      description: data.description ?? '',
      goalAmount: data.goalAmount === null || data.goalAmount === undefined ? null : data.goalAmount.toFixed(2),
      startDate: data.startDate,
      endDate: data.endDate ?? null,
      active: data.active,
    })
    .returning()

  await audit(auth, 'create', 'campaigns', created.id)
  return NextResponse.json(
    { ...created, goalAmount: created.goalAmount === null ? null : Number(created.goalAmount) },
    { status: 201 },
  )
}
