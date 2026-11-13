'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { VStack } from '@astryxdesign/core/Stack'
import { Grid } from '@astryxdesign/core/Grid'
import { Heading, Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { InternationalizationProvider } from '@astryxdesign/core/i18n'
import ptBR from '@astryxdesign/core/locales/pt-BR.generated.js'
import { AlertTriangle } from 'lucide-react'
import { Sol } from '@/components/marca/Sol'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const enviando = useRef(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (enviando.current) return
    enviando.current = true
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email ? { email, password } : { password }),
      })
      if (res.ok) router.push('/admin/painel')
      else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'E-mail ou senha incorretos')
        enviando.current = false
        setLoading(false)
      }
    } catch {
      setError('Não foi possível entrar agora. Confira sua conexão e tente de novo.')
      enviando.current = false
      setLoading(false)
    }
  }

  return <InternationalizationProvider locale="pt-BR" messages={{ 'pt-BR': ptBR }}><VStack gap={0} className="min-h-dvh justify-center bg-(--ant-creme) p-4 md:p-8">
    <Grid gap={0} className="mx-auto w-full max-w-(--ant-largura-max) overflow-hidden rounded-(--ant-raio-bloco) bg-(--ant-branco) shadow-(--ant-sombra-md) md:grid-cols-2">
      <VStack gap={5} hAlign="center" vAlign="center" className="relative overflow-hidden bg-(--ant-sol-suave) p-8 md:p-12">
        <Sol tamanho="calc(var(--ant-esp-9) * 4)" className="absolute -top-24 -left-24" />
        <img src="/logo.svg" alt="Amor Não Tem Raça" className="relative h-24 w-auto md:h-40" />
        <VStack gap={3} className="relative max-w-sm text-center"><Heading level={2}>Cuidar fica melhor quando a gente se organiza.</Heading><Text>O trabalho da equipe ajuda cada focinho a encontrar um lar.</Text></VStack>
      </VStack>
      <VStack as="main" gap={6} vAlign="center" className="min-w-0 p-6 md:p-12">
        <VStack gap={2}><Heading level={1}>Área administrativa</Heading><Text color="secondary">Entre para cuidar do abrigo com a equipe.</Text></VStack>
        <form onSubmit={handleSubmit}><VStack gap={5}>
          <TextInput id="email" label="E-mail" type="email" autoComplete="username" value={email} onChange={setEmail} placeholder="voce@exemplo.com" hasAutoFocus isDisabled={loading} size="lg" controlClassName="min-h-12" />
          <TextInput id="password" label="Senha" type="password" autoComplete="current-password" value={password} onChange={setPassword} isRequired isDisabled={loading} size="lg" controlClassName="min-h-12" />
          {error && <Text role="alert" className="text-(--ant-erro)"><Icon icon={AlertTriangle} /> {error}</Text>}
          <Button type="submit" label={loading ? 'Entrando…' : 'Entrar'} variant="primary" size="lg" width="100%" isLoading={loading} className="min-h-(--ant-alvo-principal)" />
        </VStack></form>
      </VStack>
    </Grid>
  </VStack></InternationalizationProvider>
}
