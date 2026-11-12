'use client'

import { useContador } from './useContador'
import { useEntrada } from './useEntrada'

const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/**
 * Número de impacto: conta do zero ao valor quando entra na tela (uma vez).
 * O valor **sempre vem da API**; sem dado (`null`), mostra esqueleto — nunca número inventado.
 * O número animado é decorativo: o leitor de tela ouve o valor final com o rótulo.
 */
export function NumeroImpacto({
  valor,
  rotulo,
  sufixo = '',
  escuro = false,
}: {
  valor: number | null
  rotulo: string
  sufixo?: string
  escuro?: boolean
}) {
  const { ref, visivel } = useEntrada<HTMLDivElement>()
  const n = useContador(valor ?? 0, visivel)
  const cor = escuro ? 'var(--ant-branco)' : 'var(--ant-tinta)'
  const semDado = valor === null

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-1)', color: cor }}>
      {semDado ? (
        <span
          className="ant-esqueleto"
          style={{ display: 'block', width: '110px', height: '40px', borderRadius: 'var(--ant-raio-campo)' }}
          aria-hidden="true"
        />
      ) : (
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--ant-fonte-titulo)',
            fontWeight: 800,
            fontSize: 'var(--ant-titulo-md)',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {n.toLocaleString('pt-BR')}
          {sufixo}
        </span>
      )}
      <span className="sr-only">
        {semDado ? `carregando ${rotulo}` : `${(valor ?? 0).toLocaleString('pt-BR')}${sufixo} ${rotulo}`}
      </span>
      <span aria-hidden="true" style={{ fontWeight: 600, fontSize: 'var(--ant-texto-sm)' }}>
        {rotulo}
      </span>
    </div>
  )
}

/**
 * Barra de meta de campanha: trilho em pílula, preenchimento que enche ao entrar na tela.
 * `role="progressbar"` com os valores; os textos mostram arrecadado, meta e percentual.
 */
export function BarraMeta({
  arrecadado,
  meta,
  escuro = false,
}: {
  arrecadado: number
  meta: number | null
  escuro?: boolean
}) {
  const { ref, visivel } = useEntrada<HTMLDivElement>()
  const pct = meta && meta > 0 ? Math.min(100, Math.round((arrecadado / meta) * 100)) : 0

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-2)' }}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={meta ? `${pct}% da meta` : 'Campanha sem meta definida'}
        style={{
          height: '22px',
          borderRadius: 'var(--ant-raio-pilula)',
          overflow: 'hidden',
          background: escuro ? 'var(--ant-azul-escuro)' : 'var(--ant-esqueleto)',
        }}
      >
        <div
          className="ant-barra-preenchimento"
          style={{
            width: visivel ? `${pct}%` : '0%',
            height: '100%',
            borderRadius: 'var(--ant-raio-pilula)',
            background: escuro ? 'var(--ant-sol)' : 'var(--ant-acao)',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 'var(--ant-esp-2)',
          flexWrap: 'wrap',
          fontWeight: 800,
          fontSize: 'var(--ant-texto-sm)',
          color: escuro ? 'var(--ant-branco)' : 'var(--ant-tinta)',
        }}
      >
        <span>{meta ? `${moeda(arrecadado)} de ${moeda(meta)}` : `${moeda(arrecadado)} arrecadados`}</span>
        {meta ? <span>{pct}% da meta</span> : <span>sem meta definida</span>}
      </div>
    </div>
  )
}
