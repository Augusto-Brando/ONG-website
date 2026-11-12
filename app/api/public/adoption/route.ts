// Formulário público "Quero adotar" — SEM login.
// Cria o interessado (com consentimento LGPD) e a solicitação em etapa 'novo'.
// Nunca devolve dados pessoais na resposta.
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { adopters, adoptionRequests, dogs } from '@/lib/schema'
import { parseBody } from '@/lib/api'
import { publicAdoptionInput } from '@/lib/validators'
import { adminEmail, sendMail } from '@/lib/mail'

export const dynamic = 'force-dynamic'

// Limite em memória: 5 envios por IP a cada 10 minutos e 30 no total (todos os IPs).
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const MAX_GLOBAL_PER_WINDOW = 30
const hits = new Map<string, number[]>()
let globalHits: number[] = []

function clientIp(req: Request): string {
  // `x-real-ip` é definido pelo proxy; o XFF pode vir forjado pelo cliente, então é só o fallback.
  const realIp = req.headers.get('x-real-ip')
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = realIp || (forwarded ? forwarded.split(',')[0] : null)
  return ip?.trim() || 'local'
}

/** Registra a tentativa e diz se o IP passou do limite. */
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  // Limpeza periódica para o mapa não crescer sem limite.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key)
    }
  }
  return false
}

/** Teto global (somando todos os IPs): registra a tentativa e diz se passou de 30 na janela. */
function isGloballyRateLimited(): boolean {
  const now = Date.now()
  globalHits = globalHits.filter((t) => now - t < WINDOW_MS)
  if (globalHits.length >= MAX_GLOBAL_PER_WINDOW) return true
  globalHits.push(now)
  return false
}

export async function POST(req: Request) {
  // Honeypot: campo `website` deve vir vazio. Se vier preenchido, responde 200 sem gravar.
  let probe: unknown = null
  try {
    probe = await req.clone().json()
  } catch {
    probe = null
  }
  if (probe && typeof probe === 'object') {
    const website = (probe as Record<string, unknown>).website
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json({ success: true }, { status: 200 })
    }
  }

  if (isRateLimited(clientIp(req))) {
    return NextResponse.json(
      { error: 'Muitas solicitações deste endereço. Tente novamente em alguns minutos.' },
      { status: 429 },
    )
  }

  if (isGloballyRateLimited()) {
    return NextResponse.json(
      { error: 'Muitas solicitações no momento. Tente novamente em alguns minutos.' },
      { status: 429 },
    )
  }

  const data = await parseBody(req, publicAdoptionInput)
  if (data instanceof Response) return data

  const db = getDb()

  let animalName: string | null = null
  if (data.animalId) {
    const [animal] = await db
      .select({ id: dogs.id, name: dogs.name, status: dogs.status, available: dogs.available })
      .from(dogs)
      .where(eq(dogs.id, data.animalId))
      .limit(1)
    if (!animal) return NextResponse.json({ error: 'Animal não encontrado' }, { status: 400 })
    // Animal fora da vitrine não recebe solicitação nova.
    if (!animal.available || animal.status === 'adotado' || animal.status === 'indisponivel') {
      return NextResponse.json({ error: 'Este animal não está disponível para adoção' }, { status: 400 })
    }
    animalName = animal.name
  }

  // Gravações em sequência (o driver de produção não suporta transação).
  const [adopter] = await db
    .insert(adopters)
    .values({
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      city: data.city || null,
      housingType: data.housingType || null,
      hasOtherPets: data.hasOtherPets ?? null,
      consentLgpd: true,
      consentAt: new Date(),
    })
    .returning()

  try {
    await db.insert(adoptionRequests).values({
      adopterId: adopter.id,
      animalId: data.animalId ?? null,
      stage: 'novo',
      source: 'site',
      message: data.message,
    })
  } catch (e) {
    // Compensação (sem transação): desfaz o interessado recém-criado antes de devolver o erro.
    console.error('Falha ao gravar a solicitação de adoção', e)
    try {
      await db.delete(adopters).where(eq(adopters.id, adopter.id))
    } catch (cleanupError) {
      console.error('Falha ao remover o interessado após erro', cleanupError)
    }
    return NextResponse.json(
      { error: 'Não foi possível registrar a solicitação. Tente novamente.' },
      { status: 500 },
    )
  }

  // E-mails (falha de e-mail não derruba a operação).
  if (adopter.email) {
    await sendMail(adopter.email, 'Recebemos sua solicitação de adoção', [
      `Olá, ${adopter.name}!`,
      animalName
        ? `Recebemos sua solicitação de adoção de ${animalName}.`
        : 'Recebemos sua solicitação de adoção.',
      'Nossa equipe vai analisar as informações e entrar em contato pelos dados informados.',
      'Obrigado por escolher adotar!',
    ])
  }
  await sendMail(adminEmail(), `Nova solicitação de adoção: ${adopter.name}`, [
    'Uma nova solicitação chegou pelo site.',
    `Nome: ${adopter.name}`,
    `Telefone: ${adopter.phone}`,
    adopter.email ? `E-mail: ${adopter.email}` : 'E-mail: não informado',
    adopter.city ? `Cidade: ${adopter.city}` : 'Cidade: não informada',
    animalName ? `Animal: ${animalName}` : 'Animal: não informado',
    data.message ? `Mensagem: ${data.message}` : 'Mensagem: —',
  ])

  return NextResponse.json({ success: true }, { status: 201 })
}
