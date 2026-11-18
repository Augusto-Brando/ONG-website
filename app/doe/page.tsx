import type { Metadata } from 'next'
import { Doe } from '@/components/site/doe/Doe'

export const metadata: Metadata = {
  title: 'Doe e seja sócio · Amor Não Tem Raça',
  description:
    'Doe por Pix, seja sócio contributor a partir de R$ 50 por mês e veja para onde vai cada real.',
}

/** Tela de doação: Pix, sócio contribuinte, campanhas ativas e transparência. */
export default function PageDoe() {
  return <Doe />
}
