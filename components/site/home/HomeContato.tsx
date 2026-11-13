import { EMAIL, INSTAGRAM_LINK, INSTAGRAM_USUARIO, WHATSAPP_EXIBICAO, whatsappCom } from '@/components/marca/contato'
import { NotaManuscrita } from '@/components/marca/NotaManuscrita'
import { linkAzul, larguraMax, secao, subtitulo, tituloCartao, tituloSecao } from './ui'

const CANAIS = [
  {
    titulo: 'WhatsApp',
    texto: 'O jeito mais rápido de falar com a equipe. Atendimento por mensagem.',
    rotulo: WHATSAPP_EXIBICAO,
    href: whatsappCom('Oi! Quero falar com a equipe da ONG sobre adoção.'),
  },
  {
    titulo: 'E-mail',
    texto: 'Para assuntos que pedem mais detalhe, como se associar ou prestar contas.',
    rotulo: EMAIL,
    href: `mailto:${EMAIL}`,
  },
  {
    titulo: 'Instagram',
    texto: 'As novidades do dia, os resgates e os focinhos que chegaram.',
    rotulo: INSTAGRAM_USUARIO,
    href: INSTAGRAM_LINK,
  },
]

/**
 * Contato (`#contato`): canais oficiais com alvo de toque de 44 px e uma nota sobre visitas.
 * Nenhum botão laranja aqui: a barra fixa do celular já carrega a ação principal.
 */
export function HomeContato() {
  return (
    <section id="contato" aria-labelledby="contato-titulo" style={secao}>
      <div style={larguraMax}>
        <NotaManuscrita cor="azul">a gente responde</NotaManuscrita>
        <h2 id="contato-titulo" style={{ ...tituloSecao, marginTop: 'var(--ant-esp-2)' }}>
          Fale com a equipe
        </h2>
        <p style={subtitulo}>
          Dúvida sobre um animal, sobre adoção ou sobre doações? Chame no WhatsApp. A ONG não tem endereço físico no
          momento: as visitas e os encontros são combinados antes, com calma.
        </p>

        <ul
          className="grid gap-4 sm:grid-cols-3"
          style={{ listStyle: 'none', margin: 0, padding: 0, marginTop: 'var(--ant-esp-6)' }}
        >
          {CANAIS.map((canal) => (
            <li
              key={canal.titulo}
              style={{
                background: 'var(--ant-branco)',
                borderRadius: 'var(--ant-raio-cartao)',
                padding: 'var(--ant-esp-5)',
                boxShadow: 'var(--ant-sombra-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ant-esp-2)',
              }}
            >
              <h3 style={{ ...tituloCartao, fontSize: 'var(--ant-texto-lg)' }}>{canal.titulo}</h3>
              <p style={{ margin: 0, color: 'var(--ant-tinta-suave)', fontSize: 'var(--ant-texto-sm)', lineHeight: 1.5 }}>
                {canal.texto}
              </p>
              <a
                href={canal.href}
                target={canal.href.startsWith('http') ? '_blank' : undefined}
                rel={canal.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{ ...linkAzul, wordBreak: 'break-word' }}
              >
                {canal.rotulo}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
