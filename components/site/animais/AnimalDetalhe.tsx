'use client'

import { useState } from 'react'
import Link from 'next/link'
import { VStack, HStack } from '@astryxdesign/core/Stack'
import { AlertTriangle, ArrowLeft, MessageCircle, Share2 } from 'lucide-react'
import type { Dog } from '@/lib/schema'
import { label } from '@/lib/format'
import { SiteShell } from '@/components/site/SiteShell'
import { Botao, BotaoLink } from '@/components/marca/Botao'
import { CartaoAnimal } from '@/components/marca/CartaoAnimal'
import { Fita } from '@/components/marca/Fita'
import { NotaManuscrita } from '@/components/marca/NotaManuscrita'
import { Pata } from '@/components/marca/Pata'
import { whatsappCom } from '@/components/marca/contato'

type AnimalPublico = Pick<Dog, 'id' | 'name' | 'species' | 'breed' | 'age' | 'weight' | 'sex' | 'castrated' | 'vaccinated' | 'description' | 'imageUrl' | 'images'>

export function AnimalDetalhe({ animal, parecidos }: { animal: AnimalPublico; parecidos: Dog[] }) {
  const fotos = [...new Set([animal.imageUrl, ...(animal.images || [])].filter(Boolean))]
  const [foto, setFoto] = useState(fotos[0] || '')
  const [compartilhado, setCompartilhado] = useState('')
  const [falhaCompartilhar, setFalhaCompartilhar] = useState(false)
  const [fotoFalhou, setFotoFalhou] = useState(false)
  const adotar = `/adotar?animal=${animal.id}`
  const whatsapp = whatsappCom(`Oi! Quero saber mais sobre ${animal.name} e como funciona a adoção. Animal: ${animal.id}.`)
  const ficha = [
    ['Idade', animal.age], ['Peso', animal.weight ? `${animal.weight.replace(/\s*kg$/i, '')} kg` : 'A confirmar'],
    ['Sexo', label(animal.sex)], ['Castração', animal.castrated ? 'Castrado' : 'A confirmar com a equipe'],
    ['Vacinação', animal.vaccinated ? 'Vacinado' : 'A confirmar com a equipe'],
  ]

  async function compartilhar() {
    setFalhaCompartilhar(false)
    try {
      const url = window.location.href
      const nativo = typeof navigator.share === 'function'
      if (nativo) await navigator.share({ title: `Conheça ${animal.name}`, text: `Um lar para ${animal.name}!`, url })
      else await navigator.clipboard.writeText(url)
      setCompartilhado(nativo ? 'Obrigado por apresentar esse focinho!' : 'Link copiado! Apresente esse focinho a alguém.')
    } catch (erro) {
      if (erro instanceof Error && erro.name === 'AbortError') return
      setFalhaCompartilhar(true)
      setCompartilhado('Não foi possível compartilhar agora. Copie o endereço da página para enviar.')
    }
  }

  return <VStack className="[&>div>div:last-child]:hidden">
    {/* shortcut: a barra do SiteShell não aceita conteúdo próprio; remover o seletor quando houver essa prop. */}
    <SiteShell>
      <VStack gap={8} className="mx-auto w-full max-w-(--ant-largura-max) px-(--ant-gutter) py-10 md:py-18">
        <Link href="/animais" className="flex min-h-12 items-center gap-2 font-extrabold text-(--ant-azul)"><ArrowLeft size={20} aria-hidden="true" />Todos os animais</Link>
        <VStack gap={5} className="grid min-w-0 gap-8 md:grid-cols-2">
          <VStack gap={5} className="min-w-0">
            <VStack gap={3} className="ant-polaroide">
              <Fita />
              {foto && !fotoFalhou ? <img src={foto} alt={`${animal.name}, ${label(animal.species).toLowerCase()}, foto ampliada`} onError={() => setFotoFalhou(true)} className="aspect-4/5 w-full rounded-(--ant-raio-campo) object-cover object-top" /> : <VStack gap={3} hAlign="center" vAlign="center" className="aspect-4/5 rounded-(--ant-raio-campo) bg-(--ant-foto-1)"><Pata /><p>sem foto ainda</p></VStack>}
              <NotaManuscrita className="px-3 pb-2">{animal.name}, esperando por um lar</NotaManuscrita>
            </VStack>
            {fotos.length > 1 && <HStack gap={3} wrap="wrap" aria-label={`Fotos de ${animal.name}`}>
              {fotos.map((url, i) => <button key={url} type="button" aria-label={`Ver foto ${i + 1} de ${animal.name}`} aria-pressed={foto === url} onClick={() => { setFoto(url); setFotoFalhou(false) }} className={`size-20 overflow-hidden rounded-(--ant-raio-campo) border-2 p-1 ${foto === url ? 'border-(--ant-azul)' : 'border-(--ant-areia)'}`}>
                <img src={url} alt="" className="h-full w-full rounded-(--ant-raio-campo) object-cover" />
              </button>)}
            </HStack>}
          </VStack>
          <VStack gap={5} className="min-w-0">
            <VStack gap={2}>
              <NotaManuscrita cor="azul">{label(animal.species)} · {animal.breed}</NotaManuscrita>
              <h1 className="break-words text-6xl font-extrabold leading-none md:text-8xl">{animal.name}</h1>
              <p className="text-lg text-(--ant-tinta-suave)">Um novo encontro. Uma vida inteira de carinho.</p>
            </VStack>
            <VStack as="dl" gap={4} className="grid grid-cols-2 rounded-(--ant-raio-cartao) bg-(--ant-sol-suave) p-5">
              {ficha.map(([nome, valor]) => <VStack key={nome} gap={1}><dt className="text-sm text-(--ant-tinta-suave)">{nome}</dt><dd className="font-extrabold">{valor}</dd></VStack>)}
            </VStack>
            <VStack gap={4} className="rounded-(--ant-raio-cartao) bg-(--ant-branco) p-5 shadow-(--ant-sombra-sm)">
              <h2 className="text-2xl font-extrabold">Um lar para {animal.name}</h2>
              <VStack className="hidden md:flex"><BotaoLink href={adotar} tamanho="grande">Quero adotar o {animal.name}</BotaoLink></VStack>
              <BotaoLink href={whatsapp} variacao="contorno"><MessageCircle size={20} aria-hidden="true" />Perguntar no WhatsApp</BotaoLink>
              <Botao variacao="contorno" onClick={compartilhar}><Share2 size={20} aria-hidden="true" />Compartilhar</Botao>
              {compartilhado && <p role={falhaCompartilhar ? 'alert' : 'status'}>{falhaCompartilhar && <AlertTriangle size={20} aria-hidden="true" />}{compartilhado}</p>}
              <p className="text-sm text-(--ant-tinta-suave)">Toda adoção inclui vacinação, microchip, castração e um mês de acompanhamento veterinário.</p>
            </VStack>
          </VStack>
        </VStack>
        <VStack as="section" gap={4} aria-labelledby="como-ele-e">
          <h2 id="como-ele-e" className="text-4xl font-extrabold">Como ele é</h2>
          <p className="whitespace-pre-line text-(--ant-tinta-suave)">{animal.description || 'A equipe está preparando a história desse focinho. Chame no WhatsApp para conhecer melhor seu jeito.'}</p>
        </VStack>
        <VStack as="section" gap={4} aria-labelledby="cuidados">
          <h2 id="cuidados" className="text-3xl font-extrabold">Cuidados para a chegada</h2>
          <ol className="list-decimal space-y-3 pl-6 text-(--ant-tinta-suave)"><li>Converse com a equipe sobre a rotina e as necessidades de {animal.name}.</li><li>Prepare um cantinho seguro, com água e espaço para descansar.</li><li>Respeite o tempo de adaptação e conte com o acompanhamento da ONG.</li></ol>
        </VStack>
        {parecidos.length > 0 && <VStack as="section" gap={5} aria-labelledby="parecidos">
          <h2 id="parecidos" className="text-4xl font-extrabold">Focinhos parecidos</h2>
          <VStack as="ul" gap={4} className="grid list-none grid-cols-2 gap-y-8 py-3 md:grid-cols-3">
            {parecidos.map((a, i) => <li key={a.id} className="min-w-0"><CartaoAnimal animal={a} indice={i} /></li>)}
          </VStack>
        </VStack>}
      </VStack>
      <HStack gap={2} className="fixed inset-x-0 bottom-0 z-40 border-t border-(--ant-areia) bg-(--ant-creme) px-(--ant-gutter) pt-3 pb-[calc(var(--ant-esp-3)+env(safe-area-inset-bottom))] shadow-(--ant-sombra-lg) md:hidden" aria-label="Ações de adoção">
        <BotaoLink href={adotar} tamanho="grande" className="min-w-0 flex-1 text-center">Quero adotar o {animal.name}</BotaoLink>
        <BotaoLink href={whatsapp} variacao="contorno" tamanho="grande" aria-label={`Perguntar sobre ${animal.name} no WhatsApp`}><MessageCircle size={24} aria-hidden="true" /></BotaoLink>
      </HStack>
    </SiteShell>
  </VStack>
}
