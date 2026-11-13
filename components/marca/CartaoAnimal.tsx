'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Dog } from '@/lib/schema'
import { label } from '@/lib/format'
import { BotaoLink } from './Botao'
import { Fita } from './Fita'
import { NotaManuscrita } from './NotaManuscrita'
import { Etiqueta } from './Etiqueta'
import { Pata } from './Pata'
import type { EstiloMarca } from './css'

const TONS = ['var(--ant-foto-1)', 'var(--ant-foto-2)', 'var(--ant-foto-3)', 'var(--ant-foto-4)']
const INCLINACOES = ['-1.5deg', '1deg', '-1deg', '1.5deg']

/**
 * Cartão polaroide do animal: fita, foto com proporção fixa, coração de "quero conhecer",
 * nome, linha de dados, nota manuscrita, etiquetas de saúde e ação.
 *
 * `acao`:
 * - `'link'` (padrão): o cartão inteiro é um link para `/animais/{id}` — o nome é o texto do
 *   link, o foco visível aparece no cartão e o coração continua um botão à parte (fora do link,
 *   nunca link dentro de link). É a variação para grade, sem vários botões laranjas.
 * - `'botao'`: mantém o botão de largura total "Conhecer {nome}" — um único cartão em destaque.
 *
 * `indice` alterna inclinação (-1,5° a 1,5°) e tom do placeholder — nunca além de 3°.
 * Sem foto, mostra a pata sobre cor suave. No celular vai sem etiquetas e sem botão.
 */
export function CartaoAnimal({
  animal,
  indice = 0,
  proporcao = '4 / 5',
  nota,
  href,
  acao = 'link',
}: {
  animal: Dog
  indice?: number
  proporcao?: string
  /** Nota manuscrita de personalidade ("ama passeios"). */
  nota?: string
  /** Destino do cartão; padrão `/animais/{id}`. */
  href?: string
  /** `'link'` = cartão inteiro clicável (padrão); `'botao'` = botão de largura total. */
  acao?: 'link' | 'botao'
}) {
  const [curtiu, setCurtiu] = useState(false)
  const [pulos, setPulos] = useState(0)

  const foto = animal.imageUrl || animal.images?.[0] || ''
  const tom = TONS[indice % TONS.length]
  const inclinacao = INCLINACOES[indice % INCLINACOES.length]
  const dados = [label(animal.species), animal.breed, animal.age].filter(Boolean).join(' · ')
  const destino = href ?? `/animais/${animal.id}`

  const conteudo = (
    <>
      <div
        style={{
          position: 'relative',
          aspectRatio: proporcao,
          borderRadius: '20px',
          overflow: 'hidden',
          background: tom,
        }}
      >
        {foto ? (
          <img
            src={foto}
            alt={`${animal.name}, ${label(animal.species).toLowerCase()}`}
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '50% 35%',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--ant-esp-1)',
            }}
          >
            <Pata />
            <span style={{ fontSize: 'var(--ant-texto-xs)', fontWeight: 800 }}>sem foto ainda</span>
          </div>
        )}
      </div>

      <div style={{ padding: '6px 8px 0', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--ant-fonte-titulo)',
            fontWeight: 800,
            fontSize: 'var(--ant-titulo-sm)',
            lineHeight: 1,
            overflowWrap: 'anywhere',
          }}
        >
          {animal.name}
        </h3>
        <p style={{ margin: 0, fontSize: 'var(--ant-texto-xs)', fontWeight: 800, color: 'var(--ant-azul)' }}>{dados}</p>
        {nota && <NotaManuscrita tamanho="var(--ant-mao-md)">{nota}</NotaManuscrita>}

        {/* No celular o cartão fica mais enxuto: sem etiquetas e sem botão */}
        <div className="hidden sm:flex" style={{ gap: '6px', flexWrap: 'wrap', margin: '4px 0 8px' }}>
          {animal.castrated && <Etiqueta>Castrado</Etiqueta>}
          {animal.vaccinated && <Etiqueta>Vacinado</Etiqueta>}
        </div>

        {acao === 'botao' && (
          <div className="hidden sm:block">
            <BotaoLink href={destino} variacao="acao" style={{ width: '100%' }}>
              Conhecer {animal.name}
            </BotaoLink>
          </div>
        )}
      </div>
    </>
  )

  return (
    <article
      className="ant-polaroide ant-polaroide--interativa"
      style={
        {
          '--ant-inclinacao': inclinacao,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ant-esp-2)',
          minWidth: 0,
        } as EstiloMarca
      }
    >
      <Fita />

      {acao === 'link' ? (
        <Link
          href={destino}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ant-esp-2)',
            color: 'inherit',
            textDecoration: 'none',
            borderRadius: '20px',
            minWidth: 0,
          }}
        >
          {conteudo}
        </Link>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-2)', minWidth: 0 }}>{conteudo}</div>
      )}

      {/* Coração fora do link: fica por cima da foto, no canto superior direito */}
      <button
        type="button"
        className="ant-botao-icone ant-coracao"
        aria-label={`Quero conhecer ${animal.name}`}
        aria-pressed={curtiu}
        onClick={() => {
          setCurtiu((v) => !v)
          setPulos((n) => n + 1)
        }}
        style={{
          position: 'absolute',
          right: '20px',
          top: '20px',
          zIndex: 2,
          width: '48px',
          height: '48px',
          borderRadius: 'var(--ant-raio-pilula)',
          border: 0,
          background: 'var(--ant-branco)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--ant-sombra-sm)',
          cursor: 'pointer',
        }}
      >
        <svg
          key={pulos}
          className={pulos ? 'ant-pulo' : undefined}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          stroke="var(--ant-laranja-texto)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill={curtiu ? 'var(--ant-acao)' : 'none'}
            d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
          />
        </svg>
      </button>
    </article>
  )
}
