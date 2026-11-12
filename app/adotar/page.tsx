import type { Metadata } from 'next'
import { AssistenteAdocao } from '@/components/site/adotar/AssistenteAdocao'
import { CabecalhoPedido } from '@/components/site/adotar/CabecalhoPedido'

export const metadata: Metadata = {
  title: 'Quero adotar · Amor Não Tem Raça',
  description:
    'Conte sobre você, sua casa e sua rotina. A nossa equipe entra em contato e prepara o encontro.',
}

/**
 * Pedido de adoção em 4 etapas. O animal vem da URL (?animal=id) e aparece
 * como mini polaroide ao lado do formulário.
 */
export default async function PageAdotar({
  searchParams,
}: {
  searchParams: Promise<{ animal?: string }>
}) {
  const params = await searchParams
  const bruto = Number(params.animal)
  const animalId = Number.isInteger(bruto) && bruto > 0 ? bruto : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ant-creme)' }}>
      <CabecalhoPedido />
      <AssistenteAdocao animalId={animalId} />
    </div>
  )
}
