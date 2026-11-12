'use client'

// Faixa de campanhas ativas com barra de meta. Os números vêm da API pública.
import { BarraMeta } from '@/components/marca/ImpactoEMeta'
import { Sol } from '@/components/marca/Sol'

export type CampanhaPublica = {
  id: number
  title: string
  description: string
  goalAmount: number | null
  raised: number
  donationsCount: number
  startDate: string
  endDate: string | null
}

const data = (iso: string) => {
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function FaixaCampanhas({ campanhas }: { campanhas: CampanhaPublica[] }) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'var(--ant-azul-escuro)', color: 'var(--ant-branco)' }}
      aria-labelledby="titulo-campanhas"
    >
      <Sol tamanho={220} escuro className="ant-sol--girando" style={{ position: 'absolute', right: '-70px', top: '-80px', opacity: 0.5 }} />

      <div
        className="mx-auto flex flex-col gap-6 px-4 py-10"
        style={{ maxWidth: 'var(--ant-largura-max)', position: 'relative' }}
      >
        <h2
          id="titulo-campanhas"
          style={{
            margin: 0,
            fontFamily: 'var(--ant-fonte-titulo)',
            fontWeight: 800,
            fontSize: 'var(--ant-titulo-md)',
            lineHeight: 'var(--ant-altura-titulo)',
            color: 'var(--ant-branco)',
          }}
        >
          Campanhas em andamento
        </h2>

        {campanhas.map((campanha) => (
          <article
            key={campanha.id}
            className="flex flex-col gap-3"
            style={{
              maxWidth: '680px',
              padding: 'var(--ant-esp-5)',
              borderRadius: 'var(--ant-raio-cartao)',
              background: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontFamily: 'var(--ant-fonte-titulo)',
                fontWeight: 800,
                fontSize: 'var(--ant-titulo-sm)',
                color: 'var(--ant-branco)',
              }}
            >
              {campanha.title}
            </h3>
            {campanha.description ? (
              <p style={{ margin: 0, color: 'var(--ant-sol-suave)' }}>{campanha.description}</p>
            ) : null}
            <BarraMeta arrecadado={campanha.raised} meta={campanha.goalAmount} escuro />
            <p style={{ margin: 0, fontSize: 'var(--ant-texto-xs)', color: 'var(--ant-sol-suave)' }}>
              {campanha.donationsCount === 1 ? '1 doação' : `${campanha.donationsCount} doações`} ·{' '}
              {data(campanha.startDate)}
              {campanha.endDate ? ` até ${data(campanha.endDate)}` : ''}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
