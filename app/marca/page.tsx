'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { Dog } from '@/lib/schema'
import { Botao, BotaoLink, LinkSeta } from '@/components/marca/Botao'
import { CartaoAnimal } from '@/components/marca/CartaoAnimal'
import { Carregando } from '@/components/marca/Carregando'
import { CopiarPix } from '@/components/marca/CopiarPix'
import { Chip, Etiqueta } from '@/components/marca/Etiqueta'
import { EstadoErro } from '@/components/marca/EstadoErro'
import { EstadoVazio } from '@/components/marca/EstadoVazio'
import { Fita } from '@/components/marca/Fita'
import { BarraMeta, NumeroImpacto } from '@/components/marca/ImpactoEMeta'
import { NotaManuscrita } from '@/components/marca/NotaManuscrita'
import { Pata } from '@/components/marca/Pata'
import { Sol } from '@/components/marca/Sol'
import { SiteShell } from '@/components/site/SiteShell'

/** Animal sem foto, para demonstrar o placeholder da polaroide. */
const SEM_FOTO: Dog = {
  id: 0,
  name: 'Focinho novo',
  species: 'gato',
  sex: 'femea',
  breed: 'Sem raça definida',
  age: '8 meses',
  weight: null,
  description: 'Chegou esta semana e ainda não teve sessão de fotos.',
  observations: null,
  imageUrl: '',
  color: '',
  images: null,
  available: true,
  status: 'disponivel',
  castrated: false,
  vaccinated: true,
  rescuedAt: null,
  adoptedAt: null,
  createdAt: new Date(),
}

const secao: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ant-esp-4)',
  padding: 'var(--ant-esp-6) 0',
  borderTop: '1px solid var(--ant-areia)',
}

const tituloSecao: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--ant-fonte-titulo)',
  fontWeight: 800,
  fontSize: 'var(--ant-titulo-sm)',
  color: 'var(--ant-tinta)',
}

const legenda: CSSProperties = {
  margin: 0,
  color: 'var(--ant-tinta-suave)',
  fontSize: 'var(--ant-texto-sm)',
}

const caixa: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--ant-esp-4)',
  padding: 'var(--ant-esp-5)',
  background: 'var(--ant-branco)',
  borderRadius: 'var(--ant-raio-cartao)',
  boxShadow: 'var(--ant-sombra-sm)',
}

function Titulo({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} style={tituloSecao}>
      {children}
    </h2>
  )
}

export default function MarcaPage() {
  const [animais, setAnimais] = useState<Dog[]>([])
  const [carregando, setCarregando] = useState(true)
  const [falhou, setFalhou] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [especie, setEspecie] = useState<'todos' | 'cao' | 'gato'>('todos')
  const [saude, setSaude] = useState<string[]>(['castrado'])

  const carregar = useCallback(async () => {
    setCarregando(true)
    setFalhou(false)
    try {
      const res = await fetch('/api/dogs')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const dados = (await res.json()) as Dog[]
      setAnimais(dados.slice(0, 2))
    } catch {
      setFalhou(true)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  function alternarSaude(item: string) {
    setSaude((atual) => (atual.includes(item) ? atual.filter((i) => i !== item) : [...atual, item]))
  }

  return (
    <SiteShell>
      <div
        style={{
          maxWidth: 'var(--ant-largura-max)',
          margin: '0 auto',
          padding: 'var(--ant-esp-6) var(--ant-gutter) var(--ant-esp-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ant-esp-2)',
          minWidth: 0,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ant-esp-5)', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px' }}>
            <NotaManuscrita cor="azul" tamanho="var(--ant-mao-md)">
              vitrine interna · não linkada no site
            </NotaManuscrita>
            <h1
              style={{
                margin: 'var(--ant-esp-2) 0',
                fontFamily: 'var(--ant-fonte-titulo)',
                fontWeight: 800,
                fontSize: 'var(--ant-titulo-md)',
                lineHeight: 0.95,
                color: 'var(--ant-tinta)',
              }}
            >
              Componentes da marca
            </h1>
            <p style={{ ...legenda, maxWidth: '60ch' }}>
              Todos os componentes em seus estados: botões, polaroides, motivos (sol, pata, fita, nota), etiquetas e
              chips, Pix, números de impacto, barra de meta, carregando, vazio e erro. Esta página existe só para a
              equipe conferir o desenho.
            </p>
          </div>
          <Sol tamanho={180} girando />
        </div>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="botoes" style={secao}>
          <Titulo id="botoes">Botões</Titulo>
          <p style={legenda}>
            Laranja em degrau (uma ação por área), azul para confiança e contorno para o segundo apelo. Alturas de 44,
            48 e 56 px.
          </p>

          <div style={caixa}>
            <Botao variacao="acao" tamanho="grande">
              Quero adotar
            </Botao>
            <Botao variacao="azul">Tentar de novo</Botao>
            <Botao variacao="contorno">Quero ajudar</Botao>
            <Botao variacao="azul" tamanho="minimo">
              Doar
            </Botao>
            <Botao variacao="contorno" disabled>
              Indisponível
            </Botao>
            <LinkSeta href="/animais">Ver todos os animais</LinkSeta>
          </div>

          <div style={caixa}>
            <Botao
              variacao="acao"
              tamanho="grande"
              carregando={salvando}
              onClick={() => {
                setSalvando(true)
                window.setTimeout(() => setSalvando(false), 1800)
              }}
            >
              Enviar pedido
            </Botao>
            <BotaoLink href="/animais" variacao="azul">
              Botão feito de link
            </BotaoLink>
            <span style={legenda}>Clique em “Enviar pedido” para ver o estado de carregando.</span>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="cartoes" style={secao}>
          <Titulo id="cartoes">Cartões de animal (polaroide com fita)</Titulo>
          <p style={legenda}>
            Dois animais vindos de <code>GET /api/dogs</code> mais um cartão sem foto, com as duas variações de ação:
            <strong> link</strong> (padrão — o cartão inteiro leva a <code>/animais/{'{id}'}</code>, o nome é o texto do
            link e o coração fica fora dele) e <strong>botão</strong> (destaque, com o botão “Conhecer o animal” de
            largura total). Inclinação entre -1,5° e 1,5°, endireita no hover e no foco.
          </p>

          {falhou && (
            <EstadoErro
              titulo="Não conseguimos buscar os animais"
              mensagem="A conexão falhou. Os exemplos estáticos continuam abaixo."
              onTentarDeNovo={carregar}
            />
          )}

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {animais.map((animal, i) => (
              <div key={animal.id} style={{ minWidth: 0 }}>
                <CartaoAnimal
                  animal={animal}
                  indice={i}
                  nota={i === 0 ? 'ama passeios' : 'dorme no sol'}
                  acao={i === 0 ? 'link' : 'botao'}
                />
                <p style={{ ...legenda, marginTop: 'var(--ant-esp-2)', textAlign: 'center' }}>
                  variante <strong>{i === 0 ? 'link' : 'botão'}</strong>
                </p>
              </div>
            ))}
            <div style={{ minWidth: 0 }}>
              <CartaoAnimal animal={SEM_FOTO} indice={2} acao="link" />
              <p style={{ ...legenda, marginTop: 'var(--ant-esp-2)', textAlign: 'center' }}>sem foto</p>
            </div>
          </div>

          <Carregando cartoes={3} />
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="motivos" style={secao}>
          <Titulo id="motivos">Motivos da marca</Titulo>
          <p style={legenda}>Sol (raios), pata (placeholder), fita de polaroide e nota manuscrita em Caveat.</p>

          <div style={{ ...caixa, alignItems: 'flex-start', gap: 'var(--ant-esp-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ant-esp-4)', flexWrap: 'wrap' }}>
              <Sol tamanho={120} />
              <Sol tamanho={96} girando />
              <div style={{ background: 'var(--ant-azul-escuro)', padding: 'var(--ant-esp-3)', borderRadius: 'var(--ant-raio-campo)' }}>
                <Sol tamanho={72} escuro />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ant-esp-4)' }}>
              <Pata tamanho={64} titulo="Pata da marca" />
              <Pata tamanho={40} cor="var(--ant-azul)" />
              <Pata tamanho={28} cor="var(--ant-tinta-suave)" />
            </div>

            <div style={{ position: 'relative', width: '120px', height: '72px', background: 'var(--ant-branco)' }}>
              <Fita />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-2)' }}>
              <NotaManuscrita>Adote um focinho com carinho!</NotaManuscrita>
              <NotaManuscrita cor="azul">Leva uns 3 minutos</NotaManuscrita>
              <div style={{ background: 'var(--ant-tinta)', padding: 'var(--ant-esp-2) var(--ant-esp-3)', borderRadius: 'var(--ant-raio-campo)' }}>
                <NotaManuscrita cor="clara">Todo focinho merece um lar</NotaManuscrita>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="etiquetas" style={secao}>
          <Titulo id="etiquetas">Etiquetas e chips</Titulo>
          <p style={legenda}>Etiquetas de saúde e chips de seleção com aria-pressed, alvo de 44 px.</p>

          <div style={{ ...caixa, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 'var(--ant-esp-2)', flexWrap: 'wrap' }}>
              <Etiqueta>Castrado</Etiqueta>
              <Etiqueta>Vacinado</Etiqueta>
              <Etiqueta sobreFoto>Adotado</Etiqueta>
            </div>

            <div role="group" aria-label="Espécie" style={{ display: 'flex', gap: 'var(--ant-esp-2)', flexWrap: 'wrap' }}>
              <Chip pressed={especie === 'todos'} onClick={() => setEspecie('todos')}>
                Todos
              </Chip>
              <Chip pressed={especie === 'cao'} onClick={() => setEspecie('cao')}>
                Cães
              </Chip>
              <Chip pressed={especie === 'gato'} onClick={() => setEspecie('gato')}>
                Gatos
              </Chip>
            </div>

            <div role="group" aria-label="Saúde" style={{ display: 'flex', gap: 'var(--ant-esp-2)', flexWrap: 'wrap' }}>
              <Chip tom="atributo" pressed={saude.includes('castrado')} onClick={() => alternarSaude('castrado')}>
                Castrado
              </Chip>
              <Chip tom="atributo" pressed={saude.includes('vacinado')} onClick={() => alternarSaude('vacinado')}>
                Vacinado
              </Chip>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="pix" style={secao}>
          <Titulo id="pix">Copiar chave Pix</Titulo>
          <p style={legenda}>Ao copiar, o botão fica azul-escuro com o certo e a região role=status agradece.</p>
          <div style={{ ...caixa, background: 'var(--ant-sol-suave)', flexDirection: 'column', alignItems: 'flex-start' }}>
            <CopiarPix />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="impacto" style={secao}>
          <Titulo id="impacto">Números de impacto e barra de meta</Titulo>
          <p style={legenda}>
            Contam do zero ao valor ao entrar na tela. Sem dado da API, mostram esqueleto — nunca número inventado.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 'var(--ant-esp-5)',
              padding: 'var(--ant-esp-6)',
              background: 'var(--ant-azul)',
              color: 'var(--ant-branco)',
              borderRadius: 'var(--ant-raio-bloco)',
            }}
          >
            <NumeroImpacto valor={412} rotulo="animais resgatados" escuro />
            <NumeroImpacto valor={57} rotulo="adoções no ano" escuro />
            <NumeroImpacto valor={128} rotulo="castrações realizadas" escuro />
            <NumeroImpacto valor={null} rotulo="anos de atuação" escuro />
          </div>

          <div style={{ ...caixa, flexDirection: 'column', alignItems: 'stretch', gap: 'var(--ant-esp-5)' }}>
            <BarraMeta arrecadado={2380} meta={5000} />
            <BarraMeta arrecadado={940} meta={null} />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="estados" style={secao}>
          <Titulo id="estados">Estados: carregando, vazio e erro</Titulo>
          <p style={legenda}>Os três estados de tela, com anúncio para leitor de tela e saída pelo WhatsApp.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-5)' }}>
            <Carregando cartoes={2} />
            <EstadoVazio onAcao={() => setEspecie('todos')} />
            <EstadoErro onTentarDeNovo={carregar} />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="casca" style={secao}>
          <Titulo id="casca">Casca do site</Titulo>
          <p style={legenda}>
            Esta página já está dentro de <code>SiteShell</code>: o cabeçalho acima traz a navegação e o “Doar”, o
            rodapé traz os contatos oficiais e, no celular, a barra fixa mostra “Quero adotar” e “Doar”. O link
            “Pular para o conteúdo” aparece no primeiro Tab.
          </p>
          <ul style={{ margin: 0, paddingLeft: 'var(--ant-esp-5)', color: 'var(--ant-tinta-suave)' }}>
            <li>Cabecalho: logo /logo.svg sem fundo, cinco links, página atual em azul com sublinhado amarelo.</li>
            <li>Rodape: faixa tinta, slogan em Caveat, WhatsApp, e-mail e Instagram.</li>
            <li>BarraAcaoCelular: fixa no rodapé, só abaixo de 768 px.</li>
          </ul>
          {carregando && <p style={legenda}>Buscando os dois animais de exemplo…</p>}
        </section>
      </div>
    </SiteShell>
  )
}
