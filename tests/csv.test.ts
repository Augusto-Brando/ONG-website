// Testes para lib/csv.ts (exportação compatível com Excel pt-BR e proteção contra formula injection)
import { describe, expect, it } from 'vitest'
import { toCsv } from '../lib/csv'

describe('toCsv', () => {
  it('inclui BOM UTF-8, separador ponto-e-virgula e quebras CRLF', () => {
    const csv = toCsv(['Nome', 'Valor'], [['Thor', 150]])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toBe('\uFEFFNome;Valor\r\nThor;150')
  })

  it('envolve em aspas celulas com ponto-e-virgula, aspas ou quebra de linha', () => {
    const csv = toCsv(
      ['Descricao'],
      [['Ração; porte "grande"'], ['Linha 1\nLinha 2']],
    )
    expect(csv).toBe('\uFEFFDescricao\r\n"Ração; porte ""grande"""\r\n"Linha 1\nLinha 2"')
  })

  it('protege textos iniciados por =, +, - ou @ contra injecao de formula', () => {
    const csv = toCsv(
      ['Campo'],
      [['=SOMA(A1:A2)'], ['+1+1'], ['-cmd'], ['@SUM(1,2)']],
    )
    expect(csv).toBe("\uFEFFCampo\r\n'=SOMA(A1:A2)\r\n'+1+1\r\n'-cmd\r\n'@SUM(1,2)")
  })

  it('mantem numeros negativos como numeros e trata null e nao-finitos como vazio', () => {
    const csv = toCsv(['A', 'B', 'C', 'D'], [[-42.5, null, Number.NaN, Number.POSITIVE_INFINITY]])
    expect(csv).toBe('\uFEFFA;B;C;D\r\n-42.5;;;')
  })
})
