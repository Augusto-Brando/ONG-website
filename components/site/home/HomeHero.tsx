'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Dog } from '@/lib/schema'
import { BotaoLink } from '@/components/marca/Botao'
import { NotaManuscrita } from '@/components/marca/NotaManuscrita'
import { Pata } from '@/components/marca/Pata'
import { Sol } from '@/components/marca/Sol'
import { larguraMax } from './ui'

/** Primeira frase da descrição, em minúsculas, como nota de personalidade. */
function personalidade(animal: Dog): string {
  const texto = (animal.description ?? '').trim()
  if (!texto) return ''
  const frase = texto.split(/[.!?\n]/)[0]?.trim() ?? ''
  const curta = frase.length > 62 ? `${frase.slice(0, 59).trimEnd()}…` : frase
  return curta.toLowerCase()
}

/**
 * Hero da home: slogan em Caveat, título com "lar" em azul e os dois apelos
 * (laranja "Quero adotar", contorno "Quero ajudar"). À direita, sol grande com a foto
 * de um animal real da API dentro de uma moldura orgânica e um adesivo inclinado com
 * nome, idade e personalidade. No celular a foto vem primeiro.
 */
export function HomeHero() {
  const [destaque, setDestaque] = useState<Dog | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [falhou, setFalhou] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setFalhou(false)
    try {
      const res = await fetch('/api/dogs')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const animais = (await res.json()) as Dog[]
      const comFoto = animais.find((a) => Boolean(a.imageUrl || a.images?.[0]))
      setDestaque(comFoto ?? animais[0] ?? null)
    } catch {
      setFalhou(true)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const foto = destaque ? destaque.imageUrl || destaque.images?.[0] || '' : ''
  const nota = destaque ? personalidade(destaque) : ''
  const adesivo = destaque ? `${destaque.name}, ${destaque.age}${nota ? ` · ${nota}` : ''}` : ''

  return (
    <section aria-labelledby="hero-titulo" style={{ position: 'relative', overflow: 'hidden' }}>
      <div
        style={larguraMax}
        className="grid items-center gap-8 pt-6 pb-16 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-10 md:pt-10 md:pb-24"
      >
        {/* Visual: primeiro no celular */}
        <div className="order-1 md:order-2" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              position: 'relative',
              width: 'min(100%, 420px)',
              aspectRatio: '1 / 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sol
              tamanho="min(96%, 400px)"
              girando
              style={{ position: 'absolute', inset: 0, margin: 'auto' }}
            />

            <div
              style={{
                position: 'relative',
                width: '78%',
                height: '78%',
                overflow: 'hidden',
                borderRadius: '48% 52% 46% 54% / 52% 46% 54% 48%',
                background: 'var(--ant-foto-1)',
                boxShadow: 'var(--ant-sombra-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {carregando ? (
                <span
                  className="ant-esqueleto"
                  aria-hidden="true"
                  style={{ position: 'absolute', inset: 0 }}
                />
              ) : foto ? (
                <img
                  src={foto}
                  alt={`${destaque?.name}, ${destaque?.breed ?? 'animal'} para adoção`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: '50% 22%',
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--ant-esp-1)',
                    color: 'var(--ant-cacau)',
                  }}
                >
                  <Pata tamanho={48} cor="var(--ant-cacau)" />
                  <span style={{ fontWeight: 800, fontSize: 'var(--ant-texto-xs)' }}>foto em breve</span>
                </div>
              )}
            </div>

            {destaque && (
              <div
                style={{
                  position: 'absolute',
                  left: '-4px',
                  bottom: '10%',
                  maxWidth: '78%',
                  padding: 'var(--ant-esp-2) var(--ant-esp-3)',
                  background: 'var(--ant-branco)',
                  borderRadius: 'var(--ant-raio-campo)',
                  boxShadow: 'var(--ant-sombra-md)',
                  transform: 'rotate(-3deg)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '18px',
                    width: '58px',
                    height: '18px',
                    background: 'var(--ant-sol)',
                    opacity: 0.9,
                    transform: 'rotate(-2deg)',
                    borderRadius: '2px',
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--ant-fonte-mao)',
                    fontWeight: 600,
                    fontSize: 'var(--ant-mao-md)',
                    lineHeight: 1.1,
                    color: 'var(--ant-laranja-texto)',
                  }}
                >
                  {adesivo}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Texto */}
        <div className="order-2 md:order-1">
          <NotaManuscrita cor="azul" tamanho="clamp(var(--ant-mao-md), 4vw, var(--ant-titulo-md))">
            adote um focinho com carinho!
          </NotaManuscrita>

          <h1
            id="hero-titulo"
            style={{
              margin: 'var(--ant-esp-2) 0 0',
              fontFamily: 'var(--ant-fonte-titulo)',
              fontWeight: 800,
              fontSize: 'var(--ant-titulo-xl)',
              lineHeight: 0.92,
              color: 'var(--ant-tinta)',
              textWrap: 'balance',
            }}
          >
            Todo focinho merece um <span style={{ color: 'var(--ant-azul)' }}>lar</span>.
          </h1>

          <p
            style={{
              margin: 'var(--ant-esp-4) 0 0',
              maxWidth: '52ch',
              color: 'var(--ant-tinta-suave)',
              fontSize: 'var(--ant-texto-lg)',
              lineHeight: 1.5,
            }}
          >
            Somos uma ONG de bairro em Juiz de Fora. Resgatamos, cuidamos e procuramos a casa certa para cada
            animal. Toda adoção inclui vacinação, microchip, castração e um mês de acompanhamento.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row" style={{ marginTop: 'var(--ant-esp-5)' }}>
            <BotaoLink href="/animais" variacao="acao" tamanho="grande">
              Quero adotar
            </BotaoLink>
            <BotaoLink href="/doe" variacao="contorno" tamanho="grande">
              Quero ajudar
            </BotaoLink>
          </div>

          {falhou && (
            <p style={{ margin: 'var(--ant-esp-3) 0 0', color: 'var(--ant-erro)', fontSize: 'var(--ant-texto-sm)', fontWeight: 800 }}>
              A foto do destaque não carregou agora.{' '}
              <button
                type="button"
                onClick={carregar}
                style={{
                  background: 'transparent',
                  border: 0,
                  padding: 0,
                  font: 'inherit',
                  color: 'var(--ant-azul)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Tentar de novo
              </button>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
