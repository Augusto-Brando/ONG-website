import type { CSSProperties, ReactNode } from 'react'
import type { EstiloMarca } from './css'

/**
 * Sol da marca: disco com raios em gradiente cônico (`.ant-sol`).
 * Decorativo por padrão; `titulo` só quando ele carrega significado.
 * `girando` usa o giro lento de 60 s do motion.css (parado com movimento reduzido).
 */
export function Sol({
  tamanho = 220,
  girando = false,
  escuro = false,
  titulo,
  className = '',
  style,
  children,
}: {
  tamanho?: number | string
  girando?: boolean
  escuro?: boolean
  titulo?: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  const classes = ['ant-sol', escuro ? 'ant-sol--escuro' : '', girando ? 'ant-sol--girando' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      style={{ width: tamanho, height: tamanho, flex: 'none', ...style } as EstiloMarca}
    >
      {children}
    </div>
  )
}
