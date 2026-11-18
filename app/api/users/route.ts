import { NextResponse } from 'next/server'
import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { users } from '@/lib/schema'
import { audit, parseBody, requireArea } from '@/lib/api'
import { hashPassword } from '@/lib/auth'
import { publicUser } from '@/lib/users'
import { userInput } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireArea('usuarios')
  if (auth instanceof Response) return auth
  return NextResponse.json(await getDb().select(publicUser).from(users).orderBy(asc(users.name)))
}

export async function POST(req: Request) {
  const auth = await requireArea('usuarios')
  if (auth instanceof Response) return auth
  const data = await parseBody(req, userInput)
  if (data instanceof Response) return data
  if (!data.password) return NextResponse.json({ error: 'Senha obrigatória (mínimo 8 caracteres)' }, { status: 400 })

  const db = getDb()
  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1)
  if (exists) return NextResponse.json({ error: 'Já existe um usuário com este e-mail' }, { status: 409 })

  const [created] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      role: data.role,
      active: data.active,
      passwordHash: await hashPassword(data.password),
    })
    .returning(publicUser)
  await audit(auth, 'create', 'users', created.id, { role: created.role })
  return NextResponse.json(created, { status: 201 })
}
