// Números de impacto da ONG — SEM login, somente leitura.
// Devolve apenas totais agregados: nenhum dado pessoal sai desta rota.
import { NextResponse } from 'next/server'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { adoptionRequests, dogs, treatments } from '@/lib/schema'

export const dynamic = 'force-dynamic'

// A ONG atua desde 2015 (dado oficial da casa).
const ANO_INICIO = 2015

export async function GET() {
  const db = getDb()
  const anoAtual = new Date().getFullYear()

  const [resgatados] = await db.select({ total: sql<number>`count(*)::int` }).from(dogs)

  const [disponiveis] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(dogs)
    .where(eq(dogs.available, true))

  const [castracoes] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(treatments)
    .where(and(eq(treatments.type, 'castracao'), eq(treatments.status, 'realizado')))

  // Adoção concluída no ano: `closedAt` quando existe; senão a última atualização.
  const [adocoesNoAno] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(adoptionRequests)
    .where(
      and(
        inArray(adoptionRequests.stage, ['adotado', 'pos_adocao']),
        sql`extract(year from coalesce(${adoptionRequests.closedAt}, ${adoptionRequests.updatedAt})) = ${anoAtual}`,
      ),
    )

  return NextResponse.json({
    resgatados: Number(resgatados?.total ?? 0),
    adocoesNoAno: Number(adocoesNoAno?.total ?? 0),
    castracoes: Number(castracoes?.total ?? 0),
    anosDeAtuacao: anoAtual - ANO_INICIO,
    disponiveis: Number(disponiveis?.total ?? 0),
  })
}
