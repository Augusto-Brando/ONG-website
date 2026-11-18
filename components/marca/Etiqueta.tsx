'use client'

import type { ReactNode } from 'react'

/**
 * Etiqueta (pílula pequena) para informações curtas de saúde: Castrado, Vacinado.
 * `sobreFoto` usa fundo azul-escuro com texto branco (para ficar em cima de imagem).
 */
export function Etiqueta({ children, sobreFoto = false }: { children: ReactNode; sobreFoto?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px var(--ant-esp-3)',
        borderRadius: 'var(--ant-raio-pilula)',
        background: sobreFoto ? 'var(--ant-azul-escuro)' : 'var(--ant-sol-suave)',
        color: sobreFoto ? 'var(--ant-branco)' : 'var(--ant-tinta)',
        fontWeight: 800,
        fontSize: 'var(--ant-texto-xs)',
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  )
}

/**
 * Chip de seleção acessível: `<button>` com `aria-pressed`, alvo de 44 px.
 * `tom="especie"` (seleção principal) fica tinta com texto branco;
 * `tom="atributo"` (filtros secundários) fica azul suave com texto azul.
 */
export function Chip({
  children,
  pressed,
  onClick,
  tom = 'especie',
  desabilitado = false,
}: {
  children: ReactNode
  pressed: boolean
  onClick: () => void
  tom?: 'especie' | 'atributo'
  desabilitado?: boolean
}) {
  const ativoEspecie = pressed && tom === 'especie'
  const ativoAtributo = pressed && tom === 'atributo'

  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      disabled={desabilitado}
      className="ant-botao"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--ant-esp-1)',
        minHeight: 'var(--ant-alvo-min)',
        padding: '0 var(--ant-esp-4)',
        borderRadius: 'var(--ant-raio-pilula)',
        fontWeight: 800,
        fontSize: 'var(--ant-texto-sm)',
        fontFamily: 'var(--ant-fonte-texto)',
        cursor: desabilitado ? 'not-allowed' : 'pointer',
        opacity: desabilitado ? 0.6 : undefined,
        background: ativoEspecie
          ? 'var(--ant-tinta)'
          : ativoAtributo
            ? 'var(--ant-azul-suave)'
            : 'var(--ant-branco)',
        color: ativoEspecie
          ? 'var(--ant-branco)'
          : ativoAtributo
            ? 'var(--ant-azul-texto-suave)'
            : 'var(--ant-tinta)',
        border: ativoEspecie
          ? '2px solid var(--ant-tinta)'
          : ativoAtributo
            ? '2px solid var(--ant-azul)'
            : '2px solid var(--ant-areia)',
      }}
    >
      {children}
    </button>
  )
}
