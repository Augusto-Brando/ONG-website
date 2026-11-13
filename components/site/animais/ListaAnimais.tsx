'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { VStack, HStack } from '@astryxdesign/core/Stack'
import { BottomSheet } from '@astryxdesign/core/BottomSheet'
import { SlidersHorizontal, X } from 'lucide-react'
import type { Dog } from '@/lib/schema'
import { label } from '@/lib/format'
import { Botao } from '@/components/marca/Botao'
import { CartaoAnimal } from '@/components/marca/CartaoAnimal'
import { Carregando } from '@/components/marca/Carregando'
import { Chip } from '@/components/marca/Etiqueta'
import { EstadoErro } from '@/components/marca/EstadoErro'
import { EstadoVazio } from '@/components/marca/EstadoVazio'
import { NotaManuscrita } from '@/components/marca/NotaManuscrita'
import { Sol } from '@/components/marca/Sol'

const campos = ['especie', 'sexo', 'idade', 'castrado', 'vacinado'] as const
const campoClass = 'min-h-12 w-full rounded-(--ant-raio-campo) border-2 border-(--ant-areia) bg-(--ant-branco) px-3 text-(--ant-tinta)'

export function ListaAnimais() {
  const params = useSearchParams()
  const [animais, setAnimais] = useState<Dog[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const [aberto, setAberto] = useState(false)
  const [limite, setLimite] = useState(12)
  const ativos = campos.filter(c => params.get(c))

  function mudar(campo: string, valor: string) {
    const query = new URLSearchParams(params.toString())
    if (valor) query.set(campo, valor)
    else query.delete(campo)
    window.history.pushState(null, '', `/animais${query.size ? `?${query}` : ''}`)
    setLimite(12)
  }

  function limpar() {
    window.history.pushState(null, '', '/animais')
    setLimite(12)
  }

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(false)
    try {
      const res = await fetch('/api/dogs')
      if (!res.ok) throw new Error('Falha ao buscar animais')
      const dados: Dog[] = await res.json()
      setAnimais(dados.filter(a => a.available))
    } catch {
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { void carregar() }, [carregar])

  const filtrados = animais.filter(a =>
    (!params.get('especie') || a.species === params.get('especie')) &&
    (!params.get('sexo') || a.sex === params.get('sexo')) &&
    (!params.get('idade') || a.age === params.get('idade')) &&
    (!params.get('castrado') || a.castrated) &&
    (!params.get('vacinado') || a.vaccinated)
  ).sort((a, b) => params.get('ordem') === 'nome'
    ? a.name.localeCompare(b.name, 'pt-BR')
    : b.id - a.id)
  const visiveis = filtrados.slice(0, limite)
  const idades = [...new Set(animais.map(a => a.age))].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }))

  function especies() {
    return <HStack gap={2} wrap="wrap" aria-label="Filtrar por espécie">
      {[['', 'Todos'], ['cao', 'Cães'], ['gato', 'Gatos']].map(([valor, nome]) =>
        <Chip key={valor} pressed={(params.get('especie') || '') === valor} onClick={() => mudar('especie', valor)}>{nome}</Chip>
      )}
    </HStack>
  }

  function filtros(prefixo: string) {
    return <VStack gap={5}>
      <h2 className="text-2xl font-extrabold">Encontre seu companheiro</h2>
      <VStack gap={2}><p className="font-extrabold">Espécie</p>{especies()}</VStack>
      <VStack gap={2}>
        <label htmlFor={`${prefixo}-sexo`} className="font-extrabold">Sexo</label>
        <select id={`${prefixo}-sexo`} className={campoClass} value={params.get('sexo') || ''} onChange={e => mudar('sexo', e.target.value)}>
          <option value="">Todos</option>
          {['macho', 'femea', 'indefinido'].map(sexo => <option key={sexo} value={sexo}>{label(sexo)}</option>)}
        </select>
      </VStack>
      <VStack gap={2}>
        <label htmlFor={`${prefixo}-idade`} className="font-extrabold">Idade</label>
        <select id={`${prefixo}-idade`} className={campoClass} value={params.get('idade') || ''} onChange={e => mudar('idade', e.target.value)}>
          <option value="">Todas as idades</option>
          {idades.map(idade => <option key={idade}>{idade}</option>)}
        </select>
      </VStack>
      <fieldset>
        <legend className="mb-2 font-extrabold">Saúde</legend>
        {(['castrado', 'vacinado'] as const).map(campo => <label key={campo} htmlFor={`${prefixo}-${campo}`} className="flex min-h-12 cursor-pointer items-center gap-3">
          <input id={`${prefixo}-${campo}`} type="checkbox" className="size-5 accent-(--ant-azul)" checked={!!params.get(campo)} onChange={e => mudar(campo, e.target.checked ? 'sim' : '')} />
          {campo === 'castrado' ? 'Castrado' : 'Vacinado'}
        </label>)}
      </fieldset>
      <Botao variacao="contorno" onClick={limpar}>Limpar filtros</Botao>
    </VStack>
  }

  return <VStack gap={8} className="mx-auto w-full max-w-(--ant-largura-max) px-(--ant-gutter) py-10 md:py-18">
    <HStack gap={4} vAlign="center" hAlign="between">
      <VStack gap={2} className="min-w-0">
        <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">Animais para adoção</h1>
        <NotaManuscrita cor="azul">{carregando ? 'Procurando os focinhos…' : erro ? 'Um lar começa com um encontro.' : `${animais.length} focinhos esperando por você`}</NotaManuscrita>
      </VStack>
      <Sol tamanho="var(--ant-esp-9)" className="hidden shrink-0 sm:block" />
    </HStack>
    <HStack gap={8} vAlign="start" className="min-w-0">
      <VStack as="aside" className="hidden w-70 shrink-0 rounded-(--ant-raio-cartao) bg-(--ant-sol-suave) p-6 lg:flex" aria-label="Filtros de animais">{filtros('desktop')}</VStack>
      <VStack gap={5} className="min-w-0 flex-1">
        <VStack gap={3} className="lg:hidden">
          {especies()}
          <Botao variacao="contorno" onClick={() => setAberto(true)} aria-expanded={aberto}><SlidersHorizontal aria-hidden="true" size={20} />Filtros ({ativos.length})</Botao>
        </VStack>
        <HStack gap={3} wrap="wrap" hAlign="between" vAlign="center">
          <p role="status">{carregando ? 'Procurando os focinhos…' : erro ? 'Seus filtros foram mantidos.' : `Mostrando ${visiveis.length} de ${filtrados.length}`}</p>
          <HStack gap={2} vAlign="center">
            <label htmlFor="ordem" className="font-extrabold">Ordenar</label>
            <select id="ordem" className={campoClass} value={params.get('ordem') || 'recentes'} onChange={e => mudar('ordem', e.target.value === 'recentes' ? '' : e.target.value)}>
              <option value="recentes">Mais recentes</option><option value="nome">Nome de A a Z</option>
            </select>
          </HStack>
        </HStack>
        {ativos.length > 0 && <HStack gap={2} wrap="wrap" aria-label="Filtros aplicados">
          {ativos.map(campo => <Chip key={campo} tom="atributo" pressed onClick={() => mudar(campo, '')}>
            {campo === 'castrado' ? 'Castrado' : campo === 'vacinado' ? 'Vacinado' : label(params.get(campo))}<X size={16} aria-hidden="true" />
          </Chip>)}
        </HStack>}
        {carregando ? <Carregando cartoes={6} /> : erro ? <EstadoErro titulo="Não conseguimos buscar os animais" mensagem="A conexão falhou. Seus filtros foram mantidos." onTentarDeNovo={carregar} /> : !filtrados.length ? <EstadoVazio onAcao={limpar} /> : <>
          <VStack as="ul" gap={4} className="grid list-none grid-cols-2 gap-y-8 py-3 xl:grid-cols-3">
            {visiveis.map((animal, i) => <li key={animal.id} className="min-w-0"><CartaoAnimal animal={animal} indice={i} /></li>)}
          </VStack>
          {visiveis.length < filtrados.length && <Botao variacao="contorno" onClick={() => setLimite(n => n + 12)}>Mostrar mais animais</Botao>}
        </>}
      </VStack>
    </HStack>
    <BottomSheet isOpen={aberto} onOpenChange={setAberto} label="Filtros de animais" height="tall">
      <VStack gap={5}>{filtros('celular')}<Botao variacao="azul" onClick={() => setAberto(false)}>Ver animais</Botao></VStack>
    </BottomSheet>
  </VStack>
}
