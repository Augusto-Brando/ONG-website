'use client'

import { useCallback, useEffect, useState } from 'react'
import { Botao, BotaoLink } from '@/components/marca/Botao'
import { VStack } from '@astryxdesign/core/Stack'
import { PixComValor } from '@/components/site/doe/PixComValor'
import { CopiarPix } from '@/components/marca/CopiarPix'
import { NotaManuscrita } from '@/components/marca/NotaManuscrita'
import { Sol } from '@/components/marca/Sol'
import { useEntrada } from '@/components/marca/useEntrada'
import { EMAIL, whatsappCom } from '@/components/marca/contato'
import { larguraMax, secao, subtitulo, tituloCartao, textoCartao, tituloSecao } from './ui'

const moeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/**
 * Barra de meta do bloco escuro: trilho em `--ant-azul` (visível sobre o `--ant-azul-escuro`
 * do bloco) e preenchimento em `--ant-sol`, enchendo ao entrar na tela. Mesmo contrato do
 * `BarraMeta` da marca: `role="progressbar"` com os valores e os textos de arrecadado/meta.
 */
function MetaCampanha({ arrecadado, meta }: { arrecadado: number; meta: number | null }) {
  const { ref, visivel } = useEntrada<HTMLDivElement>()
  const pct = meta && meta > 0 ? Math.min(100, Math.round((arrecadado / meta) * 100)) : 0

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-2)' }}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={meta ? `${pct}% da meta da campanha` : 'Campanha sem meta definida'}
        style={{
          height: '22px',
          borderRadius: 'var(--ant-raio-pilula)',
          overflow: 'hidden',
          background: 'var(--ant-azul)',
        }}
      >
        <div
          className="ant-barra-preenchimento"
          style={{
            width: visivel ? `${pct}%` : '0%',
            height: '100%',
            borderRadius: 'var(--ant-raio-pilula)',
            background: 'var(--ant-sol)',
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
          color: 'var(--ant-branco)',
        }}
      >
        <span>{meta ? `${moeda(arrecadado)} de ${moeda(meta)}` : `${moeda(arrecadado)} arrecadados`}</span>
        {meta ? <span>{pct}% da meta</span> : <span>sem meta definida</span>}
      </div>
    </div>
  )
}

type Campanha = {
  id: number
  title: string
  description: string | null
  goalAmount: number | null
  raised: number
  donationsCount: number
}

/**
 * Campanha ativa (`GET /api/public/campanhas`) em bloco escuro com sol e barra de meta,
 * mais o Pix oficial e o convite para ser sócio contribuinte. Sem campanha ou sem dado,
 * mostra esqueleto e nenhum número inventado.
 */
export function HomeCampanha() {
  const [campanha, setCampanha] = useState<Campanha | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [falhou, setFalhou] = useState(false)
  const [pixAberto, setPixAberto] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setFalhou(false)
    try {
      const res = await fetch('/api/public/campanhas')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const lista = (await res.json()) as Campanha[]
      setCampanha(lista[0] ?? null)
    } catch {
      setFalhou(true)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return (
    <section aria-labelledby="ajuda-titulo" style={secao}>
      <div style={larguraMax}>
        <h2 id="ajuda-titulo" style={tituloSecao}>
          Sua ajuda vira ração, vacina e lar
        </h2>
        <p style={subtitulo}>Toda contribuição paga o cuidado de quem ainda espera. Escolha o jeito que der.</p>

        {/* Bloco escuro da campanha */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            marginTop: 'var(--ant-esp-6)',
            padding: 'var(--ant-esp-6) var(--ant-esp-5)',
            borderRadius: 'var(--ant-raio-bloco)',
            background: 'var(--ant-azul-escuro)',
            color: 'var(--ant-branco)',
          }}
        >
          <Sol
            tamanho={260}
            escuro
            style={{ position: 'absolute', right: '-110px', top: '-120px', opacity: 0.35 }}
          />

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-3)' }}>
            <NotaManuscrita cor="clara">a campanha do momento</NotaManuscrita>

            {carregando ? (
              <>
                <span
                  className="ant-esqueleto"
                  aria-hidden="true"
                  style={{ display: 'block', height: 'var(--ant-titulo-sm)', width: 'min(100%, 380px)', borderRadius: 'var(--ant-raio-campo)' }}
                />
                <span
                  className="ant-esqueleto"
                  aria-hidden="true"
                  style={{ display: 'block', height: '12px', width: 'min(100%, 520px)', borderRadius: 'var(--ant-raio-pilula)' }}
                />
                <span className="sr-only" role="status">
                  Carregando a campanha do momento
                </span>
              </>
            ) : falhou ? (
              <>
                <h3 style={{ ...tituloCartao, color: 'var(--ant-branco)' }}>Não conseguimos carregar a campanha agora</h3>
                <p role="alert" style={{ margin: 0, color: 'var(--ant-branco)' }}>
                  A conexão falhou. O Pix e o sócio contribuinte continuam logo abaixo.
                </p>
                <button
                  type="button"
                  onClick={carregar}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'transparent',
                    border: '2px solid var(--ant-branco)',
                    borderRadius: 'var(--ant-raio-pilula)',
                    color: 'var(--ant-branco)',
                    fontFamily: 'var(--ant-fonte-texto)',
                    fontWeight: 800,
                    fontSize: 'var(--ant-texto-sm)',
                    minHeight: 'var(--ant-alvo-min)',
                    padding: '0 var(--ant-esp-4)',
                    cursor: 'pointer',
                  }}
                >
                  Tentar de novo
                </button>
              </>
            ) : campanha ? (
              <>
                <h3 style={{ ...tituloCartao, color: 'var(--ant-branco)', fontSize: 'var(--ant-titulo-md)' }}>
                  {campanha.title}
                </h3>
                {campanha.description && (
                  <p style={{ margin: 0, maxWidth: '62ch', color: 'var(--ant-branco)', fontSize: 'var(--ant-texto-md)', lineHeight: 1.5 }}>
                    {campanha.description}
                  </p>
                )}
                <div style={{ maxWidth: '560px', marginTop: 'var(--ant-esp-2)' }}>
                  <MetaCampanha arrecadado={campanha.raised} meta={campanha.goalAmount} />
                </div>
                <Botao variacao="azul" aria-expanded={pixAberto} aria-controls="pix-home-campanha" onClick={() => setPixAberto(!pixAberto)}>{pixAberto ? 'Fechar doação' : 'Doar para esta campanha'}</Botao>
                {pixAberto && <VStack id="pix-home-campanha"><PixComValor campanha={campanha} variante="escuro" /></VStack>}
              </>
            ) : (
              <>
                <h3 style={{ ...tituloCartao, color: 'var(--ant-branco)' }}>Nenhuma campanha ativa neste momento</h3>
                <p style={{ margin: 0, maxWidth: '58ch', color: 'var(--ant-branco)', fontSize: 'var(--ant-texto-md)', lineHeight: 1.5 }}>
                  O Pix continua ajudando todos os dias com ração, vacina e consultas. E você pode virar sócio
                  contribuinte para o cuidado não parar.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Pix e sócio contribuinte */}
        <div className="mt-5 grid gap-5 md:grid-cols-2" style={{ marginTop: 'var(--ant-esp-5)' }}>
          <div
            style={{
              background: 'var(--ant-branco)',
              borderRadius: 'var(--ant-raio-cartao)',
              padding: 'var(--ant-esp-5)',
              boxShadow: 'var(--ant-sombra-sm)',
            }}
          >
            <h3 style={{ ...tituloCartao, marginBottom: 'var(--ant-esp-3)' }}>Pix direto</h3>
            <CopiarPix />
          </div>

          <div
            style={{
              background: 'var(--ant-pessego)',
              borderRadius: 'var(--ant-raio-cartao)',
              padding: 'var(--ant-esp-5)',
              boxShadow: 'var(--ant-sombra-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ant-esp-3)',
            }}
          >
            <h3 style={tituloCartao}>Sócio contribuinte</h3>
            <p style={{ ...textoCartao, marginTop: 0 }}>
              A partir de R$ 50 por mês, você mantém o abrigo de pé. São três passos: você envia seus dados, a
              equipe confirma o valor combinado e o apoio mensal começa.
            </p>
            <p style={{ margin: 0, color: 'var(--ant-tinta-suave)', fontSize: 'var(--ant-texto-sm)', lineHeight: 1.5 }}>
              Envie nome completo, endereço com CEP, telefone, CPF e o valor mensal por WhatsApp ou e-mail.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ant-esp-2)' }}>
              <BotaoLink
                href={whatsappCom('Oi! Quero ser sócio contribuinte da ONG (a partir de R$ 50 por mês).')}
                variacao="azul"
                target="_blank"
                rel="noopener noreferrer"
              >
                Quero ser sócio
              </BotaoLink>
              <a
                href={`mailto:${EMAIL}?subject=${encodeURIComponent('Quero ser sócio contribuinte')}`}
                style={{
                  alignSelf: 'center',
                  color: 'var(--ant-azul)',
                  fontWeight: 800,
                  minHeight: 'var(--ant-alvo-min)',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                ou mande por e-mail
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
