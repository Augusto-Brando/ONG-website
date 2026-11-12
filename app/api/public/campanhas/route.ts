// Campanhas ativas para o site público — SEM login, somente leitura.
// Nunca devolve doadores nem donations: só o agregado da campanha.
import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { campaigns, donations } from '@/lib/schema'

export const dynamic = 'force-dynamic'

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export async function GET() {
  const db = getDb()

  const rows = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.active, true))
    .orderBy(desc(campaigns.startDate), desc(campaigns.id))

  const donationRows = await db
    .select({ campaignId: donations.campaignId, amount: donations.amount })
    .from(donations)

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
    raised: round2(totals.get(row.id)?.raised ?? 0),
    donationsCount: totals.get(row.id)?.count ?? 0,
    startDate: row.startDate,
    endDate: row.endDate,
  }))

  return NextResponse.json(items)
}
