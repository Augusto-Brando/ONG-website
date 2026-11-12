'use client'

import { Botao } from './Botao'
import { whatsappCom } from './contato'

function IconeAlerta() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--ant-erro-texto-forte)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 3 2 21h20L12 3z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </svg>
  )
}

/**
 * Estado de erro: ícone em círculo pêssego, título, frase com `role="alert"` dizendo o que foi
 * mantido, botão azul "Tentar de novo" e saída pelo WhatsApp. Erro nunca só por cor.
 */
export function EstadoErro({
  titulo = 'Não conseguimos buscar os animais',
  mensagem = 'A conexão falhou. Seus filtros foram mantidos.',
  onTentarDeNovo,
  rotuloBotao = 'Tentar de novo',
}: {
  titulo?: string
  mensagem?: string
  onTentarDeNovo?: () => void
  rotuloBotao?: string
}) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--ant-esp-4)',
        textAlign: 'center',
        padding: 'var(--ant-esp-7) var(--ant-esp-5)',
        background: 'var(--ant-erro-fundo)',
        borderRadius: 'var(--ant-raio-cartao)',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: 'var(--ant-raio-pilula)',
          background: 'var(--ant-pessego)',
        }}
      >
        <IconeAlerta />
      </span>
      <h2
        style={{
          margin: 0,
          fontFamily: 'var(--ant-fonte-titulo)',
          fontWeight: 800,
          fontSize: 'var(--ant-titulo-sm)',
          color: 'var(--ant-erro-texto-forte)',
        }}
      >
        {titulo}
      </h2>
      <p role="alert" style={{ margin: 0, maxWidth: '46ch', color: 'var(--ant-erro-texto-forte)' }}>
        {mensagem}
      </p>
      {onTentarDeNovo && (
        <Botao variacao="azul" tamanho="grande" onClick={onTentarDeNovo}>
          {rotuloBotao}
        </Botao>
      )}
      <a
        href={whatsappCom('Oi! O site deu erro ao buscar os animais e queria ajuda.')}
        style={{ color: 'var(--ant-azul)', fontWeight: 800 }}
      >
        Falar com a equipe no WhatsApp
      </a>
    </section>
  )
}
