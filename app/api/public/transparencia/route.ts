// Transparência das despesas por ano — SEM login, somente leitura.
// Só valores agregados por categoria: nenhuma descrição, doador ou pessoa sai daqui.
import { NextResponse } from 'next/server'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { transactions } from '@/lib/schema'

export const dynamic = 'force-dynamic'

/** Agrupamento das despesas por categoria, do jeito que o site apresenta. */
const CATEGORIAS: Record<string, string> = {
  veterinario: 'Veterinário e castrações',
  racao: 'Ração',
  medicamento: 'Medicamentos',
}

const ROTULO_OUTROS = 'Outros'

const ANO_MINIMO = 2000
const ANO_MAXIMO = 2100

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/** Percentual com uma casa decimal. */
function percentual(valor: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((valor / total) * 1000) / 10
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const param = url.searchParams.get('ano')
  const anoAtual = new Date().getFullYear()

  let ano = anoAtual
  if (param !== null) {
    if (!/^\d{4}$/.test(param)) {
      return NextResponse.json({ error: 'Ano inválido, use AAAA' }, { status: 400 })
    }
    ano = Number(param)
    if (ano < ANO_MINIMO || ano > ANO_MAXIMO) {
      return NextResponse.json({ error: 'Ano inválido, use AAAA' }, { status: 400 })
    }
  }

  const rows = await getDb()
    .select({
      categoria: transactions.category,
      total: sql<string>`coalesce(sum(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.kind, 'despesa'),
        gte(transactions.date, `${ano}-01-01`),
        lte(transactions.date, `${ano}-12-31`),
      ),
    )
    .groupBy(transactions.category)

  // Agrupa as categorias do banco nos quatro rótulos do site.
  const grupos = new Map<string, number>()
  for (const row of rows) {
    const rotulo = CATEGORIAS[row.categoria] ?? ROTULO_OUTROS
    grupos.set(rotulo, (grupos.get(rotulo) ?? 0) + Number(row.total ?? 0))
  }

  const totalDespesas = round2([...grupos.values()].reduce((soma, valor) => soma + valor, 0))

  const categorias = [...grupos.entries()]
    .filter(([, valor]) => valor > 0)
    .map(([categoria, valor]) => ({
      categoria,
      valor: round2(valor),
      percentual: percentual(valor, totalDespesas),
    }))
    .sort((a, b) => b.valor - a.valor)

  return NextResponse.json({ ano, totalDespesas, categorias })
}
