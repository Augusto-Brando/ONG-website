import { NotaManuscrita } from '@/components/marca/NotaManuscrita'
import { Sol } from '@/components/marca/Sol'
import { larguraMax, secao, subtitulo, tituloCartao, textoCartao, tituloSecao } from './ui'

const PASSOS = [
  {
    titulo: 'Escolha o focinho',
    texto: 'Veja quem está na vitrine, conheça a história de cada animal e escolha quem combina com a sua casa.',
  },
  {
    titulo: 'Conte sobre você',
    texto: 'Um pedido rápido no site: seus dados, como é a sua moradia e o seu dia a dia com os animais.',
  },
  {
    titulo: 'Conversa e visita',
    texto: 'A equipe chama você no WhatsApp, marca a conversa e organiza a visita para o encontro.',
  },
  {
    titulo: 'Adoção e carinho',
    texto: 'A adoção inclui vacinação, microchip, castração e um mês de acompanhamento veterinário.',
  },
]

/**
 * "Como funciona a adoção": fundo `--ant-sol-suave`, quatro passos com círculos laranja
 * numerados e um sol decorativo no canto. Âncora do menu (`#como-funciona`).
 */
export function HomePassos() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="passos-titulo"
      style={{ ...secao, background: 'var(--ant-sol-suave)', position: 'relative', overflow: 'hidden' }}
    >
      <Sol
        tamanho={340}
        style={{ position: 'absolute', right: '-120px', top: '-80px', opacity: 0.5 }}
      />

      <div style={{ ...larguraMax, position: 'relative' }}>
        <NotaManuscrita cor="laranja">é simples e sem pressa</NotaManuscrita>
        <h2 id="passos-titulo" style={{ ...tituloSecao, marginTop: 'var(--ant-esp-2)' }}>
          Como funciona a adoção
        </h2>
        <p style={subtitulo}>Quatro passos do primeiro clique até o focinho dormindo no seu sofá.</p>

        <ol
          className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          style={{ margin: 0, padding: 0, listStyle: 'none', marginTop: 'var(--ant-esp-6)' }}
        >
          {PASSOS.map((passo, i) => (
            <li
              key={passo.titulo}
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
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'var(--ant-alvo-min)',
                  height: 'var(--ant-alvo-min)',
                  borderRadius: 'var(--ant-raio-pilula)',
                  background: 'var(--ant-acao)',
                  color: 'var(--ant-tinta)',
                  fontFamily: 'var(--ant-fonte-titulo)',
                  fontWeight: 800,
                  fontSize: 'var(--ant-texto-lg)',
                }}
              >
                {i + 1}
              </span>
              <h3 style={tituloCartao}>
                <span className="sr-only">Passo {i + 1}: </span>
                {passo.titulo}
              </h3>
              <p style={textoCartao}>{passo.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
