// Verificação de saúde do sistema (pública): usada por monitores de disponibilidade e pelo CI.
// Não exige login e não devolve dado nenhum além do estado do banco e o horário.
import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const time = new Date().toISOString()
  try {
    const db = getDb()
    await db.execute(sql`select 1`)
    return NextResponse.json({ status: 'ok', db: 'ok', time })
  } catch (e) {
    console.error('Verificação de saúde: banco indisponível', e)
    return NextResponse.json({ status: 'erro', db: 'erro', time }, { status: 503 })
  }
}