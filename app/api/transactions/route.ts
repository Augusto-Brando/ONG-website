// Financeiro: lançamentos com filtros de período/tipo e resumo do período.
import { NextResponse } from 'next/server'
import { and, desc, eq, gte, lte, type SQL } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { transactions, transactionKind } from '@/lib/schema'
import { audit, parseBody, requireArea } from '@/lib/api'
import { transactionInput } from '@/lib/validators'

export const dynamic = 'force-dynamic'

type TransactionKind = (typeof transactionKind.enumValues)[number]

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export async function GET(req: Request) {
  const auth = await requireArea('financeiro')
  if (auth instanceof Response) return auth

  const url = new URL(req.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const kind = url.searchParams.get('kind')

  const filters: SQL[] = []
  if (from) filters.push(gte(transactions.date, from))
  if (to) filters.push(lte(transactions.date, to))
  if (kind && (transactionKind.enumValues as readonly string[]).includes(kind)) {
    filters.push(eq(transactions.kind, kind as TransactionKind))
  }

  const rows = await getDb()
    .select()
    .from(transactions)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(transactions.date), desc(transactions.id))

  const items = rows.map((row) => ({ ...row, amount: Number(row.amount) }))

  // Resumo calculado sobre o mesmo filtro usado na listagem.
  let receitas = 0
  let despesas = 0
  for (const item of items) {
    if (item.kind === 'receita') receitas += item.amount
    else despesas += item.amount
  }
  receitas = round2(receitas)
  despesas = round2(despesas)

  return NextResponse.json({
    items,
    summary: { receitas, despesas, saldo: round2(receitas - despesas) },
  })
}

export async function POST(req: Request) {
  const auth = await requireArea('financeiro')
  if (auth instanceof Response) return auth
  const data = await parseBody(req, transactionInput)
  if (data instanceof Response) return data

  const [created] = await getDb()
    .insert(transactions)
    .values({
      kind: data.kind,
      category: data.category,
      description: data.description ?? '',
      amount: data.amount.toFixed(2),
      date: data.date,
      donationId: data.donationId ?? null,
      treatmentId: data.treatmentId ?? null,
    })
    .returning()

  await audit(auth, 'create', 'transactions', created.id)
  return NextResponse.json({ ...created, amount: Number(created.amount) }, { status: 201 })
}
