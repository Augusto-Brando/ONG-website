'use client'

// Casca única do painel: cabeçalho, navegação filtrada pelo perfil e botão de sair.
// Toda página nova de /admin deve envolver o conteúdo com <AdminShell title="...">.
import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Boxes,
  HandCoins,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Newspaper,
  PawPrint,
  Stethoscope,
  Users,
  UserCog,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { can, type Area } from '@/lib/auth'
import type { UserRole } from '@/lib/schema'

const NAV: { href: string; label: string; area: Area; icon: typeof PawPrint }[] = [
  { href: '/admin/painel', label: 'Painel', area: 'dashboard', icon: LayoutDashboard },
  { href: '/admin', label: 'Animais', area: 'animais', icon: PawPrint },
  { href: '/admin/tratamentos', label: 'Tratamentos', area: 'tratamentos', icon: Stethoscope },
  { href: '/admin/adocoes', label: 'Adoções', area: 'adocoes', icon: HeartHandshake },
  { href: '/admin/doacoes', label: 'Doações', area: 'doacoes', icon: HandCoins },
  { href: '/admin/financeiro', label: 'Financeiro', area: 'financeiro', icon: Wallet },
  { href: '/admin/estoque', label: 'Estoque', area: 'estoque', icon: Boxes },
  { href: '/admin/voluntarios', label: 'Voluntários', area: 'voluntarios', icon: Users },
  { href: '/admin/news', label: 'Notícias', area: 'noticias', icon: Newspaper },
  { href: '/admin/reports', label: 'Relatórios', area: 'relatorios', icon: BarChart3 },
  { href: '/admin/usuarios', label: 'Usuários', area: 'usuarios', icon: UserCog },
]

export type Me = { uid: number; name: string; role: UserRole }

export function useMe() {
  const [me, setMe] = useState<Me | null>(null)
  useEffect(() => {
    fetch('/api/auth')
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null))
  }, [])
  return me
}

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const me = useMe()

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const items = me ? NAV.filter((i) => can(me.role, i.area)) : []

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-10 border-b border-border bg-background/95">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="" className="h-10 w-auto object-contain" />
            <div>
              <p className="font-bold leading-none text-primary">Admin</p>
              <p className="text-xs text-muted-foreground">Amor não tem Raça</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {me && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {me.name} · {me.role}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav aria-label="Módulos do painel" className="container mx-auto overflow-x-auto px-4 md:px-8">
          <ul className="flex gap-1 pb-2">
            {items.map(({ href, label, icon: Icon }) => {
              const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>

      <main id="conteudo" className="container mx-auto px-4 py-8 md:px-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  )
}
