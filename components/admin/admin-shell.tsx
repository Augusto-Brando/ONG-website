'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Layout } from '@astryxdesign/core/Layout'
import { VStack, HStack } from '@astryxdesign/core/Stack'
import { Drawer } from '@astryxdesign/core/Drawer'
import { Button } from '@astryxdesign/core/Button'
import { Heading, Text } from '@astryxdesign/core/Text'
import { Icon } from '@astryxdesign/core/Icon'
import { InternationalizationProvider } from '@astryxdesign/core/i18n'
import ptBR from '@astryxdesign/core/locales/pt-BR.generated.js'
import { AlertTriangle, Menu, X } from 'lucide-react'
import type { UserRole } from '@/lib/schema'
import { PularConteudo } from '@/components/site/PularConteudo'
import { Navegacao } from './shell/Navegacao'

export type Me = { uid: number; name: string; role: UserRole }

export function useMe() {
  const [me, setMe] = useState<Me | null>(null)
  useEffect(() => {
    fetch('/api/auth')
      .then(r => r.ok ? r.json() : null)
      .then(setMe)
      .catch(() => setMe(null))
  }, [])
  return me
}

export function AdminShell({ title, description, actions, children }: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  const router = useRouter()
  const me = useMe()
  const [aberto, setAberto] = useState(false)
  const [saindo, setSaindo] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogout() {
    setSaindo(true)
    setErro('')
    try {
      const res = await fetch('/api/auth', { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao sair')
      router.push('/admin/login')
    } catch {
      setErro('Não foi possível sair agora. Tente de novo.')
      setSaindo(false)
    }
  }

  const navegacao = <Navegacao me={me} saindo={saindo} onSair={handleLogout} onNavegar={() => setAberto(false)} />

  return <InternationalizationProvider locale="pt-BR" messages={{ 'pt-BR': ptBR }}><VStack gap={0} className="min-h-dvh min-w-0 bg-(--ant-creme) text-(--ant-tinta)">
    <PularConteudo />
    <HStack as="header" gap={3} hAlign="between" vAlign="center" className="sticky top-0 z-20 border-b border-(--ant-areia) bg-(--ant-creme) p-4 md:hidden">
      <Link href="/admin/painel" aria-label="Amor Não Tem Raça, painel"><img src="/logo.svg" alt="Amor Não Tem Raça" className="h-12 w-auto" /></Link>
      <Button label="Abrir navegação" aria-label="Abrir navegação" icon={<Icon icon={Menu} />} isIconOnly variant="secondary" className="min-h-11 min-w-11" aria-expanded={aberto} aria-controls="navegacao-painel" onClick={() => setAberto(true)} />
    </HStack>
    {/* Layout mantém o main#conteudo exigido pelo projeto; AppShell usa um id interno fixo. */}
    <Layout height="auto" padding={0} className="min-w-0 flex-1" start={
      <VStack className="sticky top-0 hidden h-dvh w-72 shrink-0 border-r border-(--ant-areia) md:flex">{navegacao}</VStack>
    } content={
      <main id="conteudo" tabIndex={-1} className="min-w-0 max-w-full flex-1 p-4 md:p-8">
        <VStack gap={6} className="min-w-0 rounded-(--ant-raio-cartao) bg-(--ant-branco) p-4 md:p-6">
          <HStack gap={3} wrap="wrap" hAlign="between" vAlign="start">
            <VStack gap={1} className="min-w-0"><Heading level={1} className="break-words">{title}</Heading>{description && <Text size="sm" color="secondary">{description}</Text>}</VStack>
            {actions && <HStack gap={2} wrap="wrap" className="max-w-full">{actions}</HStack>}
          </HStack>
          {erro && <Text role="alert"><Icon icon={AlertTriangle} /> {erro}</Text>}
          {children}
        </VStack>
      </main>
    } />
    <Drawer id="navegacao-painel" isOpen={aberto} onOpenChange={setAberto} label="Navegação do painel" side="start" width="calc(var(--ant-esp-9) * 3)" padding={0}>
      <VStack gap={0} className="h-full bg-(--ant-creme)">
        <HStack hAlign="end" className="p-3"><Button label="Fechar navegação" aria-label="Fechar navegação" icon={<Icon icon={X} />} isIconOnly variant="ghost" className="min-h-11 min-w-11" onClick={() => setAberto(false)} /></HStack>
        {navegacao}
      </VStack>
    </Drawer>
  </VStack></InternationalizationProvider>
}
