import type { ElementType, ReactNode } from 'react'

/**
 * Nota manuscrita (Caveat, 600). Nunca abaixo de 24 px — o menor tamanho usado é
 * `--ant-mao-md` (28 px). Usada para personalidade do animal, slogan e rótulos curtos.
 */
export function NotaManuscrita({
  children,
  as: Tag = 'p',
  cor = 'laranja',
  tamanho,
  className = '',
}: {
  children: ReactNode
  as?: ElementType
  cor?: 'laranja' | 'azul' | 'clara'
  tamanho?: string
  className?: string
}) {
  const corToken =
    cor === 'azul' ? 'var(--ant-azul)' : cor === 'clara' ? 'var(--ant-sol-suave)' : 'var(--ant-laranja-texto)'

  return (
    <Tag
      className={`ant-mao ${className}`.trim()}
      style={{ color: corToken, fontSize: tamanho ?? 'var(--ant-mao-md)', margin: 0 }}
    >
      {children}
    </Tag>
  )
}
