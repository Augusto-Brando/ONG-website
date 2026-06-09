import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { password } = await req.json()

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', process.env.ADMIN_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  return NextResponse.json({ success: true })
}
