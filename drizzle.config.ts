import { defineConfig } from 'drizzle-kit'

// Carrega o .env local (Node 21+), sem depender de dotenv.
try {
  process.loadEnvFile?.('.env')
} catch {}

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
