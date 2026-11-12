// Utilitários das rotas da API: sessão, permissão, validação e auditoria.
// Padrão de uso em toda rota nova:
//
//   export async function POST(req: Request) {
//     const auth = await requireArea('doacoes')
//     if (auth instanceof Response) return auth
//     const parsed = await parseBody(req, donationInput)
//     if (parsed instanceof Response) return parsed
//     ... grava no banco ...
//     await audit(auth, 'create', 'donations', created.id)
//     return NextResponse.json(created, { status: 201 })
//   }
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { ZodSchema } from 'zod'
import { SESSION_COOKIE, can, verifySession, type Area, type Session } from './auth'
import { getDb } from './db'
import { auditLog } from './schema'

export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  return verifySession(store.get(SESSION_COOKIE)?.value)
}

/** Devolve a sessão, ou uma Response 401/403 pronta para retornar. */
export async function requireArea(area: Area): Promise<Session | Response> {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if (!can(session.role, area)) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  return session
}

/** Lê o JSON do corpo e valida com zod. Devolve os dados ou uma Response 400. */
export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T | Response> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const result = schema.safeParse(raw)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', issues: result.error.flatten().fieldErrors },
      { status: 400 },
    )
  }
  return result.data
}

/** Converte o `[id]` da rota em número; devolve Response 400 se inválido. */
export function parseId(id: string): number | Response {
  const n = Number(id)
  return Number.isInteger(n) && n > 0 ? n : NextResponse.json({ error: 'ID inválido' }, { status: 400 })
}

/** Registro de auditoria. Nunca grave dados pessoais em `details` (LGPD). */
export async function audit(
  session: Session,
  action: string,
  entity: string,
  entityId?: number | null,
  details?: Record<string, unknown>,
) {
  try {
    await getDb()
      .insert(auditLog)
      .values({ userId: session.uid || null, action, entity, entityId: entityId ?? null, details: details ?? null })
  } catch (e) {
    console.error('Falha ao registrar auditoria', e)
  }
}
