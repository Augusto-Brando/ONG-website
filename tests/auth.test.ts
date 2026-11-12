// Tests para lib/auth.ts
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { hashPassword, verifyPassword, signSession, verifySession, can } from '../lib/auth'

process.env.SESSION_SECRET = 'segredo-de-teste-com-32-caracteres!!'

describe('hashPassword + verifyPassword', () => {
  it('senha correta retorna true', async () => {
    const hash = await hashPassword('minhaSenha123')
    const result = await verifyPassword('minhaSenha123', hash)
    expect(result).toBe(true)
  })

  it('senha errada retorna false', async () => {
    const hash = await hashPassword('minhaSenha123')
    const result = await verifyPassword('senhaErrada', hash)
    expect(result).toBe(false)
  })

  it('dois hashes da mesma senha sao diferentes (salt unico)', async () => {
    const hash1 = await hashPassword('mesmaSenha')
    const hash2 = await hashPassword('mesmaSenha')
    expect(hash1).not.toBe(hash2)
  })

  it('hash malformado retorna false', async () => {
    const result = await verifyPassword('qualquer', 'hash-invalido')
    expect(result).toBe(false)
  })
})

describe('signSession + verifySession', () => {
  it('ida e volta devolve uid, name, role', async () => {
    const token = await signSession({ uid: 1, name: 'Admin', role: 'admin' })
    const session = await verifySession(token)
    expect(session).not.toBeNull()
    expect(session!.uid).toBe(1)
    expect(session!.name).toBe('Admin')
    expect(session!.role).toBe('admin')
  })

  it('token com 1 caractere alterado na assinatura retorna null', async () => {
    const token = await signSession({ uid: 1, name: 'Admin', role: 'admin' })
    const corrupted = token.slice(0, -1) + (token.slice(-1) === 'a' ? 'b' : 'a')
    const session = await verifySession(corrupted)
    expect(session).toBeNull()
  })

  it('token com o corpo trocado retorna null', async () => {
    const token1 = await signSession({ uid: 1, name: 'Admin', role: 'admin' })
    const token2 = await signSession({ uid: 2, name: 'Outro', role: 'voluntario' })
    const [, sig1] = token1.split('.')
    const [body2] = token2.split('.')
    const mixed = `${body2}.${sig1}`
    const session = await verifySession(mixed)
    expect(session).toBeNull()
  })

  it.each([undefined, '', 'abc'])('entrada invalida %p retorna null', async (input) => {
    const session = await verifySession(input)
    expect(session).toBeNull()
  })

  it('sessao expirada retorna null (fake timers)', async () => {
    vi.useFakeTimers()
    const now = Date.now()
    vi.setSystemTime(now)

    const token = await signSession({ uid: 1, name: 'Admin', role: 'admin' })

    // avança mais que SESSION_MAX_AGE (12h = 43200000 ms)
    vi.setSystemTime(now + 43200001)

    const session = await verifySession(token)
    expect(session).toBeNull()

    vi.useRealTimers()
  })
})

describe('can (permissoes por perfil)', () => {
  it('admin pode tudo', () => {
    expect(can('admin', 'dashboard')).toBe(true)
    expect(can('admin', 'animais')).toBe(true)
    expect(can('admin', 'financeiro')).toBe(true)
    expect(can('admin', 'usuarios')).toBe(true)
    expect(can('admin', 'adocoes')).toBe(true)
  })

  it('voluntario pode adocoes e nao pode financeiro nem usuarios', () => {
    expect(can('voluntario', 'adocoes')).toBe(true)
    expect(can('voluntario', 'animais')).toBe(true)
    expect(can('voluntario', 'financeiro')).toBe(false)
    expect(can('voluntario', 'usuarios')).toBe(false)
  })

  it('financeiro pode doacoes e nao pode adocoes', () => {
    expect(can('financeiro', 'doacoes')).toBe(true)
    expect(can('financeiro', 'financeiro')).toBe(true)
    expect(can('financeiro', 'adocoes')).toBe(false)
  })
})