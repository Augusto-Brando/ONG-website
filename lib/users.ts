import { users } from './schema'

/** Colunas de usuário que podem sair pela API (nunca o hash da senha). */
export const publicUser = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  active: users.active,
  lastLoginAt: users.lastLoginAt,
  createdAt: users.createdAt,
}

export type PublicUser = {
  id: number
  name: string
  email: string
  role: 'admin' | 'voluntario' | 'financeiro'
  active: boolean
  lastLoginAt: string | null
  createdAt: string
}
