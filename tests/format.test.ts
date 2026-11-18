// Tests para lib/format.ts
import { describe, expect, it } from 'vitest'
import { formatDate, formatMoney, label, todayIso } from '../lib/format'

describe('formatDate', () => {
  it("formato 'AAAA-MM-DD' vira 'DD/MM/AAAA'", () => {
    expect(formatDate('2026-11-12')).toBe('12/11/2026')
  })

  it('null retorna traco', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('undefined retorna traco', () => {
    expect(formatDate(undefined)).toBe('—')
  })
})

describe('formatMoney', () => {
  it("formata string numerica contem '1.234,50'", () => {
    const result = formatMoney('1234.5')
    expect(result).toContain('1.234,50')
  })

  it('formata numero', () => {
    const result = formatMoney(1000)
    expect(result).toContain('1.000,00')
  })

  it('null vira 0', () => {
    const result = formatMoney(null)
    expect(result).toContain('0,00')
  })
})

describe('label', () => {
  it('chave conhecida retorna rotulo', () => {
    expect(label('em_tratamento')).toBe('Em tratamento')
  })

  it('chave desconhecida retorna a propria chave', () => {
    expect(label('xyz')).toBe('xyz')
  })

  it('null retorna traco', () => {
    expect(label(null)).toBe('—')
  })

  it('undefined retorna traco', () => {
    expect(label(undefined)).toBe('—')
  })
})

describe('todayIso', () => {
  it('retorna data no formato AAAA-MM-DD', () => {
    const result = todayIso()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})