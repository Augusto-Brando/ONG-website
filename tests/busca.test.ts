import { describe, expect, it } from 'vitest'
import { correspondeBusca, correspondeFiltro, descricaoContagem, normalizar, TODOS } from '@/lib/busca'

describe('normalizar', () => {
  it('remove acentos, espaços das pontas e caixa alta', () => {
    expect(normalizar('  Ração Fêmea ')).toBe('racao femea')
  })
})

describe('correspondeBusca', () => {
  it('busca vazia casa com tudo', () => {
    expect(correspondeBusca('', 'Thor')).toBe(true)
    expect(correspondeBusca('   ', null)).toBe(true)
  })

  it('ignora acento e caixa', () => {
    expect(correspondeBusca('racao', 'Ração Premium')).toBe(true)
    expect(correspondeBusca('JOÃO', 'joao silva')).toBe(true)
  })

  it('basta um campo conter o termo e ignora campos nulos', () => {
    expect(correspondeBusca('vet', null, 'Dra. Vet Ana', undefined)).toBe(true)
    expect(correspondeBusca('maria', 'Thor', null)).toBe(false)
  })
})

describe('correspondeFiltro', () => {
  it('"todos" e vazio casam com qualquer valor', () => {
    expect(correspondeFiltro(TODOS, 'cao')).toBe(true)
    expect(correspondeFiltro('', 'gato')).toBe(true)
  })

  it('valor específico casa só com ele mesmo', () => {
    expect(correspondeFiltro('cao', 'cao')).toBe(true)
    expect(correspondeFiltro('cao', 'gato')).toBe(false)
    expect(correspondeFiltro('cao', null)).toBe(false)
  })
})

describe('descricaoContagem', () => {
  it('sem filtro mostra só o total, com singular e plural', () => {
    expect(descricaoContagem(1, 1, 'animal', 'animais', false)).toBe('1 animal')
    expect(descricaoContagem(5, 5, 'animal', 'animais', false)).toBe('5 animais')
  })

  it('com filtro mostra "Mostrando X de Y"', () => {
    expect(descricaoContagem(2, 9, 'animal', 'animais', true)).toBe('Mostrando 2 de 9 animais')
  })
})
