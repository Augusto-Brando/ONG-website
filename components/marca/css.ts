import type { CSSProperties } from 'react'

/**
 * Estilo inline da marca: permite passar variáveis CSS (--ant-*) com tipagem.
 * Os componentes usam tokens de `app/marca/tokens.css` — nunca hex solto.
 */
export type EstiloMarca = CSSProperties & Record<`--ant-${string}`, string | number>
