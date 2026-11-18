import { describe, expect, it } from 'vitest'
import { crc16, gerarPixCopiaECola, limparTextoPix, novoTxid, PIX_ONG } from '../lib/pix'

/** Lê os campos TLV de um BR Code (id de 2 dígitos + tamanho de 2 dígitos + valor). */
function lerCampos(s: string): Record<string, string> {
  const out: Record<string, string> = {}
  let i = 0
  while (i < s.length) {
    const id = s.slice(i, i + 2)
    const tam = Number(s.slice(i + 2, i + 4))
    out[id] = s.slice(i + 4, i + 4 + tam)
    i += 4 + tam
  }
  return out
}

describe('crc16 (CCITT-FALSE)', () => {
  it('vetor padrão "123456789" = 29B1', () => {
    expect(crc16('123456789')).toBe('29B1')
  })
  it('confere o exemplo do manual do Banco Central', () => {
    const exemplo =
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D'
    expect(crc16(exemplo.slice(0, -4))).toBe('1D3D')
  })
})

describe('gerarPixCopiaECola', () => {
  const pix = gerarPixCopiaECola({ valor: 50, txid: 'ANTRTESTE123', descricao: 'Natal sem abandono' })
  const campos = lerCampos(pix)

  it('tem os campos obrigatórios com os dados da ONG', () => {
    expect(campos['00']).toBe('01')
    expect(campos['52']).toBe('0000')
    expect(campos['53']).toBe('986')
    expect(campos['54']).toBe('50.00')
    expect(campos['58']).toBe('BR')
    expect(campos['59']).toBe('AMOR NAO TEM RACA')
    expect(campos['60']).toBe('JUIZ DE FORA')
    const conta = lerCampos(campos['26'])
    expect(conta['00']).toBe('br.gov.bcb.pix')
    expect(conta['01']).toBe(PIX_ONG.chave)
    expect(conta['02']).toBe('NATAL SEM ABANDONO')
    expect(lerCampos(campos['62'])['05']).toBe('ANTRTESTE123')
  })

  it('termina com CRC válido', () => {
    expect(pix.slice(-8, -4)).toBe('6304')
    expect(crc16(pix.slice(0, -4))).toBe(pix.slice(-4))
  })

  it('formata centavos e rejeita valores inválidos', () => {
    expect(lerCampos(gerarPixCopiaECola({ valor: 12.5, txid: 'X' }))['54']).toBe('12.50')
    expect(() => gerarPixCopiaECola({ valor: 0, txid: 'X' })).toThrow()
    expect(() => gerarPixCopiaECola({ valor: -5, txid: 'X' })).toThrow()
    expect(() => gerarPixCopiaECola({ valor: Number.NaN, txid: 'X' })).toThrow()
  })
})

describe('auxiliares', () => {
  it('limparTextoPix remove acentos e símbolos e respeita o limite', () => {
    expect(limparTextoPix('Ração & vacinas!', 40)).toBe('RACAO  VACINAS')
    expect(limparTextoPix('abcdefghij', 5)).toBe('ABCDE')
  })
  it('novoTxid gera até 25 caracteres alfanuméricos e únicos', () => {
    const a = novoTxid()
    const b = novoTxid()
    expect(a).toMatch(/^[A-Z0-9]{1,25}$/)
    expect(a).not.toBe(b)
  })
})
