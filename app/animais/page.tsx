import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SiteShell } from '@/components/site/SiteShell'
import { Carregando } from '@/components/marca/Carregando'
import { ListaAnimais } from '@/components/site/animais/ListaAnimais'

export const metadata: Metadata = {
  title: 'Animais para adoção | Amor Não Tem Raça',
  description: 'Conheça os cães e gatos que esperam por um lar em Juiz de Fora.',
}

export default function AnimaisPage() {
  return <SiteShell><Suspense fallback={<Carregando cartoes={6} />}><ListaAnimais /></Suspense></SiteShell>
}
