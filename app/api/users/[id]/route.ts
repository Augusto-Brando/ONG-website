import { NextResponse } from 'next/server'
import { and, eq, ne, sql } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { users } from '@/lib/schema'
import { audit, parseBody, parseId, requireArea } from '@/lib/api'
import { hashPassword } from '@/lib/auth'
import { userInput } from '@/lib/validators'
import { publicUser } from '@/lib/users'

type Ctx = { params: Promise<{ id: string }> }

/** Existe outro administrador ativo além deste? Evita trancar todo mundo do lado de fora. */
async function hasOtherActiveAdmin(id: number) {
  const [{ total }] = await getDb()
    .select({ total: sql<number>`count(*)::int` })
    .from(users)
    .where(and(eq(users.role, 'admin'), eq(users.active, true), ne(users.id, id)))
  return total > 0
}

export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireArea('usuarios')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id
  const data = await parseBody(req, userInput)
  if (data instanceof Response) return data

  const db = getDb()
  const [current] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!current) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const losingAdmin = current.role === 'admin' && current.active && (data.role !== 'admin' || !data.active)
  if (losingAdmin && !(await hasOtherActiveAdmin(id))) {
    return NextResponse.json({ error: 'É preciso manter pelo menos um administrador ativo' }, { status: 409 })
  }

  const [dup] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, data.email), ne(users.id, id)))
    .limit(1)
  if (dup) return NextResponse.json({ error: 'Já existe um usuário com este e-mail' }, { status: 409 })

  const [updated] = await db
    .update(users)
    .set({
      name: data.name,
      email: data.email,
      role: data.role,
      active: data.active,
      ...(data.password ? { passwordHash: await hashPassword(data.password) } : {}),
    })
    .where(eq(users.id, id))
    .returning(publicUser)
  await audit(auth, 'update', 'users', id, { role: updated.role, active: updated.active, passwordChanged: !!data.password })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireArea('usuarios')
  if (auth instanceof Response) return auth
  const id = parseId((await params).id)
  if (id instanceof Response) return id
  if (id === auth.uid) return NextResponse.json({ error: 'Você não pode excluir o próprio usuário' }, { status: 409 })

  const db = getDb()
  const [current] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!current) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  if (current.role === 'admin' && current.active && !(await hasOtherActiveAdmin(id))) {
    return NextResponse.json({ error: 'É preciso manter pelo menos um administrador ativo' }, { status: 409 })
  }

  await db.delete(users).where(eq(users.id, id))
  await audit(auth, 'delete', 'users', id)
  return NextResponse.json({ success: true })
}
