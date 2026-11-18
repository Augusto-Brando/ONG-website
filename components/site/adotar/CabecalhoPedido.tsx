'use client'

// Cabeçalho simplificado do pedido: logo e saída. Sem menu e sem barra fixa,
// porque a pessoa está no meio de um formulário.
import Link from 'next/link'

export function CabecalhoPedido() {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--ant-areia)',
        background: 'var(--ant-creme)',
      }}
    >
      <div
        className="mx-auto flex items-center justify-between gap-4"
        style={{
          maxWidth: 'var(--ant-largura-max)',
          padding: 'var(--ant-esp-3) var(--ant-gutter)',
          minHeight: '72px',
        }}
      >
        <Link href="/" aria-label="Amor Não Tem Raça, início" className="flex items-center">
          <img src="/logo.svg" alt="Amor Não Tem Raça" className="h-11 w-auto md:h-14" />
        </Link>

        <Link
          href="/animais"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 'var(--ant-alvo-min)',
            color: 'var(--ant-azul)',
            fontWeight: 800,
            fontSize: 'var(--ant-texto-sm)',
            textDecoration: 'none',
          }}
        >
          Sair do pedido
        </Link>
      </div>
    </header>
  )
}
