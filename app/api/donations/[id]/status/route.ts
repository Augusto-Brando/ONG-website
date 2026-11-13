// Confirmar ou recusar um Pix informado pelo site (área 'doacoes').
// Confirmar: a doação passa a contar na campanha e gera a receita no financeiro.
import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { donations, transactions } from '@/lib/schema'
import { audit, parseBody, parseId, requireArea } from '@/lib/api'
import { donationStatusInput } from '@/lib/validators'
import { todayIso } from '@/lib/format'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireArea('doacoes')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id
  const data = await parseBody(req, donationStatusInput)
  if (data instanceof Response) return data

  const db = getDb()
  // Só sai de 'pendente' uma vez (evita confirmar duas vezes e duplicar a receita).
  const [atualizada] = await db
    .update(donations)
    .set({ status: data.status, ...(data.status === 'confirmada' ? { receivedAt: todayIso() } : {}) })
    .where(and(eq(donations.id, id), eq(donations.status, 'pendente')))
    .returning()
  if (!atualizada) {
    const [existe] = await db.select({ status: donations.status }).from(donations).where(eq(donations.id, id)).limit(1)
    return existe
      ? NextResponse.json({ error: `Esta doação já está ${existe.status}` }, { status: 409 })
      : NextResponse.json({ error: 'Não encontrada' }, { status: 404 })
  }

  if (data.status === 'confirmada' && Number(atualizada.amount ?? 0) > 0) {
    const nome = atualizada.donorName?.trim()
    try {
      await db.insert(transactions).values({
        kind: 'receita',
        category: 'doacao',
        description: `Doação de ${nome && nome.length > 0 ? nome : 'Anônimo'} (Pix pelo site)`,
        amount: atualizada.amount!,
        date: atualizada.receivedAt,
        donationId: atualizada.id,
      })
    } catch (e) {
      // Compensação (sem transação no driver de produção): sem a receita, a doação volta a pendente
      // para a equipe poder confirmar de novo.
      console.error('Falha ao lançar a receita do Pix confirmado', e)
      await db.update(donations).set({ status: 'pendente' }).where(eq(donations.id, id)).catch(() => {})
      return NextResponse.json({ error: 'Não foi possível lançar a receita. Tente confirmar de novo.' }, { status: 500 })
    }
  }

  await audit(auth, data.status === 'confirmada' ? 'pix_confirmado' : 'pix_recusado', 'donations', id, {
    txid: atualizada.pixTxid,
  })
  return NextResponse.json({ success: true, status: data.status })
}
