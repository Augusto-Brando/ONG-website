'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Dog } from '@/lib/schema'
import { LinkSeta } from '@/components/marca/Botao'
import { CartaoAnimal } from '@/components/marca/CartaoAnimal'
import { Carregando } from '@/components/marca/Carregando'
import { Chip } from '@/components/marca/Etiqueta'
import { EstadoErro } from '@/components/marca/EstadoErro'
import { EstadoVazio } from '@/components/marca/EstadoVazio'
import { larguraMax, secao, subtitulo, tituloSecao } from './ui'

type Filtro = 'todos' | 'cao' | 'gato'

/**
 * "Conheça quem quer ir para casa": chips de espécie, até quatro polaroides com link para
 * a página do animal, "Ver todos os animais" e, no celular, carrossel horizontal com encaixe.
 * Estados de carregando, vazio e erro desenhados.
 */
export function HomeAnimais() {
  const [animais, setAnimais] = useState<Dog[]>([])
  const [carregando, setCarregando] = useState(true)
  const [falhou, setFalhou] = useState(false)
  const [filtro, setFiltro] = useState<Filtro>('todos')

  const carregar = useCallback(async () => {
    setCarregando(true)
    setFalhou(false)
    try {
      const res = await fetch('/api/dogs')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setAnimais((await res.json()) as Dog[])
    } catch {
      setFalhou(true)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const visiveis = useMemo(() => {
    const porEspecie = filtro === 'todos' ? animais : animais.filter((a) => a.species === filtro)
    return porEspecie.slice(0, 4)
  }, [animais, filtro])

  const vazioDeFiltro = !carregando && !falhou && animais.length > 0 && visiveis.length === 0

  return (
    <section aria-labelledby="animais-titulo" style={{ ...secao, background: 'var(--ant-creme)' }}>
      <div style={larguraMax}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="animais-titulo" style={tituloSecao}>
              Conheça quem quer ir para casa
            </h2>
            <p style={subtitulo}>Cada um com o seu jeito. Todos procurando o mesmo carinho.</p>
          </div>
          <LinkSeta href="/animais">Ver todos os animais</LinkSeta>
        </div>

        <div
          role="group"
          aria-label="Filtrar por espécie"
          className="mt-5 flex flex-wrap gap-2"
          style={{ marginTop: 'var(--ant-esp-5)' }}
        >
          <Chip pressed={filtro === 'todos'} onClick={() => setFiltro('todos')}>
            Todos
          </Chip>
          <Chip pressed={filtro === 'cao'} onClick={() => setFiltro('cao')}>
            Cães
          </Chip>
          <Chip pressed={filtro === 'gato'} onClick={() => setFiltro('gato')}>
            Gatos
          </Chip>
        </div>

        <div style={{ marginTop: 'var(--ant-esp-5)' }}>
          {carregando ? (
            <Carregando cartoes={4} />
          ) : falhou ? (
            <EstadoErro
              titulo="Não conseguimos buscar os animais"
              mensagem="A conexão falhou. Os outros conteúdos da página continuam aqui."
              onTentarDeNovo={carregar}
            />
          ) : animais.length === 0 ? (
            <EstadoVazio
              titulo="Nenhum focinho na vitrine agora"
              descricao="Novos animais chegam toda semana. Fale com a equipe para saber quem está chegando."
            />
          ) : vazioDeFiltro ? (
            <EstadoVazio
              titulo="Nenhum focinho com esse filtro"
              descricao="Tente outro filtro. Novos animais chegam toda semana."
              acaoRotulo="Ver todos"
              onAcao={() => setFiltro('todos')}
            />
          ) : (
            <ul
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible md:pb-0"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {visiveis.map((animal, i) => (
                <li key={animal.id} className="w-3/4 shrink-0 snap-start sm:w-2/5 md:w-auto">
                  <CartaoAnimal animal={animal} indice={i} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
