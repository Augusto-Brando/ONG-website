// Autenticação do painel: senha com scrypt, sessão em cookie assinado (HMAC-SHA256).
// Sem dependências externas. Usado pelo `proxy.ts` (Web Crypto) e pelas rotas da API.
import type { UserRole } from './schema'

export const SESSION_COOKIE = 'admin_session'
export const SESSION_MAX_AGE = 60 * 60 * 12 // 12 h

export type Session = {
  uid: number // 0 = login legado por ADMIN_PASSWORD (só enquanto não há usuários)
  name: string
  role: UserRole
  exp: number // epoch em segundos
}

// ---------------------------------------------------------------------------
// Permissões por perfil
// ---------------------------------------------------------------------------
export type Area =
  | 'dashboard'
  | 'animais'
  | 'tratamentos'
  | 'estoque'
  | 'adocoes'
  | 'doacoes'
  | 'financeiro'
  | 'relatorios'
  | 'noticias'
  | 'voluntarios'
  | 'usuarios'

const PERMISSIONS: Record<UserRole, Area[] | '*'> = {
  admin: '*',
  voluntario: ['dashboard', 'animais', 'tratamentos', 'estoque', 'adocoes', 'noticias', 'voluntarios'],
  financeiro: ['dashboard', 'doacoes', 'financeiro', 'relatorios', 'estoque'],
}

export function can(role: UserRole, area: Area): boolean {
  const allowed = PERMISSIONS[role]
  return allowed === '*' || allowed.includes(area)
}

// ---------------------------------------------------------------------------
// Assinatura da sessão (Web Crypto: funciona no proxy e nas rotas)
// ---------------------------------------------------------------------------
function secret(): string {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 16) throw new Error('SESSION_SECRET ausente ou curto demais (mínimo 16 caracteres)')
  return s
}

function b64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(s: string): Uint8Array {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  const bin = atob(pad)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return b64url(new Uint8Array(sig))
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function signSession(data: Omit<Session, 'exp'>): Promise<string> {
  const payload: Session = { ...data, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE }
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)))
  return `${body}.${await hmac(body)}`
}

export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  try {
    if (!safeEqual(sig, await hmac(body))) return null
    const s = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Session
    if (typeof s.exp !== 'number' || s.exp < Date.now() / 1000) return null
    return s
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Senhas (scrypt do Node; só no servidor)
// ---------------------------------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  const { scrypt, randomBytes } = await import('node:crypto')
  const salt = randomBytes(16).toString('hex')
  const key = await new Promise<Buffer>((res, rej) =>
    scrypt(password, salt, 64, (err, k) => (err ? rej(err) : res(k))),
  )
  return `scrypt$${salt}$${key.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const { scrypt, timingSafeEqual } = await import('node:crypto')
  const [alg, salt, hex] = stored.split('$')
  if (alg !== 'scrypt' || !salt || !hex) return false
  const key = await new Promise<Buffer>((res, rej) =>
    scrypt(password, salt, 64, (err, k) => (err ? rej(err) : res(k))),
  )
  const expected = Buffer.from(hex, 'hex')
  return expected.length === key.length && timingSafeEqual(expected, key)
}
