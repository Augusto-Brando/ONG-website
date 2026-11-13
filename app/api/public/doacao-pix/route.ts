// "Já fiz o Pix" (público, sem login): registra a doação como PENDENTE.
// Ela só entra nos totais e no financeiro depois que a equipe confere no extrato e confirma no painel.
import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { campaigns, donations } from '@/lib/schema'
import { publicPixDonationInput } from '@/lib/validators'
import { adminEmail, sendMail } from '@/lib/mail'
import { formatMoney, todayIso } from '@/lib/format'

export const dynamic = 'force-dynamic'

// Limite em memória por IP (produção: 5 a cada 10 min; fora dela, folgado para testes).
const WINDOW_MS = 10 * 60 * 1000
const MAX_POR_IP = process.env.NODE_ENV === 'production' ? 5 : 100
const hits = new Map<string, number[]>()

function limitado(ip: string) {
  const agora = Date.now()
  const recentes = (hits.get(ip) ?? []).filter((t) => agora - t < WINDOW_MS)
  if (recentes.length >= MAX_POR_IP) return true
  recentes.push(agora)
  hits.set(ip, recentes)
  return false
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (limitado(ip)) {
    return NextResponse.json({ error: 'Muitos registros em pouco tempo. Tente de novo mais tarde.' }, { status: 429 })
  }

  const parsed = publicPixDonationInput.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const data = parsed.data
  if (data.website) return NextResponse.json({ success: true }) // robô: finge sucesso, não grava

  const db = getDb()

  if (data.campaignId) {
    const [c] = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(and(eq(campaigns.id, data.campaignId), eq(campaigns.active, true)))
      .limit(1)
    if (!c) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 400 })
  }

  // Idempotente: o mesmo Pix (txid) não é registrado duas vezes.
  const [existente] = await db
    .select({ id: donations.id })
    .from(donations)
    .where(eq(donations.pixTxid, data.txid))
    .limit(1)
  if (existente) return NextResponse.json({ success: true, jaRegistrado: true })

  const nome = data.nome?.trim() || null
  await db.insert(donations).values({
    donorName: nome,
    donorEmail: data.email || null,
    type: 'dinheiro',
    amount: data.valor.toFixed(2),
    method: 'pix',
    description: 'Pix pelo site (aguardando confirmação no extrato)',
    campaignId: data.campaignId ?? null,
    receivedAt: todayIso(),
    status: 'pendente',
    pixTxid: data.txid,
  })

  await sendMail(adminEmail(), 'Novo Pix informado pelo site', [
    `Alguém informou um Pix de ${formatMoney(data.valor)} pelo site.`,
    `Identificador (aparece no extrato): ${data.txid}`,
    'Confira no extrato da conta e confirme em Painel > Doações > Pix a confirmar.',
  ])

  return NextResponse.json({ success: true }, { status: 201 })
}
