'use client'

import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react'
import Link from 'next/link'
import type { EstiloMarca } from './css'

export type VariacaoBotao = 'acao' | 'azul' | 'contorno'
export type TamanhoBotao = 'minimo' | 'padrao' | 'grande'

const ALTURAS: Record<TamanhoBotao, string> = {
  minimo: 'var(--ant-alvo-min)', // 44 px
  padrao: '48px',
  grande: 'var(--ant-alvo-principal)', // 56 px
}

/** Aparência do botão da marca; exportada para links (`<Link>`) manterem o mesmo desenho. */
export function estiloBotao(variacao: VariacaoBotao = 'acao', tamanho: TamanhoBotao = 'padrao'): EstiloMarca {
  const base: EstiloMarca = {
    fontFamily: 'var(--ant-fonte-texto)',
    fontWeight: 800,
    fontSize: tamanho === 'grande' ? 'var(--ant-texto-lg)' : 'var(--ant-texto-sm)',
    minHeight: ALTURAS[tamanho],
    padding: tamanho === 'grande' ? '0 var(--ant-esp-6)' : '0 var(--ant-esp-5)',
    borderRadius: 'var(--ant-raio-pilula)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--ant-esp-2)',
    textDecoration: 'none',
    cursor: 'pointer',
    lineHeight: 1.1,
  }

  if (variacao === 'acao') {
    return {
      ...base,
      background: 'var(--ant-acao)',
      color: 'var(--ant-tinta)',
      border: 0,
      boxShadow: 'var(--ant-sombra-degrau)',
    }
  }
  if (variacao === 'azul') {
    return { ...base, background: 'var(--ant-azul)', color: 'var(--ant-branco)', border: 0 }
  }
  return {
    ...base,
    background: 'transparent',
    color: 'var(--ant-azul)',
    border: '2px solid var(--ant-azul)',
  }
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variacao?: VariacaoBotao
  tamanho?: TamanhoBotao
  carregando?: boolean
  rotuloCarregando?: string
  children: ReactNode
}

/**
 * Botão da marca: laranja em degrau (ação), azul (confiança) e contorno (segundo apelo).
 * Um único botão de ação por área visível. Alturas 44/48/56 px (alvo de toque mínimo 44).
 */
export function Botao({
  variacao = 'acao',
  tamanho = 'padrao',
  carregando = false,
  rotuloCarregando = 'Enviando…',
  children,
  className = '',
  style,
  disabled,
  type = 'button',
  ...resto
}: Props) {
  return (
    <button
      {...resto}
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={`ant-botao ${variacao === 'acao' ? 'ant-botao--acao' : ''} ${className}`.trim()}
      style={{ ...estiloBotao(variacao, tamanho), opacity: disabled ? 0.6 : undefined, ...style } as EstiloMarca}
    >
      {carregando && <Spinner />}
      {carregando ? rotuloCarregando : children}
    </button>
  )
}

/** Link com o desenho de botão (navegação — nunca `<button>` para ir a outra página). */
export function BotaoLink({
  href,
  variacao = 'acao',
  tamanho = 'padrao',
  children,
  className = '',
  style,
  ...resto
}: {
  href: string
  variacao?: VariacaoBotao
  tamanho?: TamanhoBotao
  children: ReactNode
  className?: string
  style?: EstiloMarca
} & Omit<ComponentProps<typeof Link>, 'href' | 'style'>) {
  return (
    <Link
      {...resto}
      href={href}
      className={`ant-botao ${variacao === 'acao' ? 'ant-botao--acao' : ''} ${className}`.trim()}
      style={{ ...estiloBotao(variacao, tamanho), ...style }}
    >
      {children}
    </Link>
  )
}

/** Link de texto azul com a seta que anda 6 px no hover (`.ant-seta`). */
export function LinkSeta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        color: 'var(--ant-azul)',
        fontWeight: 800,
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--ant-esp-1)',
        minHeight: 'var(--ant-alvo-min)',
      }}
    >
      {children}
      <span className="ant-seta" aria-hidden="true">
        →
      </span>
    </Link>
  )
}

/** Spinner do estado de carregando do botão. */
export function Spinner({ tamanho = 20 }: { tamanho?: number }) {
  return (
    <svg
      className="ant-spinner"
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  )
}
