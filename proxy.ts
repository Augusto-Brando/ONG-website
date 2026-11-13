import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, can, verifySession, type Area } from '@/lib/auth'

// Área exigida por prefixo de rota do painel (o mais específico primeiro).
const ROUTE_AREAS: [string, Area][] = [
  ['/admin/usuarios', 'usuarios'],
  ['/admin/adocoes', 'adocoes'],
  ['/admin/tratamentos', 'tratamentos'],
  ['/admin/estoque', 'estoque'],
  ['/admin/doacoes', 'doacoes'],
  ['/admin/financeiro', 'financeiro'],
  ['/admin/painel', 'dashboard'],
  ['/admin/reports', 'relatorios'],
  ['/admin/news', 'noticias'],
  ['/admin/voluntarios', 'voluntarios'],
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/admin/login') return NextResponse.next()

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)
  if (!session) {
    const res = NextResponse.redirect(new URL('/admin/login', request.url))
    res.cookies.delete(SESSION_COOKIE)
    return res
  }

  const area =
    pathname === '/admin' || pathname === '/admin/'
      ? 'animais'
      : ROUTE_AREAS.find(([prefix]) => pathname.startsWith(prefix))?.[1]
  if (area && !can(session.role, area)) {
    return NextResponse.redirect(new URL('/admin/painel?sem-permissao=1', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
