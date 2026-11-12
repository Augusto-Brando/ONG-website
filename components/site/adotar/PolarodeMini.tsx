'use client'

// Mini polaroide do animal pedido: foto, nome e dados. Sem botões, para não
// competir com a ação principal do assistente.
import type { Dog } from '@/lib/schema'
import { label } from '@/lib/format'
import { Fita } from '@/components/marca/Fita'
import { NotaManuscrita } from '@/components/marca/NotaManuscrita'
import { Pata } from '@/components/marca/Pata'

export function PolarodeMini({ animal }: { animal: Dog }) {
  const foto = animal.imageUrl || animal.images?.[0] || ''
  const dados = [label(animal.species), animal.breed, animal.age].filter(Boolean).join(' · ')

  return (
    <figure
      className="ant-polaroide"
      style={{ margin: 0, padding: '8px 8px 14px', width: '190px' }}
    >
      <Fita />
      <div
        style={{
          position: 'relative',
          aspectRatio: '1 / 1',
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'var(--ant-foto-3)',
        }}
      >
        {foto ? (
          <img
            src={foto}
            alt={`${animal.name}, ${label(animal.species).toLowerCase()}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '50% 35%',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--ant-esp-1)',
            }}
          >
            <Pata />
            <span style={{ fontSize: 'var(--ant-texto-xs)', fontWeight: 800 }}>sem foto ainda</span>
          </div>
        )}
      </div>

      <figcaption style={{ padding: '8px 6px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span
          style={{
            fontFamily: 'var(--ant-fonte-titulo)',
            fontWeight: 800,
            fontSize: 'var(--ant-titulo-sm)',
            lineHeight: 1,
          }}
        >
          {animal.name}
        </span>
        <span style={{ fontSize: 'var(--ant-texto-xs)', fontWeight: 800, color: 'var(--ant-azul)' }}>
          {dados}
        </span>
        {animal.description ? (
          <NotaManuscrita tamanho="var(--ant-mao-md)">quer um lar</NotaManuscrita>
        ) : null}
      </figcaption>
    </figure>
  )
}
