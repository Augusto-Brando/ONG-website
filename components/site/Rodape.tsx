import Link from 'next/link'
import { NotaManuscrita } from '@/components/marca/NotaManuscrita'
import { Sol } from '@/components/marca/Sol'
import { EMAIL, INSTAGRAM_LINK, INSTAGRAM_USUARIO, SLOGAN, WHATSAPP_EXIBICAO, WHATSAPP_LINK } from '@/components/marca/contato'

const CONTATOS = [
  { rotulo: 'WhatsApp', valor: WHATSAPP_EXIBICAO, href: WHATSAPP_LINK },
  { rotulo: 'E-mail', valor: EMAIL, href: `mailto:${EMAIL}` },
  { rotulo: 'Instagram', valor: INSTAGRAM_USUARIO, href: INSTAGRAM_LINK },
]

const LINKS = [
  { rotulo: 'Adotar', href: '/animais' },
  { rotulo: 'Como funciona', href: '/#como-funciona' },
  { rotulo: 'Ajudar', href: '/doe' },
  { rotulo: 'Notícias', href: '/#noticias' },
]

/**
 * Rodapé: faixa escura (`--ant-tinta`), slogan em Caveat, contatos oficiais com rótulos legíveis,
 * atalhos do site e o sol da marca como detalhe. Texto em amarelo-suave (contraste alto no escuro).
 */
export function Rodape() {
  return (
    <footer style={{ background: 'var(--ant-tinta)', color: 'var(--ant-branco)', marginTop: 'var(--ant-esp-8)' }}>
      <div
        style={{
          maxWidth: 'var(--ant-largura-max)',
          margin: '0 auto',
          padding: 'var(--ant-esp-7) var(--ant-gutter) var(--ant-esp-5)',
          display: 'grid',
          gap: 'var(--ant-esp-6)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ant-esp-3)' }}>
            <Sol tamanho={56} />
            <div>
              <p style={{ margin: 0, fontFamily: 'var(--ant-fonte-titulo)', fontWeight: 800, fontSize: 'var(--ant-texto-lg)' }}>
                Amor Não Tem Raça
              </p>
              <p style={{ margin: 0, color: 'var(--ant-sol-suave)', fontSize: 'var(--ant-texto-sm)' }}>Juiz de Fora, MG</p>
            </div>
          </div>
          <NotaManuscrita tamanho="var(--ant-mao-md)" cor="clara">
            {SLOGAN}
          </NotaManuscrita>
        </div>

        <div>
          <h2
            style={{
              margin: '0 0 var(--ant-esp-3)',
              fontFamily: 'var(--ant-fonte-titulo)',
              fontSize: 'var(--ant-texto-lg)',
              fontWeight: 800,
              color: 'var(--ant-sol-suave)',
            }}
          >
            Fale com a gente
          </h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-2)' }}>
            {CONTATOS.map((c) => (
              <li key={c.rotulo}>
                <span style={{ display: 'block', fontSize: 'var(--ant-texto-xs)', fontWeight: 800, color: 'var(--ant-sol-suave)' }}>
                  {c.rotulo}
                </span>
                <a
                  href={c.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: 'var(--ant-alvo-min)',
                    color: 'var(--ant-branco)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    wordBreak: 'break-word',
                  }}
                >
                  {c.valor}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2
            style={{
              margin: '0 0 var(--ant-esp-3)',
              fontFamily: 'var(--ant-fonte-titulo)',
              fontSize: 'var(--ant-texto-lg)',
              fontWeight: 800,
              color: 'var(--ant-sol-suave)',
            }}
          >
            Navegue
          </h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-1)' }}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: 'var(--ant-alvo-min)',
                    color: 'var(--ant-branco)',
                    fontWeight: 800,
                    textDecoration: 'none',
                  }}
                >
                  {l.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--ant-azul-escuro)',
          padding: 'var(--ant-esp-4) var(--ant-gutter)',
          maxWidth: 'var(--ant-largura-max)',
          margin: '0 auto',
          fontSize: 'var(--ant-texto-xs)',
          color: 'var(--ant-sol-suave)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--ant-esp-2)',
          justifyContent: 'space-between',
        }}
      >
        <span>ONG Amor Não Tem Raça · projeto de extensão universitária</span>
        <Link
          href="/admin/login"
          style={{
            color: 'var(--ant-branco)',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: '32px',
            padding: 'var(--ant-esp-1) 0',
          }}
        >
          Área da equipe
        </Link>
      </div>

      {/* Espaço para a barra fixa de ação no celular: nada do rodapé fica escondido atrás dela */}
      <div aria-hidden="true" className="md:hidden" style={{ height: 'calc(96px + env(safe-area-inset-bottom))' }} />
    </footer>
  )
}
