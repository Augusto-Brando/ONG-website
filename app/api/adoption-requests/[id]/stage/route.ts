// Mudança de etapa da solicitação (Kanban): atualiza datas, histórico, animal e avisa o interessado.
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { adopters, adoptionRequests, dogs, interactions } from '@/lib/schema'
import { audit, parseBody, parseId, requireArea } from '@/lib/api'
import { CLOSED_STAGES, stageChangeInput } from '@/lib/validators'
import { STAGE_LABELS, todayIso } from '@/lib/format'
import { sendMail } from '@/lib/mail'

type Ctx = { params: Promise<{ id: string }> }

const IN_PROGRESS_STAGES = ['triagem', 'entrevista', 'visita', 'aprovado'] as const
const LOST_STAGES = ['recusado', 'desistiu'] as const

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireArea('adocoes')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id
  const data = await parseBody(req, stageChangeInput)
  if (data instanceof Response) return data

  const db = getDb()
  const [current] = await db.select().from(adoptionRequests).where(eq(adoptionRequests.id, id)).limit(1)
  if (!current) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const previous = current.stage
  const next = data.stage
  const closed = (CLOSED_STAGES as readonly string[]).includes(next)
  const now = new Date()

  const [updated] = await db
    .update(adoptionRequests)
    .set({ stage: next, updatedAt: now, closedAt: closed ? now : null })
    .where(eq(adoptionRequests.id, id))
    .returning()

  const labelFrom = STAGE_LABELS[previous] ?? previous
  const labelTo = STAGE_LABELS[next] ?? next
  const content = `Etapa: ${labelFrom} → ${labelTo}${data.note ? `\n\n${data.note}` : ''}`

  await db.insert(interactions).values({
    requestId: id,
    userId: auth.uid || null,
    type: 'mudanca_etapa',
    content,
  })

  // Efeitos no animal vinculado.
  let animalName: string | null = null
  if (current.animalId) {
    const [animal] = await db
      .select({ id: dogs.id, name: dogs.name, status: dogs.status })
      .from(dogs)
      .where(eq(dogs.id, current.animalId))
      .limit(1)
    if (animal) {
      animalName = animal.name
      if (next === 'adotado') {
        await db
          .update(dogs)
          .set({ status: 'adotado', available: false, adoptedAt: todayIso() })
          .where(eq(dogs.id, animal.id))
      } else if ((IN_PROGRESS_STAGES as readonly string[]).includes(next)) {
        await db.update(dogs).set({ status: 'em_processo' }).where(eq(dogs.id, animal.id))
      } else if ((LOST_STAGES as readonly string[]).includes(next) && animal.status === 'em_processo') {
        await db
          .update(dogs)
          .set({ status: 'disponivel' })
          .where(eq(dogs.id, animal.id))
      }
    }
  }

  // Aviso ao interessado (sem bloquear a resposta em caso de falha).
  const [adopter] = await db.select().from(adopters).where(eq(adopters.id, current.adopterId)).limit(1)
  if (adopter?.email) {
    await sendMail(adopter.email, `Sua solicitação de adoção: ${labelTo}`, [
      `Olá, ${adopter.name}!`,
      `Sua solicitação de adoção${animalName ? ` de ${animalName}` : ''} foi atualizada para a etapa: ${labelTo}.`,
      data.note ? `Observação da equipe: ${data.note}` : 'Nossa equipe entrará em contato com os próximos passos.',
      'Qualquer dúvida, é só responder este e-mail.',
    ])
  }

  await audit(auth, 'stage_change', 'adoption_requests', id, { from: previous, to: next })
  return NextResponse.json(updated)
}
