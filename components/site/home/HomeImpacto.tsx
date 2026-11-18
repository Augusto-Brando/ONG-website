'use client'

import { useCallback, useEffect, useState } from 'react'
import { NumeroImpacto } from '@/components/marca/ImpactoEMeta'
import { larguraMax } from './ui'

type Impacto = {
  resgatados: number
  adocoesNoAno: number
  castracoes: number
  anosDeAtuacao: number
  disponiveis?: number
}

/**
 * Faixa azul de impacto: os quatro números vêm de `GET /api/public/impacto` e contam do zero
 * ao valor ao entrar na tela. Enquanto não chegam (ou se a API falhar), o componente mostra
 * esqueleto — nunca um número inventado.
 */
export function HomeImpacto() {
  const [dados, setDados] = useState<Impacto | null>(null)
  const [falhou, setFalhou] = useState(false)

  const carregar = useCallback(async () => {
    setFalhou(false)
    try {
      const res = await fetch('/api/public/impacto')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setDados((await res.json()) as Impacto)
    } catch {
      setFalhou(true)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return (
    <section aria-labelledby="impacto-titulo" style={{ paddingTop: 'var(--ant-esp-5)', paddingBottom: 'clamp(var(--ant-esp-5), 4vw, var(--ant-esp-7))' }}>
      <div style={larguraMax}>
        <h2 id="impacto-titulo" className="sr-only">
          Nosso impacto em números
        </h2>
        <div
          style={{
            background: 'var(--ant-azul)',
            color: 'var(--ant-branco)',
            borderRadius: 'var(--ant-raio-bloco)',
            padding: 'var(--ant-esp-5) var(--ant-esp-4)',
            boxShadow: 'var(--ant-sombra-sm)',
          }}
        >
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            <NumeroImpacto valor={dados?.resgatados ?? null} rotulo="animais resgatados" escuro />
            <NumeroImpacto valor={dados?.adocoesNoAno ?? null} rotulo="adoções no ano" escuro />
            <NumeroImpacto valor={dados?.castracoes ?? null} rotulo="castrações realizadas" escuro />
            <NumeroImpacto valor={dados?.anosDeAtuacao ?? null} rotulo="anos de atuação" escuro />
          </div>

          {falhou && (
            <p
              role="alert"
              style={{
                margin: 'var(--ant-esp-4) 0 0',
                color: 'var(--ant-branco)',
                fontSize: 'var(--ant-texto-sm)',
                fontWeight: 800,
              }}
            >
              Os números não carregaram agora.{' '}
              <button
                type="button"
                onClick={carregar}
                style={{
                  background: 'transparent',
                  border: 0,
                  padding: 0,
                  font: 'inherit',
                  color: 'var(--ant-branco)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  minHeight: 'var(--ant-alvo-min)',
                }}
              >
                Tentar de novo
              </button>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
