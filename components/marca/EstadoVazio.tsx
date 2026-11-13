'use client'

import { Botao } from './Botao'
import { NotaManuscrita } from './NotaManuscrita'
import { Pata } from './Pata'
import { Sol } from './Sol'
import { whatsappCom, WHATSAPP_LINK } from './contato'

/**
 * Estado vazio: sol pequeno com pata branca, título, frase de ajuda, ação principal
 * e saída pelo WhatsApp. Nunca culpa o usuário.
 */
export function EstadoVazio({
  titulo = 'Nenhum focinho com esses filtros',
  descricao = 'Tente tirar um filtro. Novos animais chegam toda semana.',
  acaoRotulo = 'Limpar filtros',
  onAcao,
  nota = 'Quer avisar a equipe?',
}: {
  titulo?: string
  descricao?: string
  acaoRotulo?: string
  onAcao?: () => void
  nota?: string
}) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--ant-esp-4)',
        textAlign: 'center',
        padding: 'var(--ant-esp-8) var(--ant-esp-5)',
        background: 'var(--ant-sol-suave)',
        borderRadius: 'var(--ant-raio-bloco)',
      }}
    >
      <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Sol tamanho={140} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Pata cor="var(--ant-branco)" tamanho={52} />
        </div>
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: 'var(--ant-fonte-titulo)',
          fontWeight: 800,
          fontSize: 'var(--ant-titulo-sm)',
          color: 'var(--ant-tinta)',
        }}
      >
        {titulo}
      </h2>
      <p style={{ margin: 0, maxWidth: '46ch', color: 'var(--ant-tinta-suave)' }}>{descricao}</p>
      {onAcao && (
        <Botao variacao="acao" tamanho="grande" onClick={onAcao}>
          {acaoRotulo}
        </Botao>
      )}
      <NotaManuscrita as="p" tamanho="var(--ant-mao-md)">
        {nota}{' '}
        <a href={whatsappCom('Oi! Quero falar com a equipe da ONG.')} style={{ color: 'var(--ant-azul)' }}>
          Chame no WhatsApp
        </a>
      </NotaManuscrita>
      <span className="sr-only">Também é possível falar com a equipe em {WHATSAPP_LINK}</span>
    </section>
  )
}
