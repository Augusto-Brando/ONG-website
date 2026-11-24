// Testes para lib/animal-form.ts (regras de vitrine e parsing de FormData do painel)
import { describe, expect, it } from 'vitest'
import { parseAnimalExtras } from '../lib/animal-form'

describe('parseAnimalExtras', () => {
  it('marca available=true para disponivel e em_processo e limpa adoptedAt', () => {
    const fd1 = new FormData()
    fd1.set('status', 'disponivel')
    expect(parseAnimalExtras(fd1)).toEqual({ status: 'disponivel', available: true, adoptedAt: null })

    const fd2 = new FormData()
    fd2.set('status', 'em_processo')
    expect(parseAnimalExtras(fd2)).toEqual({ status: 'em_processo', available: true, adoptedAt: null })
  })

  it('marca available=false para em_tratamento, indisponivel e adotado', () => {
    const fdTratamento = new FormData()
    fdTratamento.set('status', 'em_tratamento')
    expect(parseAnimalExtras(fdTratamento)).toEqual({
      status: 'em_tratamento',
      available: false,
      adoptedAt: null,
    })

    const fdAdotado = new FormData()
    fdAdotado.set('status', 'adotado')
    expect(parseAnimalExtras(fdAdotado)).toEqual({ status: 'adotado', available: false })
  })

  it('ignora valores de enum invalidos', () => {
    const fd = new FormData()
    fd.set('species', 'dragao')
    fd.set('sex', 'desconhecido')
    fd.set('status', 'qualquer')
    expect(parseAnimalExtras(fd)).toEqual({})
  })

  it('interpreta booleanos castrated/vaccinated e valida rescuedAt ISO', () => {
    const fd = new FormData()
    fd.set('species', 'gato')
    fd.set('sex', 'femea')
    fd.set('castrated', 'true')
    fd.set('vaccinated', 'false')
    fd.set('rescuedAt', '2026-10-05')

    expect(parseAnimalExtras(fd)).toEqual({
      species: 'gato',
      sex: 'femea',
      castrated: true,
      vaccinated: false,
      rescuedAt: '2026-10-05',
    })

    const fdInvalidDate = new FormData()
    fdInvalidDate.set('rescuedAt', '05/10/2026')
    expect(parseAnimalExtras(fdInvalidDate)).toEqual({ rescuedAt: null })
  })
})
