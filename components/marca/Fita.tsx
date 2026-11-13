import type { CSSProperties } from 'react'

/**
 * Fita da polaroide (`.ant-fita`). Decorativa: sempre `aria-hidden`.
 * O posicionamento vem da classe; `style` ajusta o resto sem sair dos tokens.
 */
export function Fita({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <span className={`ant-fita ${className}`.trim()} style={style} aria-hidden="true" />
}
