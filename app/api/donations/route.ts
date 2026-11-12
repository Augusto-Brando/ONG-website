// Doações: listagem com filtros, cadastro e criação do lançamento financeiro
// vinculado (doação em dinheiro vira uma receita na tabela `transactions`).
import { NextResponse } from 'next/server'
import { and, desc, eq, gte, lte, type SQL } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { campaigns, donations, donationType, transactions } from '@/lib/schema'
import { audit, parseBody, requireArea } from '@/lib/api'
import { donationInput } from '@/lib/validators'

export const dynamic = 'force-dynamic'

type DonationType = (typeof donationType.enumValues)[number]

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Data no formato AAAA-MM-DD e existente no calendário. */
function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false
  const [ano, mes, dia] = value.split('-').map(Number)
  const data = new Date(Date.UTC(ano, mes - 1, dia))
  return (
    data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia
  )
}

/** Descrição do lançamento gerado a partir de uma doação. */
function donationDescription(donorName: string | null | undefined): string {
  const nome = donorName?.trim()
  return `Doação de ${nome && nome.length > 0 ? nome : 'Anônimo'}`
}

export async function GET(req: Request) {
  const auth = await requireArea('doacoes')
  if (auth instanceof Response) return auth

  const url = new URL(req.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const type = url.searchParams.get('type')

  if ((from && !isIsoDate(from)) || (to && !isIsoDate(to))) {
    return NextResponse.json({ error: 'Data inválida, use AAAA-MM-DD' }, { status: 400 })
  }

  const filters: SQL[] = []
  if (from) filters.push(gte(donations.receivedAt, from))
  if (to) filters.push(lte(donations.receivedAt, to))
  if (type && (donationType.enumValues as readonly string[]).includes(type)) {
    filters.push(eq(donations.type, type as DonationType))
  }

  const rows = await getDb()
    .select({
      id: donations.id,
      donorName: donations.donorName,
      donorEmail: donations.donorEmail,
      donorPhone: donations.donorPhone,
      type: donations.type,
      amount: donations.amount,
      description: donations.description,
      method: donations.method,
      campaignId: donations.campaignId,
      receivedAt: donations.receivedAt,
      campaignTitle: campaigns.title,
    })
    .from(donations)
    .leftJoin(campaigns, eq(campaigns.id, donations.campaignId))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(donations.receivedAt), desc(donations.id))

  const items = rows.map((row) => ({
    id: row.id,
    donorName: row.donorName,
    donorEmail: row.donorEmail,
    donorPhone: row.donorPhone,
    type: row.type,
    amount: row.amount === null ? null : Number(row.amount),
    description: row.description,
    method: row.method,
    campaignId: row.campaignId,
    receivedAt: row.receivedAt,
    campaign: row.campaignId === null ? null : { id: row.campaignId, title: row.campaignTitle ?? '' },
  }))

  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const auth = await requireArea('doacoes')
  if (auth instanceof Response) return auth
  const data = await parseBody(req, donationInput)
  if (data instanceof Response) return data

  const db = getDb()

  // A campanha precisa existir (a FK é `set null` e não protege a entrada).
  if (data.campaignId) {
    const [campaign] = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(eq(campaigns.id, data.campaignId))
    if (!campaign) {
      return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 400 })
    }
  }

  const [created] = await db
    .insert(donations)
    .values({
      donorName: data.donorName ?? null,
      donorEmail: data.donorEmail ? data.donorEmail : null,
      donorPhone: data.donorPhone ?? null,
      type: data.type,
      amount: data.amount === null || data.amount === undefined ? null : data.amount.toFixed(2),
      description: data.description ?? '',
      method: data.method ?? null,
      campaignId: data.campaignId ?? null,
      receivedAt: data.receivedAt,
    })
    .returning()

  // Doação em dinheiro com valor > 0 gera uma receita no financeiro.
  if (data.type === 'dinheiro' && data.amount && data.amount > 0) {
    try {
      await db.insert(transactions).values({
        kind: 'receita',
        category: 'doacao',
        description: donationDescription(data.donorName),
        amount: data.amount.toFixed(2),
        date: data.receivedAt,
        donationId: created.id,
      })
    } catch (error) {
      // Sem o lançamento a doação ficaria sem receita no financeiro: desfaz a doação.
      console.error('Falha ao criar o lançamento da_doação', error)
      try {
        await db.delete(donations).where(eq(donations.id, created.id))
      } catch (cleanupError) {
        console.error('Falha ao desfazer a doação sem lançamento', cleanupError)
      }
      return NextResponse.json({ error: 'Não foi possível registrar a doação' }, { status: 500 })
    }
  }

  const campaign = created.campaignId
    ? (
        await db
          .select({ id: campaigns.id, title: campaigns.title })
          .from(campaigns)
          .where(eq(campaigns.id, created.campaignId))
      )[0] ?? null
    : null

  await audit(auth, 'create', 'donations', created.id)
  return NextResponse.json(
    {
      ...created,
      amount: created.amount === null ? null : Number(created.amount),
      campaign: campaign ? { id: campaign.id, title: campaign.title } : null,
    },
    { status: 201 },
  )
}
