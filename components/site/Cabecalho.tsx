'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BotaoLink } from '@/components/marca/Botao'

/** Navegação principal do site público. */
export const NAVEGACAO = [
  { rotulo: 'Adotar', href: '/animais', area: '/animais' },
  { rotulo: 'Como funciona', href: '/#como-funciona', area: null },
  { rotulo: 'Ajudar', href: '/doe', area: '/doe' },
  { rotulo: 'Notícias', href: '/#noticias', area: null },
  { rotulo: 'Contato', href: '/#contato', area: null },
] as const

function IconeMenu({ aberto }: { aberto: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--ant-tinta)"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      {aberto ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  )
}

/**
 * Cabeçalho do site: logo vetorial sem fundo, navegação de cinco links e o botão "Doar".
 * A página atual fica em azul com sublinhado amarelo. No celular, logo e botão redondo de menu
 * (44 px, `aria-expanded`/`aria-controls`, fecha com Esc e devolve o foco ao botão).
 * O "Doar" laranja só aparece a partir de 768 px: no celular quem chama a ação é a barra fixa
 * do rodapé, para não haver dois botões de ação na mesma área visível.
 */
export function Cabecalho() {
  const [aberto, setAberto] = useState(false)
  const pathname = usePathname()
  const botaoRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAberto(false)
        botaoRef.current?.focus()
      }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto])

  const linkAtivo = (area: string | null) => Boolean(area && pathname?.startsWith(area))

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'var(--ant-creme)',
        borderBottom: '1px solid var(--ant-areia)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--ant-largura-max)',
          margin: '0 auto',
          padding: '0 var(--ant-gutter)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--ant-esp-4)',
          minHeight: '72px',
        }}
      >
        <Link href="/" aria-label="Amor Não Tem Raça, início" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.svg" alt="Amor Não Tem Raça" className="h-[52px] w-auto md:h-16" />
        </Link>

        <nav aria-label="Navegação principal" className="hidden md:block">
          <ul style={{ display: 'flex', alignItems: 'center', gap: 'var(--ant-esp-5)', listStyle: 'none', margin: 0, padding: 0 }}>
            {NAVEGACAO.map((item) => {
              const ativo = linkAtivo(item.area)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={ativo ? 'page' : undefined}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      minHeight: 'var(--ant-alvo-min)',
                      color: ativo ? 'var(--ant-azul)' : 'var(--ant-tinta)',
                      fontWeight: 800,
                      textDecoration: 'none',
                      borderBottom: ativo ? '3px solid var(--ant-sol)' : '3px solid transparent',
                    }}
                  >
                    {item.rotulo}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ant-esp-2)' }}>
          <span className="hidden md:inline-flex">
            {/* Azul de contorno: o laranja fica para a ação principal de cada tela (regra da skill) */}
            <BotaoLink href="/doe" variacao="contorno">
              Doar
            </BotaoLink>
          </span>

          <button
            ref={botaoRef}
            type="button"
            className="ant-botao-icone flex items-center justify-center md:hidden"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={aberto}
            aria-controls="menu-celular"
            onClick={() => setAberto((v) => !v)}
            style={{
              width: 'var(--ant-alvo-min)',
              height: 'var(--ant-alvo-min)',
              borderRadius: 'var(--ant-raio-pilula)',
              background: 'var(--ant-branco)',
              border: '1px solid var(--ant-areia)',
              boxShadow: 'var(--ant-sombra-sm)',
              cursor: 'pointer',
            }}
          >
            <IconeMenu aberto={aberto} />
          </button>
        </div>
      </div>

      <div id="menu-celular" hidden={!aberto} className="md:hidden">
        <nav
          aria-label="Navegação principal (celular)"
          style={{
            borderTop: '1px solid var(--ant-areia)',
            padding: 'var(--ant-esp-3) var(--ant-gutter) var(--ant-esp-5)',
          }}
        >
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-1)', listStyle: 'none', margin: 0, padding: 0 }}>
            {NAVEGACAO.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setAberto(false)}
                  aria-current={linkAtivo(item.area) ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 'var(--ant-alvo-min)',
                    padding: '0 var(--ant-esp-2)',
                    fontWeight: 800,
                    fontSize: 'var(--ant-texto-md)',
                    color: linkAtivo(item.area) ? 'var(--ant-azul)' : 'var(--ant-tinta)',
                    textDecoration: 'none',
                    borderBottom: '1px solid var(--ant-areia)',
                  }}
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
