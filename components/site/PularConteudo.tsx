'use client'

import { useState } from 'react'

/**
 * Link "Pular para o conteúdo": fica escondido até receber foco pelo teclado.
 * O esconderijo é feito com estilo inline (e não com utilitário de classe) porque o
 * `.sr-only` global de tokens.css não é sobrescrito por camadas do Tailwind.
 */
export function PularConteudo({ destino = 'conteudo' }: { destino?: string }) {
  const [visivel, setVisivel] = useState(false)

  return (
    <a
      href={`#${destino}`}
      onFocus={() => setVisivel(true)}
      onBlur={() => setVisivel(false)}
      style={
        visivel
          ? {
              position: 'fixed',
              left: 'var(--ant-esp-4)',
              top: 'var(--ant-esp-4)',
              zIndex: 50,
              background: 'var(--ant-branco)',
              color: 'var(--ant-azul)',
              fontWeight: 800,
              padding: 'var(--ant-esp-3) var(--ant-esp-4)',
              borderRadius: 'var(--ant-raio-pilula)',
              boxShadow: 'var(--ant-sombra-md)',
              minHeight: 'var(--ant-alvo-min)',
              display: 'inline-flex',
              alignItems: 'center',
            }
          : {
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }
      }
    >
      Pular para o conteúdo
    </a>
  )
}
