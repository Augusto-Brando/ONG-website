// Edição e exclusão de uma doação, mantendo o lançamento financeiro vinculado.
import { NextResponse } from 'next/server'
import { asc, eq, inArray } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { campaigns, donations, transactions } from '@/lib/schema'
import { audit, parseBody, parseId, requireArea } from '@/lib/api'
import { donationInput } from '@/lib/validators'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireArea('doacoes')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id
  const data = await parseBody(req, donationInput)
  if (data instanceof Response) return data

  const db = getDb()
  const [existing] = await db.select().from(donations).where(eq(donations.id, id))
  if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

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

  const [updated] = await db
    .update(donations)
    .set({
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
    .where(eq(donations.id, id))
    .returning()
  if (!updated) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  // Mantém o lançamento financeiro em dia com a doação.
  // Vínculo único: se houver mais de um lançamento (dado antigo), mantém o de menor id.
  const linkedRows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.donationId, id))
    .orderBy(asc(transactions.id))
  const [linked, ...duplicates] = linkedRows
  const amount = data.amount ?? 0
  // Doação pendente (Pix do site ainda não conferido) ou recusada não gera receita.
  const geraReceita = updated.status === 'confirmada' && data.type === 'dinheiro' && amount > 0

  if (geraReceita) {
    const values = {
      kind: 'receita' as const,
      category: 'doacao',
      description: `Doação de ${
        data.donorName && data.donorName.trim().length > 0 ? data.donorName.trim() : 'Anônimo'
      }`,
      amount: amount.toFixed(2),
      date: data.receivedAt,
    }
    if (linked) {
      await db.update(transactions).set(values).where(eq(transactions.id, linked.id))
    } else {
      await db.insert(transactions).values({ ...values, donationId: id })
    }
  } else if (linked) {
    await db.delete(transactions).where(eq(transactions.id, linked.id))
  }

  // Lançamentos duplicados do mesmo vínculo não podem ficar desatualizados.
  if (duplicates.length > 0) {
    await db.delete(transactions).where(inArray(transactions.id, duplicates.map((row) => row.id)))
  }

  const campaign = updated.campaignId
    ? (
        await db
          .select({ id: campaigns.id, title: campaigns.title })
          .from(campaigns)
          .where(eq(campaigns.id, updated.campaignId))
      )[0] ?? null
    : null

  await audit(auth, 'update', 'donations', id)
  return NextResponse.json({
    ...updated,
    amount: updated.amount === null ? null : Number(updated.amount),
    campaign: campaign ? { id: campaign.id, title: campaign.title } : null,
  })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireArea('doacoes')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id

  const db = getDb()
  const [existing] = await db.select().from(donations).where(eq(donations.id, id))
  if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  // Remove o lançamento vinculado antes da doação.
  await db.delete(transactions).where(eq(transactions.donationId, id))
  await db.delete(donations).where(eq(donations.id, id))

  await audit(auth, 'delete', 'donations', id)
  return NextResponse.json({ success: true })
}
