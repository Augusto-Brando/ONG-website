'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SideNav, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav'
import { VStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { BarChart3, Boxes, HandCoins, HeartHandshake, LayoutDashboard, LogOut, Newspaper, PawPrint, Stethoscope, Users, UserCog, Wallet } from 'lucide-react'
import { can, type Area } from '@/lib/auth'
import { label } from '@/lib/format'
import type { Me } from '../admin-shell'

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

export function Navegacao({ me, saindo, onSair, onNavegar }: {
  me: Me | null
  saindo: boolean
  onSair: () => void
  onNavegar?: () => void
}) {
  const pathname = usePathname()
  return <SideNav aria-label="Módulos do painel" className="h-full w-full bg-(--ant-creme)" header={
    <VStack gap={2} className="p-4">
      <Link href="/admin/painel" onClick={onNavegar} aria-label="Amor Não Tem Raça, painel"><img src="/logo.svg" alt="Amor Não Tem Raça" className="h-16 w-auto" /></Link>
      <Text weight="bold">Gestão do abrigo</Text>
    </VStack>
  } footer={
    <VStack gap={3} className="border-t border-(--ant-areia) p-4">
      {me ? <VStack gap={1}><Text weight="bold" className="break-words">{me.name}</Text><Text size="sm" color="secondary">{label(me.role)}</Text></VStack> : <Text role="status">Carregando seu perfil…</Text>}
      <Button label={saindo ? 'Saindo…' : 'Sair'} icon={<Icon icon={LogOut} />} variant="secondary" isLoading={saindo} onClick={onSair} className="min-h-11" />
    </VStack>
  }>
    <SideNavSection title="Módulos" isHeaderHidden>
      {me && NAV.filter(item => can(me.role, item.area)).map(item => <SideNavItem key={item.href} label={item.label} href={item.href} icon={item.icon} size="lg" className="min-h-11" isSelected={item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)} onClick={onNavegar} />)}
    </SideNavSection>
  </SideNav>
}
