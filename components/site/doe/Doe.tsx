'use client'

// Tela "Doe e seja sócio": Pix, sócio contribuinte, campanhas ativas e
// transparência. Os números vêm das APIs públicas.
import { useCallback, useEffect, useState } from 'react'
import { BotaoLink } from '@/components/marca/Botao'
import { CopiarPix } from '@/components/marca/CopiarPix'
import { EstadoErro } from '@/components/marca/EstadoErro'
import { NotaManuscrita } from '@/components/marca/NotaManuscrita'
import { Sol } from '@/components/marca/Sol'
import { EMAIL, whatsappCom } from '@/components/marca/contato'
import { SiteShell } from '@/components/site/SiteShell'
import { BarrasTransparencia, TransparenciaCarregando, type Transparencia } from './BarrasTransparencia'
import { FaixaCampanhas, type CampanhaPublica } from './FaixaCampanhas'

const PASSOS_SOCIO = [
  {
    numero: '1',
    titulo: 'Fale com a gente',
    texto: 'Chame no WhatsApp ou mande um e-mail. A gente conta como funciona.',
  },
  {
    numero: '2',
    titulo: 'Envie seus dados',
    texto:
      'Nome completo, endereço completo com CEP, telefone, CPF e o valor mensal que você quer contribuir.',
  },
  {
    numero: '3',
    titulo: 'Receba a chave Pix',
    texto: 'A gente confirma sua mensalidade e envia a chave para você doar todo mês.',
  },
]

export function Doe() {
  const [campanhas, setCampanhas] = useState<CampanhaPublica[]>([])
  const [transparencia, setTransparencia] = useState<Transparencia | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(false)
    try {
      const [resCampanhas, resTransparencia] = await Promise.all([
        fetch('/api/public/campanhas'),
        fetch('/api/public/transparencia'),
      ])
      if (!resCampanhas.ok || !resTransparencia.ok) {
        setErro(true)
        return
      }
      setCampanhas(await resCampanhas.json())
      setTransparencia(await resTransparencia.json())
    } catch {
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return (
    <SiteShell>
      {/* Abertura */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--ant-sol-suave)' }}
        aria-labelledby="titulo-doe"
      >
        <Sol tamanho={260} className="ant-sol--girando" style={{ position: 'absolute', left: '-90px', top: '-110px' }} />
        <div
          className="mx-auto flex flex-col gap-4 px-4 py-12"
          style={{ maxWidth: 'var(--ant-largura-max)', position: 'relative' }}
        >
          <NotaManuscrita cor="azul" tamanho="var(--ant-mao-md)">
            Adote um focinho com carinho!
          </NotaManuscrita>
          <h1
            id="titulo-doe"
            style={{
              margin: 0,
              maxWidth: '18ch',
              fontFamily: 'var(--ant-fonte-titulo)',
              fontWeight: 800,
              fontSize: 'var(--ant-titulo-lg)',
              lineHeight: 'var(--ant-altura-titulo)',
              color: 'var(--ant-tinta)',
            }}
          >
            Seu apoio vira ração, vacina e um lar
          </h1>
          <p style={{ margin: 0, maxWidth: '54ch', color: 'var(--ant-tinta-suave)' }}>
            Cada item ajuda a pagar a dieta, a vacina e o tratamento de quem chegou agora. Doar é
            rápido e não precisa de cadastro.
          </p>
        </div>
      </section>

      {/* Pix e sócio contributor */}
      <section
        className="mx-auto grid grid-cols-1 gap-6 px-4 py-12 md:grid-cols-2"
        style={{ maxWidth: 'var(--ant-largura-max)' }}
        aria-label="Doar e ser sócio"
      >
        <div
          className="flex flex-col gap-4"
          style={{
            padding: 'var(--ant-esp-6)',
            borderRadius: 'var(--ant-raio-bloco)',
            background: 'var(--ant-branco)',
            boxShadow: 'var(--ant-sombra-md)',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--ant-fonte-titulo)',
              fontWeight: 800,
              fontSize: 'var(--ant-titulo-md)',
              lineHeight: 'var(--ant-altura-titulo)',
            }}
          >
            Doe por Pix
          </h2>
          <p style={{ margin: 0, color: 'var(--ant-tinta-suave)' }}>
            Copie a chave e pague pelo app do seu banco. A chave é o CNPJ da ONG.
          </p>
          <CopiarPix />
        </div>

        <div
          className="flex flex-col gap-4"
          style={{
            padding: 'var(--ant-esp-6)',
            borderRadius: 'var(--ant-raio-bloco)',
            background: 'var(--ant-branco)',
            boxShadow: 'var(--ant-sombra-md)',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--ant-fonte-titulo)',
              fontWeight: 800,
              fontSize: 'var(--ant-titulo-md)',
              lineHeight: 'var(--ant-altura-titulo)',
            }}
          >
            Seja sócio contribuinte
          </h2>
          <p style={{ margin: 0, color: 'var(--ant-tinta-suave)' }}>
            A partir de <strong>R$ 50,00 por mês</strong>. A receita da Amor Não Tem Raça vem
            exclusivamente de doações e sócios.
          </p>

          <ol className="flex flex-col gap-3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {PASSOS_SOCIO.map((passo) => (
              <li key={passo.numero} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full font-extrabold"
                  style={{ background: 'var(--ant-acao)', color: 'var(--ant-tinta)' }}
                >
                  {passo.numero}
                </span>
                <span className="flex flex-col gap-1">
                  <strong style={{ fontSize: 'var(--ant-texto-md)' }}>{passo.titulo}</strong>
                  <span style={{ color: 'var(--ant-tinta-suave)', fontSize: 'var(--ant-texto-sm)' }}>
                    {passo.texto}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap gap-3">
            <BotaoLink
              href={whatsappCom('Olá! Quero ser sócio contribuinte da Amor Não Tem Raça.')}
              variacao="azul"
              tamanho="grande"
            >
              Falar pelo WhatsApp
            </BotaoLink>
            <BotaoLink
              href={`mailto:${EMAIL}?subject=${encodeURIComponent('Quero ser sócio contribuinte')}`}
              variacao="contorno"
              tamanho="grande"
            >
              Enviar e-mail
            </BotaoLink>
          </div>
        </div>
      </section>

      {/* Campanhas e transparência */}
      {erro ? (
        <section className="mx-auto px-4 pb-12" style={{ maxWidth: 'var(--ant-largura-max)' }}>
          <EstadoErro
            titulo="Não conseguimos carregar as campanhas"
            mensagem="A conexão falhou. Tente de novo para ver os valores e as campanhas."
            onTentarDeNovo={carregar}
          />
        </section>
      ) : (
        <>
          {carregando ? (
            <section className="mx-auto px-4 pb-12" style={{ maxWidth: 'var(--ant-largura-max)' }}>
              <div className="flex flex-col gap-4" aria-hidden="true">
                <div className="ant-esqueleto" style={{ height: '180px', borderRadius: 'var(--ant-raio-bloco)' }} />
              </div>
            </section>
          ) : campanhas.length > 0 ? (
            <FaixaCampanhas campanhas={campanhas} />
          ) : null}

          <section
            className="mx-auto px-4 py-12"
            style={{ maxWidth: 'var(--ant-largura-max)' }}
            aria-labelledby="titulo-transparencia"
          >
            {carregando ? (
              <TransparenciaCarregando />
            ) : transparencia && transparencia.categorias.length > 0 ? (
              <BarrasTransparencia dados={transparencia} />
            ) : (
              <div className="flex flex-col gap-2">
                <h2
                  id="titulo-transparencia"
                  style={{
                    margin: 0,
                    fontFamily: 'var(--ant-fonte-titulo)',
                    fontWeight: 800,
                    fontSize: 'var(--ant-titulo-md)',
                    lineHeight: 'var(--ant-altura-titulo)',
                  }}
                >
                  Para onde vai cada real
                </h2>
                <p style={{ margin: 0, color: 'var(--ant-tinta-suave)' }}>
                  Ainda não há despesas registradas em {transparencia?.ano ?? new Date().getFullYear()}.
                  Volte em breve.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </SiteShell>
  )
}
