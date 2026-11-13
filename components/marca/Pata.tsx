/**
 * Pata da marca: cinco elipses. Usada como placeholder de foto e nos estados vazios.
 * Decorativa por padrão (`aria-hidden`); passe `titulo` quando ela for o conteúdo principal.
 */
export function Pata({
  cor = 'var(--ant-cacau)',
  tamanho = 48,
  titulo,
  className = '',
}: {
  cor?: string
  tamanho?: number
  titulo?: string
  className?: string
}) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 64 64"
      fill={cor}
      className={className}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      <ellipse cx="32" cy="42" rx="14" ry="11" />
      <ellipse cx="14" cy="28" rx="6" ry="8" />
      <ellipse cx="26" cy="16" rx="6" ry="8" />
      <ellipse cx="38" cy="16" rx="6" ry="8" />
      <ellipse cx="50" cy="28" rx="6" ry="8" />
    </svg>
  )
}
