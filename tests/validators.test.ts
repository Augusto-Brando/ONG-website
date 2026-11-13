// Tests para lib/validators.ts
import { describe, expect, it } from 'vitest'
import {
  publicAdoptionInput,
  donationInput,
  transactionInput,
  inventoryMovementInput,
  treatmentInput,
  userInput,
  stageChangeInput,
} from '../lib/validators'

describe('publicAdoptionInput', () => {
  it('aceita um pedido valido', () => {
    const result = publicAdoptionInput.safeParse({
      name: 'Joao Silva',
      email: 'joao@email.com',
      phone: '11999999999',
      city: 'Sao Paulo',
      housingType: 'Casa',
      hasOtherPets: false,
      animalId: 1,
      message: 'Quero adotar',
      consentLgpd: true,
      website: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita sem consentLgpd: true', () => {
    const result = publicAdoptionInput.safeParse({
      name: 'Joao Silva',
      email: 'joao@email.com',
      phone: '11999999999',
      consentLgpd: false,
      website: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita telefone curto', () => {
    const result = publicAdoptionInput.safeParse({
      name: 'Joao Silva',
      email: 'joao@email.com',
      phone: '123',
      consentLgpd: true,
      website: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita website preenchido (honeypot)', () => {
    const result = publicAdoptionInput.safeParse({
      name: 'Joao Silva',
      email: 'joao@email.com',
      phone: '11999999999',
      consentLgpd: true,
      website: 'spam',
    })
    expect(result.success).toBe(false)
  })

  it('aceita e-mail vazio', () => {
    const result = publicAdoptionInput.safeParse({
      name: 'Joao Silva',
      email: '',
      phone: '11999999999',
      consentLgpd: true,
      website: '',
    })
    expect(result.success).toBe(true)
  })
})

describe('donationInput', () => {
  it('aceita doacao em dinheiro', () => {
    const result = donationInput.safeParse({
      donorName: 'Maria',
      donorEmail: 'maria@email.com',
      donorPhone: '11988888888',
      type: 'dinheiro',
      amount: 100.50,
      description: 'Doacao mensal',
      method: 'pix',
      campaignId: null,
      receivedAt: '2026-11-12',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita amount negativo', () => {
    const result = donationInput.safeParse({
      donorName: 'Maria',
      donorEmail: 'maria@email.com',
      type: 'dinheiro',
      amount: -50,
      receivedAt: '2026-11-12',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita data no formato invalido (DD/MM/AAAA)', () => {
    const result = donationInput.safeParse({
      type: 'dinheiro',
      receivedAt: '12/11/2026',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita donorEmail invalido', () => {
    const result = donationInput.safeParse({
      type: 'dinheiro',
      donorEmail: 'email-invalido',
      receivedAt: '2026-11-12',
    })
    expect(result.success).toBe(false)
  })

  it('aceita donorEmail vazio', () => {
    const result = donationInput.safeParse({
      type: 'dinheiro',
      donorEmail: '',
      receivedAt: '2026-11-12',
    })
    expect(result.success).toBe(true)
  })
})

describe('transactionInput', () => {
  it('rejeita amount: 0', () => {
    const result = transactionInput.safeParse({
      kind: 'receita',
      category: 'Doacoes',
      amount: 0,
      date: '2026-11-12',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita kind: lucro (nao existe no enum)', () => {
    const result = transactionInput.safeParse({
      kind: 'lucro',
      category: 'Teste',
      amount: 100,
      date: '2026-11-12',
    })
    expect(result.success).toBe(false)
  })

  it('aceita transacao valida', () => {
    const result = transactionInput.safeParse({
      kind: 'receita',
      category: 'Doacoes',
      amount: 100,
      date: '2026-11-12',
    })
    expect(result.success).toBe(true)
  })
})

describe('inventoryMovementInput', () => {
  it('rejeita quantidade 0', () => {
    const result = inventoryMovementInput.safeParse({
      itemId: 1,
      type: 'entrada',
      quantity: 0,
      date: '2026-11-12',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita quantidade negativa', () => {
    const result = inventoryMovementInput.safeParse({
      itemId: 1,
      type: 'entrada',
      quantity: -5,
      date: '2026-11-12',
    })
    expect(result.success).toBe(false)
  })

  it('converte string "5" em numero 5', () => {
    const result = inventoryMovementInput.safeParse({
      itemId: 1,
      type: 'entrada',
      quantity: '5',
      date: '2026-11-12',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.quantity).toBe(5)
    }
  })
})

describe('treatmentInput', () => {
  it('status padrao e realizado', () => {
    const result = treatmentInput.safeParse({
      animalId: 1,
      type: 'vacina',
      date: '2026-11-12',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('realizado')
    }
  })

  it('rejeita tipo desconhecido', () => {
    const result = treatmentInput.safeParse({
      animalId: 1,
      type: 'tipo-inexistente',
      date: '2026-11-12',
    })
    expect(result.success).toBe(false)
  })
})

describe('userInput', () => {
  it('e-mail e normalizado para minusculas', () => {
    const result = userInput.safeParse({
      name: 'Joao',
      email: 'JOAO@EMAIL.COM',
      role: 'voluntario',
      active: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('joao@email.com')
    }
  })

  it('rejeita senha com menos de 8 caracteres', () => {
    const result = userInput.safeParse({
      name: 'Joao',
      email: 'joao@email.com',
      role: 'voluntario',
      password: '1234567',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita perfil invalido', () => {
    const result = userInput.safeParse({
      name: 'Joao',
      email: 'joao@email.com',
      role: 'superadmin',
    })
    expect(result.success).toBe(false)
  })
})

describe('stageChangeInput', () => {
  it('aceita adotado', () => {
    const result = stageChangeInput.safeParse({
      stage: 'adotado',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita finalizado (nao existe no enum)', () => {
    const result = stageChangeInput.safeParse({
      stage: 'finalizado',
    })
    expect(result.success).toBe(false)
  })
})