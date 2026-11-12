// Painel gerencial: uma única resposta com todos os indicadores agregados.
// Toda a agregação (count / sum / group by / filtro por mês) é feita no SQL;
// o JavaScript só monta o objeto e completa os meses sem movimento com zero.
import { NextResponse } from 'next/server'
import { gte, sql } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { requireArea } from '@/lib/api'
import { can } from '@/lib/auth'
import { adoptionRequests, dogs, donations, inventoryItems, treatments, transactions } from '@/lib/schema'
import { CLOSED_STAGES } from '@/lib/validators'

export const dynamic = 'force-dynamic'

type MesTotal = { mes: string; total: number }
type MesFinanceiro = { mes: string; receitas: number; despesas: number }

export type Dashboard = {
  animais: {
    total: number
    disponiveis: number
    emTratamento: number
    emProcesso: number
    adotados: number
    porEspecie: { cao: number; gato: number }
  } | null
  adocoes: {
    abertas: number
    porEtapa: Record<string, number>
    concluidasNoMes: number
  } | null
  doacoes: { totalMes: number; quantidadeMes: number; porMes: MesTotal[] } | null
  financeiro: {
    receitasMes: number
    despesasMes: number
    saldoMes: number
    porMes: MesFinanceiro[]
  } | null
  estoque: {
    itens: number
    abaixoDoMinimo: { id: number; name: string; quantity: number; minQuantity: number; unit: string }[]
  } | null
  tratamentos: {
    proximos: { id: number; animal: string; type: string; date: string }[]
  } | null
}

const num = (value: unknown) => Number(value ?? 0)

/** Chaves 'AAAA-MM' dos últimos `count` meses, do mais antigo ao atual. */
function lastMonths(count: number): string[] {
  const now = new Date()
  const months: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

export async function GET() {
  const auth = await requireArea('dashboard')
  if (auth instanceof Response) return auth

  const db = getDb()
  const meses = lastMonths(6)
  const inicio = `${meses[0]}-01`
  const mesAtual = meses[meses.length - 1]

  const result: Dashboard = {
    animais: null,
    adocoes: null,
    doacoes: null,
    financeiro: null,
    estoque: null,
    tratamentos: null,
  }

  // Animais ------------------------------------------------------------------
  if (can(auth.role, 'animais')) {
    const [row] = await db
      .select({
        total: sql<number>`count(*)::int`,
        disponiveis: sql<number>`(count(*) filter (where ${dogs.status} = 'disponivel'))::int`,
        emTratamento: sql<number>`(count(*) filter (where ${dogs.status} = 'em_tratamento'))::int`,
        emProcesso: sql<number>`(count(*) filter (where ${dogs.status} = 'em_processo'))::int`,
        adotados: sql<number>`(count(*) filter (where ${dogs.status} = 'adotado'))::int`,
        cao: sql<number>`(count(*) filter (where ${dogs.species} = 'cao'))::int`,
        gato: sql<number>`(count(*) filter (where ${dogs.species} = 'gato'))::int`,
      })
      .from(dogs)

    result.animais = {
      total: num(row?.total),
      disponiveis: num(row?.disponiveis),
      emTratamento: num(row?.emTratamento),
      emProcesso: num(row?.emProcesso),
      adotados: num(row?.adotados),
      porEspecie: { cao: num(row?.cao), gato: num(row?.gato) },
    }
  }

  // Adoções ------------------------------------------------------------------
  if (can(auth.role, 'adocoes')) {
    const etapas = await db
      .select({ stage: adoptionRequests.stage, total: sql<number>`count(*)::int` })
      .from(adoptionRequests)
      .groupBy(adoptionRequests.stage)

    const porEtapa: Record<string, number> = {}
    for (const { stage, total } of etapas) porEtapa[stage] = num(total)

    const fechadas = new Set<string>(CLOSED_STAGES)
    const abertas = Object.entries(porEtapa).reduce(
      (sum, [stage, total]) => (fechadas.has(stage) ? sum : sum + total),
      0,
    )

    const [concluidas] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(adoptionRequests)
      .where(
        sql`${adoptionRequests.stage} = 'adotado'
          and to_char(coalesce(${adoptionRequests.closedAt}, ${adoptionRequests.updatedAt}), 'YYYY-MM') = to_char(current_date, 'YYYY-MM')`,
      )

    result.adocoes = { abertas, porEtapa, concluidasNoMes: num(concluidas?.total) }
  }

  // Doações ------------------------------------------------------------------
  if (can(auth.role, 'doacoes')) {
    const [doMes] = await db
      .select({
        total: sql<string>`coalesce(sum(${donations.amount}), 0)`,
        quantidade: sql<number>`count(*)::int`,
      })
      .from(donations)
      .where(sql`to_char(${donations.receivedAt}, 'YYYY-MM') = to_char(current_date, 'YYYY-MM')`)

    const porMesRows = await db
      .select({
        mes: sql<string>`to_char(${donations.receivedAt}, 'YYYY-MM')`,
        total: sql<string>`coalesce(sum(${donations.amount}), 0)`,
      })
      .from(donations)
      .where(gte(donations.receivedAt, inicio))
      .groupBy(sql`to_char(${donations.receivedAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${donations.receivedAt}, 'YYYY-MM')`)

    const porMes: MesTotal[] = meses.map((mes) => ({
      mes,
      total: num(porMesRows.find((r) => r.mes === mes)?.total),
    }))

    result.doacoes = {
      totalMes: num(doMes?.total),
      quantidadeMes: num(doMes?.quantidade),
      porMes,
    }
  }

  // Financeiro ---------------------------------------------------------------
  if (can(auth.role, 'financeiro')) {
    const porMesRows = await db
      .select({
        mes: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`,
        receitas: sql<string>`coalesce(sum(${transactions.amount}) filter (where ${transactions.kind} = 'receita'), 0)`,
        despesas: sql<string>`coalesce(sum(${transactions.amount}) filter (where ${transactions.kind} = 'despesa'), 0)`,
      })
      .from(transactions)
      .where(gte(transactions.date, inicio))
      .groupBy(sql`to_char(${transactions.date}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${transactions.date}, 'YYYY-MM')`)

    const porMes: MesFinanceiro[] = meses.map((mes) => {
      const row = porMesRows.find((r) => r.mes === mes)
      return { mes, receitas: num(row?.receitas), despesas: num(row?.despesas) }
    })

    const atual = porMes.find((m) => m.mes === mesAtual) ?? { receitas: 0, despesas: 0 }

    result.financeiro = {
      receitasMes: atual.receitas,
      despesasMes: atual.despesas,
      saldoMes: atual.receitas - atual.despesas,
      porMes,
    }
  }

  // Estoque ------------------------------------------------------------------
  if (can(auth.role, 'estoque')) {
    const [totalItens] = await db
      .select({ itens: sql<number>`count(*)::int` })
      .from(inventoryItems)

    const baixos = await db
      .select({
        id: inventoryItems.id,
        name: inventoryItems.name,
        quantity: inventoryItems.quantity,
        minQuantity: inventoryItems.minQuantity,
        unit: inventoryItems.unit,
      })
      .from(inventoryItems)
      .where(sql`${inventoryItems.quantity} < ${inventoryItems.minQuantity}`)
      .orderBy(sql`${inventoryItems.quantity} - ${inventoryItems.minQuantity}`)

    result.estoque = {
      itens: num(totalItens?.itens),
      abaixoDoMinimo: baixos.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: num(item.quantity),
        minQuantity: num(item.minQuantity),
        unit: item.unit,
      })),
    }
  }

  // Próximos tratamentos -----------------------------------------------------
  if (can(auth.role, 'tratamentos')) {
    // Data mostrada: a do agendamento, quando o tratamento está agendado para
    // os próximos 30 dias; caso contrário, a próxima data prevista.
    const quando = sql<string>`case
      when ${treatments.status} = 'agendado' and ${treatments.date} between current_date and current_date + 30
        then ${treatments.date}
      else ${treatments.nextDate}
    end`

    const proximos = await db
      .select({
        id: treatments.id,
        animal: dogs.name,
        type: treatments.type,
        date: quando,
      })
      .from(treatments)
      .innerJoin(dogs, sql`${dogs.id} = ${treatments.animalId}`)
      .where(
        sql`(${treatments.status} = 'agendado' and ${treatments.date} between current_date and current_date + 30)
          or (${treatments.nextDate} between current_date and current_date + 30)`,
      )
      .orderBy(quando)
      .limit(8)

    result.tratamentos = {
      proximos: proximos.map((t) => ({ id: t.id, animal: t.animal, type: t.type, date: t.date })),
    }
  }

  return NextResponse.json(result)
}
