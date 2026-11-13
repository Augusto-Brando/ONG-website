// Exportação de dados em CSV (área 'relatorios').
// LGPD: adoções saem com nome e cidade do interessado, sem telefone/e-mail;
// doações saem sem e-mail/telefone do doador.
import { NextResponse } from 'next/server'
import { and, asc, eq, sql, type SQL } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { audit, requireArea } from '@/lib/api'
import { formatDate, label, STAGE_LABELS, todayIso } from '@/lib/format'
import { toCsv } from '@/lib/csv'
import {
  adopters,
  adoptionRequests,
  campaigns,
  dogs,
  donations,
  inventoryItems,
  treatments,
  transactions,
  users,
} from '@/lib/schema'

export const dynamic = 'force-dynamic'

const ENTITIES = ['animais', 'adocoes', 'doacoes', 'financeiro', 'estoque', 'tratamentos'] as const
type Entity = (typeof ENTITIES)[number]

type CsvTable = { headers: string[]; rows: (string | number | null)[][] }
type Ctx = { params: Promise<{ entity: string }> }

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const fmtDate = (value: string | null | undefined) => (value ? formatDate(value) : '')
const numberOrBlank = (value: string | number | null | undefined) =>
  value === null || value === undefined ? '' : Number(value)

/** Junta as condições de período; sem `from`/`to` a exportação vem completa. */
function period(conds: SQL[]) {
  return conds.length ? and(...conds) : undefined
}

async function animais(from: string, to: string): Promise<CsvTable> {
  const conds: SQL[] = []
  if (from) conds.push(sql`${dogs.createdAt}::date >= ${from}::date`)
  if (to) conds.push(sql`${dogs.createdAt}::date <= ${to}::date`)

  const rows = await getDb()
    .select({
      id: dogs.id,
      name: dogs.name,
      species: dogs.species,
      sex: dogs.sex,
      breed: dogs.breed,
      age: dogs.age,
      weight: dogs.weight,
      status: dogs.status,
      available: dogs.available,
      castrated: dogs.castrated,
      vaccinated: dogs.vaccinated,
      rescuedAt: dogs.rescuedAt,
      adoptedAt: dogs.adoptedAt,
      createdAt: sql<string>`to_char(${dogs.createdAt}, 'DD/MM/YYYY')`,
    })
    .from(dogs)
    .where(period(conds))
    .orderBy(asc(dogs.id))

  return {
    headers: [
      'ID',
      'Nome',
      'Espécie',
      'Sexo',
      'Raça',
      'Idade',
      'Peso',
      'Situação',
      'Disponível para adoção',
      'Castrado',
      'Vacinado',
      'Resgatado em',
      'Adotado em',
      'Cadastrado em',
    ],
    rows: rows.map((r) => [
      r.id,
      r.name,
      label(r.species),
      label(r.sex),
      r.breed,
      r.age,
      r.weight ?? '',
      label(r.status),
      r.available ? 'Sim' : 'Não',
      r.castrated ? 'Sim' : 'Não',
      r.vaccinated ? 'Sim' : 'Não',
      fmtDate(r.rescuedAt),
      fmtDate(r.adoptedAt),
      r.createdAt,
    ]),
  }
}

async function adocoes(from: string, to: string): Promise<CsvTable> {
  const conds: SQL[] = []
  if (from) conds.push(sql`${adoptionRequests.createdAt}::date >= ${from}::date`)
  if (to) conds.push(sql`${adoptionRequests.createdAt}::date <= ${to}::date`)

  const rows = await getDb()
    .select({
      id: adoptionRequests.id,
      animal: dogs.name,
      adopter: adopters.name,
      city: adopters.city,
      stage: adoptionRequests.stage,
      source: adoptionRequests.source,
      message: adoptionRequests.message,
      assigned: users.name,
      createdAt: sql<string>`to_char(${adoptionRequests.createdAt}, 'DD/MM/YYYY')`,
      updatedAt: sql<string>`to_char(${adoptionRequests.updatedAt}, 'DD/MM/YYYY')`,
      closedAt: sql<string>`to_char(${adoptionRequests.closedAt}, 'DD/MM/YYYY')`,
    })
    .from(adoptionRequests)
    .innerJoin(adopters, eq(adopters.id, adoptionRequests.adopterId))
    .leftJoin(dogs, eq(dogs.id, adoptionRequests.animalId))
    .leftJoin(users, eq(users.id, adoptionRequests.assignedTo))
    .where(period(conds))
    .orderBy(asc(adoptionRequests.id))

  return {
    headers: [
      'ID',
      'Animal',
      'Interessado',
      'Cidade',
      'Etapa',
      'Origem',
      'Mensagem',
      'Responsável',
      'Aberto em',
      'Atualizado em',
      'Encerrado em',
    ],
    rows: rows.map((r) => [
      r.id,
      r.animal ?? '',
      r.adopter,
      r.city ?? '',
      STAGE_LABELS[r.stage] ?? label(r.stage),
      label(r.source),
      r.message,
      r.assigned ?? '',
      r.createdAt,
      r.updatedAt,
      r.closedAt ?? '',
    ]),
  }
}

async function doacoes(from: string, to: string): Promise<CsvTable> {
  const conds: SQL[] = []
  if (from) conds.push(sql`${donations.receivedAt} >= ${from}::date`)
  if (to) conds.push(sql`${donations.receivedAt} <= ${to}::date`)

  const rows = await getDb()
    .select({
      id: donations.id,
      donorName: donations.donorName,
      type: donations.type,
      amount: donations.amount,
      description: donations.description,
      method: donations.method,
      campaign: campaigns.title,
      receivedAt: donations.receivedAt,
    })
    .from(donations)
    .leftJoin(campaigns, eq(campaigns.id, donations.campaignId))
    .where(period(conds))
    .orderBy(asc(donations.id))

  return {
    headers: ['ID', 'Doador', 'Tipo', 'Valor (R$)', 'Descrição', 'Forma de pagamento', 'Campanha', 'Recebido em'],
    rows: rows.map((r) => [
      r.id,
      r.donorName ?? 'Anônimo',
      label(r.type),
      numberOrBlank(r.amount),
      r.description,
      r.method ? label(r.method) : '',
      r.campaign ?? '',
      fmtDate(r.receivedAt),
    ]),
  }
}

async function financeiro(from: string, to: string): Promise<CsvTable> {
  const conds: SQL[] = []
  if (from) conds.push(sql`${transactions.date} >= ${from}::date`)
  if (to) conds.push(sql`${transactions.date} <= ${to}::date`)

  const rows = await getDb()
    .select({
      id: transactions.id,
      kind: transactions.kind,
      category: transactions.category,
      description: transactions.description,
      amount: transactions.amount,
      date: transactions.date,
    })
    .from(transactions)
    .where(period(conds))
    .orderBy(asc(transactions.date), asc(transactions.id))

  return {
    headers: ['ID', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Data'],
    rows: rows.map((r) => [r.id, label(r.kind), r.category, r.description, numberOrBlank(r.amount), fmtDate(r.date)]),
  }
}

async function estoque(from: string, to: string): Promise<CsvTable> {
  const conds: SQL[] = []
  if (from) conds.push(sql`${inventoryItems.createdAt}::date >= ${from}::date`)
  if (to) conds.push(sql`${inventoryItems.createdAt}::date <= ${to}::date`)

  const rows = await getDb()
    .select({
      id: inventoryItems.id,
      name: inventoryItems.name,
      category: inventoryItems.category,
      unit: inventoryItems.unit,
      quantity: inventoryItems.quantity,
      minQuantity: inventoryItems.minQuantity,
      notes: inventoryItems.notes,
      createdAt: sql<string>`to_char(${inventoryItems.createdAt}, 'DD/MM/YYYY')`,
    })
    .from(inventoryItems)
    .where(period(conds))
    .orderBy(asc(inventoryItems.name))

  return {
    headers: [
      'ID',
      'Item',
      'Categoria',
      'Unidade',
      'Quantidade',
      'Estoque mínimo',
      'Abaixo do mínimo',
      'Observações',
      'Cadastrado em',
    ],
    rows: rows.map((r) => [
      r.id,
      r.name,
      label(r.category),
      r.unit,
      numberOrBlank(r.quantity),
      numberOrBlank(r.minQuantity),
      Number(r.quantity) < Number(r.minQuantity) ? 'Sim' : 'Não',
      r.notes ?? '',
      r.createdAt,
    ]),
  }
}

async function tratamentos(from: string, to: string): Promise<CsvTable> {
  const conds: SQL[] = []
  if (from) conds.push(sql`${treatments.date} >= ${from}::date`)
  if (to) conds.push(sql`${treatments.date} <= ${to}::date`)

  const rows = await getDb()
    .select({
      id: treatments.id,
      animal: dogs.name,
      type: treatments.type,
      description: treatments.description,
      veterinarian: treatments.veterinarian,
      date: treatments.date,
      nextDate: treatments.nextDate,
      cost: treatments.cost,
      status: treatments.status,
      notes: treatments.notes,
    })
    .from(treatments)
    .innerJoin(dogs, eq(dogs.id, treatments.animalId))
    .where(period(conds))
    .orderBy(asc(treatments.date), asc(treatments.id))

  return {
    headers: [
      'ID',
      'Animal',
      'Tipo',
      'Descrição',
      'Veterinário',
      'Data',
      'Próxima data',
      'Custo (R$)',
      'Situação',
      'Observações',
    ],
    rows: rows.map((r) => [
      r.id,
      r.animal,
      label(r.type),
      r.description,
      r.veterinarian ?? '',
      fmtDate(r.date),
      fmtDate(r.nextDate),
      numberOrBlank(r.cost),
      label(r.status),
      r.notes ?? '',
    ]),
  }
}

const BUILDERS: Record<Entity, (from: string, to: string) => Promise<CsvTable>> = {
  animais,
  adocoes,
  doacoes,
  financeiro,
  estoque,
  tratamentos,
}

export async function GET(req: Request, { params }: Ctx) {
  const auth = await requireArea('relatorios')
  if (auth instanceof Response) return auth

  const { entity } = await params
  if (!ENTITIES.includes(entity as Entity)) {
    return NextResponse.json({ error: 'Entidade não encontrada' }, { status: 404 })
  }

  const url = new URL(req.url)
  const from = (url.searchParams.get('from') ?? '').trim()
  const to = (url.searchParams.get('to') ?? '').trim()

  if ((from && !ISO_DATE.test(from)) || (to && !ISO_DATE.test(to))) {
    return NextResponse.json({ error: 'Período inválido. Use AAAA-MM-DD.' }, { status: 400 })
  }
  if (from && to && from > to) {
    return NextResponse.json({ error: 'A data inicial não pode ser depois da final.' }, { status: 400 })
  }

  const { headers, rows } = await BUILDERS[entity as Entity](from, to)
  await audit(auth, 'export', entity, null, {
    from: from || null,
    to: to || null,
    linhas: rows.length,
  })

  return new NextResponse(toCsv(headers, rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${entity}-${todayIso()}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
