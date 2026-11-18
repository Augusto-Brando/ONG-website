'use client'

// Transparência: barras por categoria com os percentuais da API pública.
// Sem dado da API, mostra esqueleto. Nunca inventa número.
export type Transparencia = {
  ano: number
  totalDespesas: number
  categorias: { categoria: string; valor: number; percentual: number }[]
}

const moeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function BarrasTransparencia({ dados }: { dados: Transparencia }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="titulo-transparencia"
          style={{
            margin: 0,
            fontFamily: 'var(--ant-fonte-titulo)',
            fontWeight: 800,
            fontSize: 'var(--ant-titulo-md)',
            lineHeight: 'var(--ant-altura-titulo)',
          }}
        >
          Para onde vai cada real
        </h2>
        <p style={{ margin: 0, fontWeight: 800, color: 'var(--ant-azul)' }}>
          {moeda(dados.totalDespesas)} em despesas em {dados.ano}
        </p>
      </div>

      <ul className="flex flex-col gap-4" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {dados.categorias.map((item) => (
          <li key={item.categoria} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span style={{ fontWeight: 800, fontSize: 'var(--ant-texto-md)' }}>{item.categoria}</span>
              <span style={{ color: 'var(--ant-tinta-suave)', fontSize: 'var(--ant-texto-sm)' }}>
                {moeda(item.valor)} · {item.percentual}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={item.percentual}
              aria-label={`${item.categoria}: ${item.percentual}% das despesas de ${dados.ano}`}
              style={{
                height: '20px',
                borderRadius: 'var(--ant-raio-pilula)',
                background: 'var(--ant-esqueleto)',
                overflow: 'hidden',
              }}
            >
              <div
                className="ant-barra-preenchimento"
                style={{
                  width: `${Math.min(100, item.percentual)}%`,
                  height: '100%',
                  borderRadius: 'var(--ant-raio-pilula)',
                  background: 'var(--ant-acao)',
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <p style={{ margin: 0, color: 'var(--ant-tinta-suave)', fontSize: 'var(--ant-texto-sm)' }}>
        Os percentuais vêm da prestação de contas do ano. Quer conferir tudo? Fale com a equipe pelo
        WhatsApp.
      </p>
    </div>
  )
}

/** Esqueleto das barras enquanto a API responde. */
export function TransparenciaCarregando() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="ant-esqueleto" style={{ height: '36px', width: '260px', borderRadius: 'var(--ant-raio-campo)' }} />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="ant-esqueleto" style={{ height: '18px', width: '40%', borderRadius: 'var(--ant-raio-pilula)' }} />
          <div className="ant-esqueleto" style={{ height: '20px', borderRadius: 'var(--ant-raio-pilula)' }} />
        </div>
      ))}
    </div>
  )
}
