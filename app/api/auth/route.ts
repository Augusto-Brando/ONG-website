import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { eq, sql } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { users } from '@/lib/schema'
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifyPassword } from '@/lib/auth'
import { audit, getSession } from '@/lib/api'
import { loginInput } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// Limite simples de tentativas por IP (memória do processo).
const attempts = new Map<string, { count: number; until: number }>()
const MAX_ATTEMPTS = 10
const WINDOW_MS = 15 * 60 * 1000

function tooMany(ip: string) {
  const a = attempts.get(ip)
  return !!a && a.until > Date.now() && a.count >= MAX_ATTEMPTS
}

function fail(ip: string) {
  const a = attempts.get(ip)
  if (!a || a.until < Date.now()) attempts.set(ip, { count: 1, until: Date.now() + WINDOW_MS })
  else a.count++
  return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  return NextResponse.json({ uid: session.uid, name: session.name, role: session.role })
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (tooMany(ip)) {
    return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em 15 minutos.' }, { status: 429 })
  }

  const parsed = loginInput.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return fail(ip)
  const { email, password } = parsed.data

  const db = getDb()
  let sessionData: { uid: number; name: string; role: 'admin' | 'voluntario' | 'financeiro' } | null = null

  if (email) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (user && user.active && (await verifyPassword(password, user.passwordHash))) {
      sessionData = { uid: user.id, name: user.name, role: user.role }
      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id))
    }
  } else {
    // Login legado por ADMIN_PASSWORD: só vale enquanto não existe nenhum usuário cadastrado
    // (permite criar o primeiro admin depois de migrar a produção).
    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(users)
    const legacy = process.env.ADMIN_PASSWORD
    if (total === 0 && legacy && password === legacy) {
      sessionData = { uid: 0, name: 'Administrador', role: 'admin' }
    }
  }

  if (!sessionData) return fail(ip)
  attempts.delete(ip)

  const store = await cookies()
  store.set(SESSION_COOKIE, await signSession(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  await audit({ ...sessionData, exp: 0 }, 'login', 'users', sessionData.uid || null)
  return NextResponse.json({ success: true, name: sessionData.name, role: sessionData.role })
}

export async function DELETE() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
  return NextResponse.json({ success: true })
}
