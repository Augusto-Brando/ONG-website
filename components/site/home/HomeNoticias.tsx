'use client'

import { useState } from 'react'
import type { News } from '@/lib/schema'
import NewsDetailModal from '@/components/news-detail-modal'
import { larguraMax, secao, subtitulo, textoCartao, tituloCartao, tituloSecao } from './ui'

const dataLonga = (valor: Date | string) =>
  new Date(valor).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

/**
 * Notícias (`#noticias`): três por linha, com o modal de detalhe que a home já usava.
 * O título é `<h3>` de verdade e a abertura do modal é um botão separado, com
 * `aria-label` que repete o título (nada de título achatado dentro do botão).
 */
export function HomeNoticias({ noticias }: { noticias: News[] }) {
  const [aberta, setAberta] = useState<News | null>(null)
  const publicadas = noticias.filter((n) => n.published).slice(0, 6)

  return (
    <section id="noticias" aria-labelledby="noticias-titulo" style={{ ...secao, background: 'var(--ant-creme)' }}>
      <div style={larguraMax}>
        <h2 id="noticias-titulo" style={tituloSecao}>
          Notícias do abrigo
        </h2>
        <p style={subtitulo}>Resgates, chegadas e novidades de quem já foi para casa.</p>

        {publicadas.length === 0 ? (
          <p style={{ ...textoCartao, fontSize: 'var(--ant-texto-md)' }}>
            As próximas novidades aparecem aqui. Enquanto isso, o Instagram tem o dia a dia da ONG.
          </p>
        ) : (
          <ul
            className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            style={{ listStyle: 'none', margin: 0, padding: 0, marginTop: 'var(--ant-esp-6)' }}
          >
            {publicadas.map((item) => (
              <li
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--ant-branco)',
                  borderRadius: 'var(--ant-raio-cartao)',
                  boxShadow: 'var(--ant-sombra-sm)',
                  overflow: 'hidden',
                }}
              >
                {item.coverImageUrl && (
                  <img
                    src={item.coverImageUrl}
                    alt=""
                    style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }}
                  />
                )}

                <div style={{ padding: 'var(--ant-esp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-2)', flex: 1 }}>
                  <span style={{ color: 'var(--ant-tinta-suave)', fontSize: 'var(--ant-texto-xs)', fontWeight: 800 }}>
                    <time dateTime={new Date(item.publishedAt).toISOString()}>{dataLonga(item.publishedAt)}</time>
                  </span>
                  <h3 style={tituloCartao}>{item.title}</h3>
                  {item.summary && <p style={textoCartao}>{item.summary}</p>}
                  <button
                    type="button"
                    onClick={() => setAberta(item)}
                    aria-label={`Ler a notícia: ${item.title}`}
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 'auto',
                      background: 'transparent',
                      border: 0,
                      padding: 0,
                      fontFamily: 'var(--ant-fonte-texto)',
                      fontWeight: 800,
                      fontSize: 'var(--ant-texto-sm)',
                      color: 'var(--ant-azul)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      minHeight: 'var(--ant-alvo-min)',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    Ler a notícia
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <NewsDetailModal item={aberta} open={Boolean(aberta)} onClose={() => setAberta(null)} />
    </section>
  )
}
