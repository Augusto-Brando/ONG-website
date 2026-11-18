'use client'

// Assistente de etapas do pedido de adoção: 4 passos (seus dados, moradia e
// rotina, mensagem, consentimento e revisão), envio para /api/public/adoption
// e confirmação no fim. Sem login.
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dog } from '@/lib/schema'
import { Botao, BotaoLink } from '@/components/marca/Botao'
import { NotaManuscrita } from '@/components/marca/NotaManuscrita'
import { Sol } from '@/components/marca/Sol'
import { CampoTexto, ErroCampo, OpcaoCartao } from './Campos'
import { PolarodeMini } from './PolarodeMini'

const ETAPAS = [
  { numero: 1, titulo: 'Seus dados', resumo: 'Como a gente te chama' },
  { numero: 2, titulo: 'Moradia e rotina', resumo: 'Para o focinho se adapted' },
  { numero: 3, titulo: 'Mensagem', resumo: 'Conta tudo que quiser' },
  { numero: 4, titulo: 'Consentimento e revisão', resumo: 'Últimos ajustes' },
] as const

const MORADIAS = [
  { valor: 'casa', titulo: 'Casa', descricao: 'Com quintal ou jardim' },
  { valor: 'apartamento', titulo: 'Apartamento', descricao: 'Com ou sem varanda' },
  { valor: 'sitio', titulo: 'Sítio ou chácara', descricao: 'Espaço para toda parte' },
  { valor: 'outro', titulo: 'Outro', descricao: 'Conte pra gente depois' },
]

type Dados = {
  name: string
  phone: string
  email: string
  city: string
  housingType: string
  hasOtherPets: '' | 'sim' | 'nao'
  message: string
  consentLgpd: boolean
  website: string
}

const VAZIO: Dados = {
  name: '',
  phone: '',
  email: '',
  city: '',
  housingType: '',
  hasOtherPets: '',
  message: '',
  consentLgpd: false,
  website: '',
}

export function AssistenteAdocao({ animalId = null }: { animalId?: number | null }) {
  const [passo, setPasso] = useState(1)
  const [dados, setDados] = useState<Dados>(VAZIO)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [animal, setAnimal] = useState<Dog | null>(null)

  const tituloRef = useRef<HTMLHeadingElement>(null)

  const atualizar = useCallback((campo: keyof Dados, valor: string | boolean) => {
    setDados((prev) => ({ ...prev, [campo]: valor }))
  }, [])

  // Animal escolhido (vem da URL /adotar?animal=id).
  useEffect(() => {
    if (!animalId) return
    let cancelado = false
    fetch('/api/dogs')
      .then((res) => (res.ok ? res.json() : []))
      .then((lista: Dog[]) => {
        if (cancelado) return
        const achado = Array.isArray(lista) ? lista.find((d) => d.id === animalId) : undefined
        if (achado) setAnimal(achado)
      })
      .catch(() => undefined)
    return () => {
      cancelado = true
    }
  }, [animalId])

  // Foco no título da etapa quando ela muda.
  useEffect(() => {
    tituloRef.current?.focus()
  }, [passo, enviado])

  function validar(atual: number): Record<string, string> {
    const achados: Record<string, string> = {}
    if (atual === 1) {
      if (dados.name.trim().length < 2) achados.name = 'Conte seu nome para a equipe poder chamar você.'
      if (dados.phone.trim().length < 8) achados.phone = 'Precisamos do seu WhatsApp para a entrevista.'
      if (dados.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {
        achados.email = 'Confira o e-mail: parece faltar alguma coisa.'
      }
    }
    if (atual === 2) {
      if (!dados.housingType) achados.housingType = 'Escolha o tipo de moradia.'
      if (!dados.hasOtherPets) achados.hasOtherPets = 'Conte se já tem outros animais em casa.'
    }
    if (atual === 4 && !dados.consentLgpd) {
      achados.consentLgpd = 'Marque a autorização para enviar o pedido.'
    }
    return achados
  }

  function focarPrimeiroErro(achados: Record<string, string>) {
    const primeiro = Object.keys(achados)[0]
    if (!primeiro) return
    const elemento = document.getElementById(primeiro)
    if (elemento instanceof HTMLElement) {
      elemento.focus()
      return
    }
    tituloRef.current?.focus()
  }

  function avancar() {
    const achados = validar(passo)
    setErros(achados)
    if (Object.keys(achados).length > 0) {
      focarPrimeiroErro(achados)
      return
    }
    if (passo < 4) {
      setPasso(passo + 1)
      return
    }
    enviar()
  }

  function voltar() {
    if (passo > 1) {
      setErros({})
      setPasso(passo - 1)
    }
  }

  async function enviar() {
    setEnviando(true)
    setErroGeral(null)
    try {
      const res = await fetch('/api/public/adoption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dados.name.trim(),
          phone: dados.phone.trim(),
          email: dados.email.trim(),
          city: dados.city.trim(),
          housingType: dados.housingType,
          hasOtherPets: dados.hasOtherPets === '' ? null : dados.hasOtherPets === 'sim',
          animalId: animalId ?? null,
          message: dados.message.trim(),
          consentLgpd: dados.consentLgpd,
          website: dados.website,
        }),
      })

      if (res.status === 201 || res.status === 200) {
        setEnviado(true)
        return
      }

      const corpo = await res.json().catch(() => ({}))
      if (corpo?.issues && typeof corpo.issues === 'object') {
        const porCampo: Record<string, string> = {}
        for (const [campo, lista] of Object.entries(corpo.issues as Record<string, string[]>)) {
          if (Array.isArray(lista) && lista.length > 0) porCampo[campo] = lista[0]
        }
        setErros(porCampo)
        setErroGeral('Revise os campos marcados e tente de novo.')
        focarPrimeiroErro(porCampo)
        return
      }

      const mensagem =
        res.status === 429
          ? 'Muitas solicitações em pouco tempo. Tente novamente mais tarde.'
          : 'Não foi possível enviar agora. Seus dados foram mantidos. Tente de novo ou chame a equipe no WhatsApp.'
      setErroGeral(mensagem)
    } catch {
      setErroGeral('Não foi possível enviar agora. A conexão falhou. Seus dados foram mantidos.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <section
        role="status"
        className="mx-auto flex flex-col items-center gap-4 px-4 py-12 text-center"
        style={{ maxWidth: '640px' }}
      >
        <Sol tamanho={160} girando />
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--ant-fonte-titulo)',
            fontWeight: 800,
            fontSize: 'var(--ant-titulo-lg)',
            lineHeight: 'var(--ant-altura-titulo)',
          }}
        >
          Pedido enviado!
        </h1>
        <NotaManuscrita cor="azul" tamanho="var(--ant-mao-md)">
          {animal ? `O ${animal.name} já está sabendo.` : 'Já estamos avisando a equipe.'}
        </NotaManuscrita>
        <p style={{ margin: 0, maxWidth: '46ch', color: 'var(--ant-tinta-suave)' }}>
          Recebemos seus dados. A equipe entra em contato pelo WhatsApp informado e combina os
          próximos passos com você.
        </p>

        <div
          className="flex w-full flex-col gap-2"
          style={{
            maxWidth: '460px',
            padding: 'var(--ant-esp-5)',
            borderRadius: 'var(--ant-raio-cartao)',
            background: 'var(--ant-sol-suave)',
            textAlign: 'left',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--ant-fonte-titulo)',
              fontWeight: 800,
              fontSize: 'var(--ant-titulo-sm)',
            }}
          >
            Próximos passos
          </h2>
          <ol className="flex flex-col gap-1" style={{ margin: 0, paddingLeft: '20px' }}>
            <li>
              <strong>Triagem.</strong> A equipe olha seu pedido e o perfil do focinho.
            </li>
            <li>
              <strong>Conversa.</strong> Te chamamos no WhatsApp para entender sua rotina.
            </li>
            <li>
              <strong>Visita.</strong> Marcamos o encontro para você conhecer o animal.
            </li>
          </ol>
        </div>

        <BotaoLink href="/animais" variacao="acao" tamanho="grande">
          Ver outros animais
        </BotaoLink>
      </section>
    )
  }

  const etapa = ETAPAS[passo - 1]

  return (
    <div
      className="mx-auto grid grid-cols-1 gap-8 px-4 py-8 md:grid-cols-[minmax(0,1fr)_220px] md:gap-10"
      style={{ maxWidth: 'var(--ant-largura-max)' }}
    >
      {/* Coluna do animal pedido: no celular fica no topo. */}
      {animal ? (
        <aside
          className="order-1 md:order-2"
          style={{ display: 'flex', justifyContent: 'center' }}
          aria-label="Animal escolhido"
        >
          <PolarodeMini animal={animal} />
        </aside>
      ) : null}

      <div className="order-2 flex flex-col gap-6 md:order-1">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: 'var(--ant-texto-sm)',
                color: 'var(--ant-azul)',
              }}
            >
              Passo {passo} de {ETAPAS.length}
            </p>
            <NotaManuscrita tamanho="var(--ant-mao-md)">Leva uns 3 minutos</NotaManuscrita>
          </div>

          <div className="flex gap-2" role="img" aria-label={`Passo ${passo} de ${ETAPAS.length}`}>
            {ETAPAS.map((item, indice) => (
              <span
                key={item.numero}
                aria-hidden="true"
                style={{
                  height: '10px',
                  flex: 1,
                  borderRadius: 'var(--ant-raio-pilula)',
                  background: indice < passo ? 'var(--ant-azul)' : 'var(--ant-areia)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1
            ref={tituloRef}
            tabIndex={-1}
            style={{
              margin: 0,
              fontFamily: 'var(--ant-fonte-titulo)',
              fontWeight: 800,
              fontSize: 'var(--ant-titulo-md)',
              lineHeight: 'var(--ant-altura-titulo)',
              color: 'var(--ant-tinta)',
              // O foco vai para o título para o leitor de tela; o contorno ficaria
              // visualmente confuso num título que não é interativo.
              outline: 'none',
            }}
          >
            {etapa.titulo}
          </h1>
          <p style={{ margin: 0, color: 'var(--ant-tinta-suave)' }}>{etapa.resumo}</p>
        </div>

        <div
          className="flex flex-col gap-5"
          style={{
            padding: 'var(--ant-esp-5)',
            borderRadius: 'var(--ant-raio-cartao)',
            background: 'var(--ant-branco)',
            boxShadow: 'var(--ant-sombra-sm)',
          }}
        >
          {passo === 1 ? (
            <>
              <CampoTexto
                id="name"
                rotulo="Nome completo"
                valor={dados.name}
                onChange={(v) => atualizar('name', v)}
                autoComplete="name"
                obrigatorio
                maxLength={120}
                erro={erros.name}
              />
              <CampoTexto
                id="phone"
                rotulo="Telefone / WhatsApp"
                tipo="tel"
                valor={dados.phone}
                onChange={(v) => atualizar('phone', v)}
                autoComplete="tel"
                placeholder="(32) 99999-0000"
                obrigatorio
                maxLength={30}
                erro={erros.phone}
              />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <CampoTexto
                  id="email"
                  rotulo="E-mail"
                  tipo="email"
                  valor={dados.email}
                  onChange={(v) => atualizar('email', v)}
                  autoComplete="email"
                  ajuda="Opcional. A gente usa para mandar o resumo do pedido."
                  maxLength={120}
                  erro={erros.email}
                />
                <CampoTexto
                  id="city"
                  rotulo="Cidade"
                  valor={dados.city}
                  onChange={(v) => atualizar('city', v)}
                  autoComplete="address-level2"
                  placeholder="Juiz de Fora/MG"
                  maxLength={120}
                  erro={erros.city}
                />
              </div>
            </>
          ) : null}

          {passo === 2 ? (
            <>
              <fieldset className="flex flex-col gap-3" style={{ border: 0, margin: 0, padding: 0 }}>
                <legend style={{ fontWeight: 800, fontSize: 'var(--ant-texto-sm)', padding: 0 }}>
                  Tipo de moradia <span aria-hidden="true">*</span>
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {MORADIAS.map((opcao) => (
                    <OpcaoCartao
                      key={opcao.valor}
                      name="housingType"
                      value={opcao.valor}
                      selecionada={dados.housingType === opcao.valor}
                      onSelect={(v) => atualizar('housingType', v)}
                      titulo={opcao.titulo}
                      descricao={opcao.descricao}
                    />
                  ))}
                </div>
                {erros.housingType ? <ErroCampo id="housingType-erro">{erros.housingType}</ErroCampo> : null}
              </fieldset>

              <fieldset className="flex flex-col gap-3" style={{ border: 0, margin: 0, padding: 0 }}>
                <legend style={{ fontWeight: 800, fontSize: 'var(--ant-texto-sm)', padding: 0 }}>
                  Tem outros animais em casa? <span aria-hidden="true">*</span>
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <OpcaoCartao
                    name="hasOtherPets"
                    value="sim"
                    selecionada={dados.hasOtherPets === 'sim'}
                    onSelect={(v) => atualizar('hasOtherPets', v)}
                    titulo="Sim"
                    descricao="Eles convivem bem com novos amigos."
                  />
                  <OpcaoCartao
                    name="hasOtherPets"
                    value="nao"
                    selecionada={dados.hasOtherPets === 'nao'}
                    onSelect={(v) => atualizar('hasOtherPets', v)}
                    titulo="Não"
                    descricao="Será o primeiro da casa."
                  />
                </div>
                {erros.hasOtherPets ? (
                  <ErroCampo id="hasOtherPets-erro">{erros.hasOtherPets}</ErroCampo>
                ) : null}
              </fieldset>
            </>
          ) : null}

          {passo === 3 ? (
            <>
              <CampoTexto
                id="message"
                rotulo="Mensagem"
                valor={dados.message}
                onChange={(v) => atualizar('message', v)}
                linhas={6}
                maxLength={2000}
                ajuda="Opcional. Conte como é sua rotina e por que quer adotar."
                erro={erros.message}
              />
              <p style={{ margin: 0, color: 'var(--ant-tinta-suave)', fontSize: 'var(--ant-texto-sm)' }}>
                Se você já pensou em um nome para o novo morador, pode colocar aqui. A gente conversa
                na etapa seguinte.
              </p>
            </>
          ) : null}

          {passo === 4 ? (
            <>
              <div className="flex flex-col gap-3">
                <label
                  htmlFor="consentLgpd"
                  className="flex cursor-pointer items-start gap-3"
                  style={{
                    padding: 'var(--ant-esp-4)',
                    borderRadius: 'var(--ant-raio-campo)',
                    border: `2px solid ${erros.consentLgpd ? 'var(--ant-erro)' : 'var(--ant-areia-forte)'}`,
                    background: 'var(--ant-creme)',
                  }}
                >
                  <input
                    id="consentLgpd"
                    name="consentLgpd"
                    type="checkbox"
                    checked={dados.consentLgpd}
                    onChange={(e) => atualizar('consentLgpd', e.target.checked)}
                    className="peer sr-only"
                    aria-describedby="consentLgpd-ajuda"
                    aria-invalid={erros.consentLgpd ? true : undefined}
                  />
                  <span
                    aria-hidden="true"
                    className="peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ant-azul)] mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border-2"
                    style={{
                      borderColor: dados.consentLgpd ? 'var(--ant-azul)' : 'var(--ant-areia-forte)',
                      background: dados.consentLgpd ? 'var(--ant-azul)' : 'var(--ant-branco)',
                    }}
                  >
                    {dados.consentLgpd ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--ant-branco)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12l5 5 9-10" />
                      </svg>
                    ) : null}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span style={{ fontWeight: 800, fontSize: 'var(--ant-texto-md)' }}>
                      Autorizo a ONG Amor Não Tem Raça a tratar meus dados para esse fim.
                    </span>
                    <span id="consentLgpd-ajuda" style={{ fontSize: 'var(--ant-texto-xs)', color: 'var(--ant-tinta-suave)' }}>
                      Seus dados não são compartilhados e podem ser apagados a qualquer momento a
                      pedido (LGPD).
                    </span>
                  </span>
                </label>
                {erros.consentLgpd ? (
                  <ErroCampo id="consentLgpd-erro">{erros.consentLgpd}</ErroCampo>
                ) : null}
              </div>

              <div
                className="flex flex-col gap-2"
                style={{
                  padding: 'var(--ant-esp-4)',
                  borderRadius: 'var(--ant-raio-campo)',
                  background: 'var(--ant-sol-suave)',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontFamily: 'var(--ant-fonte-titulo)',
                    fontWeight: 800,
                    fontSize: 'var(--ant-titulo-sm)',
                  }}
                >
                  Revise antes de enviar
                </h2>
                <dl className="flex flex-col gap-1" style={{ margin: 0, fontSize: 'var(--ant-texto-sm)' }}>
                  <div>
                    <dt style={{ fontWeight: 800 }}>Nome</dt>
                    <dd style={{ margin: 0 }}>{dados.name || '—'}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 800 }}>WhatsApp</dt>
                    <dd style={{ margin: 0 }}>{dados.phone || '—'}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 800 }}>E-mail</dt>
                    <dd style={{ margin: 0 }}>{dados.email || '—'}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 800 }}>Cidade</dt>
                    <dd style={{ margin: 0 }}>{dados.city || '—'}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 800 }}>Moradia</dt>
                    <dd style={{ margin: 0 }}>
                      {MORADIAS.find((m) => m.valor === dados.housingType)?.titulo ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 800 }}>Outros animais</dt>
                    <dd style={{ margin: 0 }}>
                      {dados.hasOtherPets === 'sim' ? 'Sim' : dados.hasOtherPets === 'nao' ? 'Não' : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 800 }}>Mensagem</dt>
                    <dd style={{ margin: 0 }}>{dados.message || '—'}</dd>
                  </div>
                </dl>
              </div>
            </>
          ) : null}

          {/* Honeypot anti-spam: invisível e fora da ordem de tabulação. */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Não preencha este campo</label>
            <input
              id="website"
              name="website"
              value={dados.website}
              onChange={(e) => atualizar('website', e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
        </div>

        {erroGeral ? (
          <div
            role="alert"
            className="flex items-start gap-2"
            style={{
              padding: 'var(--ant-esp-4)',
              borderRadius: 'var(--ant-raio-campo)',
              background: 'var(--ant-erro-fundo)',
              color: 'var(--ant-erro-texto-forte)',
              fontWeight: 700,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ant-erro-texto-forte)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
              style={{ flex: 'none', marginTop: '2px' }}
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" />
              <path d="M12 16h.01" />
            </svg>
            <span>{erroGeral}</span>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {passo > 1 ? (
            <Botao variacao="contorno" onClick={voltar}>
              Voltar
            </Botao>
          ) : null}

          <Botao
            variacao="acao"
            tamanho="grande"
            carregando={enviando}
            rotuloCarregando="Enviando…"
            onClick={avancar}
          >
            {passo === 4 ? 'Enviar pedido' : 'Continuar'}
          </Botao>
        </div>
      </div>
    </div>
  )
}
