import dns from 'dns'
import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

dns.setDefaultResultOrder('ipv4first')

type Db = ReturnType<typeof drizzleNeon<typeof schema>>

// Banco local (Docker) usa o driver `pg`; Neon (produção) continua com `neon-http`.
export function isLocalUrl(url: string) {
  return /@(localhost|127\.0\.0\.1|postgres|db)(:\d+)?\//.test(url)
}

const globalForDb = globalThis as unknown as { pgPool?: Pool }

export function getDb(): Db {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL não configurada')

  if (isLocalUrl(url)) {
    globalForDb.pgPool ??= new Pool({ connectionString: url, max: 10 })
    return drizzlePg(globalForDb.pgPool, { schema }) as unknown as Db
  }

  return drizzleNeon(neon(url), { schema })
}
