// Restauração do banco LOCAL (npm run db:restore -- <arquivo.sql>).
// - Recusa DATABASE_URL não local (mesma regra de isLocalUrl em lib/db.ts / scripts/seed.ts):
//   a restauração é permitida SOMENTE no banco local do Docker, para nunca tocar a produção.
// - Pede confirmação digitando RESTAURAR (ou use --sim em scripts/CI).
// - Aplica via `docker compose exec -T db psql -U ong -d ong`, lendo o dump pela entrada padrão,
//   em uma única transação: se algo falhar no meio, o banco volta ao estado anterior.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
process.chdir(ROOT)

const args = process.argv.slice(2)
const assumeYes = args.includes('--sim')
const file = args.find((a) => !a.startsWith('--'))

if (!file) {
  console.error('Uso: npm run db:restore -- <arquivo.sql>   (adicione --sim para pular a confirmação)')
  console.error('Exemplo: npm run db:restore -- backups/ong-2026-11-12-1430.sql')
  process.exit(1)
}

try {
  process.loadEnvFile('.env')
} catch {
  // .env ausente: segue com o que já existe no ambiente.
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL não configurada (arquivo .env ou variável de ambiente). Nada foi feito.')
  process.exit(1)
}

// Mesma regra de lib/db.ts (isLocalUrl): host da URL em localhost/127.0.0.1/postgres/db.
const isLocalUrl = (u) => /@(localhost|127\.0\.0\.1|postgres|db)(:\d+)?\//.test(u)
if (!isLocalUrl(url)) {
  console.error('restore: a DATABASE_URL não é local. A restauração é permitida SOMENTE no banco local.')
  console.error('Aponte a DATABASE_URL para o PostgreSQL do Docker (ex.: postgres://ong:***@localhost:5433/ong) e tente de novo.')
  process.exit(1)
}

const abs = path.resolve(file)
if (!existsSync(abs) || !statSync(abs).isFile()) {
  console.error(`Arquivo não encontrado: ${file}`)
  process.exit(1)
}
if (!abs.toLowerCase().endsWith('.sql')) {
  console.error(`Só restaure arquivos .sql gerados pelo backup: ${path.basename(file)}`)
  process.exit(1)
}

const sql = readFileSync(abs, 'utf8')
if (!sql.includes('PostgreSQL database dump')) {
  console.error(`O arquivo ${path.basename(file)} não parece um dump do pg_dump (cabeçalho ausente). Abortado.`)
  process.exit(1)
}

async function confirmar() {
  if (assumeYes) return true
  console.log(`ATENÇÃO: isto SUBSTITUI todo o conteúdo do banco local por ${path.basename(abs)}.`)
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const resposta = await new Promise((resolve) => rl.question('Digite RESTAURAR para confirmar: ', resolve))
  rl.close()
  return resposta.trim() === 'RESTAURAR'
}

if (!(await confirmar())) {
  console.log('Restauração cancelada (nada foi alterado).')
  process.exit(1)
}

const r = spawnSync(
  'docker',
  [
    'compose',
    'exec',
    '-T',
    'db',
    'psql',
    '-U',
    'ong',
    '-d',
    'ong',
    '--single-transaction',
    '-v',
    'ON_ERROR_STOP=1',
  ],
  { input: sql, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 },
)

if (r.error || r.status !== 0) {
  console.error('A restauração FALHOU. Como foi em uma única transação, o banco segue como estava.')
  if (r.error) {
    console.error(r.error.message)
    if (r.error.code === 'ENOENT') console.error('O Docker não está instalado ou não está no PATH. Rode `npm run db:up` com o Docker aberto.')
  } else {
    console.error((r.stderr || r.stdout || `código de saída ${r.status}`).trim())
  }
  process.exit(1)
}

console.log(`Banco local restaurado a partir de ${path.basename(abs)}.`)
console.log('Dica: confirme com `npm run db:seed` (reseta os dados fictícios) se era isso que você esperava.')
