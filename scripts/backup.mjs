// Backup do banco (npm run db:backup).
// - Banco local (Docker): roda o pg_dump DENTRO do contêiner, porque o Windows
//   não tem pg_dump no PATH: `docker compose exec -T db pg_dump -U ong -d ong --clean --if-exists`.
// - Banco não local (ex.: Neon): usa o pg_dump do PATH com a DATABASE_URL.
// - Gera backups/ong-AAAA-MM-DD-HHmm.sql e mantém só os 10 backups mais recentes.
// - Nunca imprime a senha da DATABASE_URL (nem em log, nem em mensagem de erro).
import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Âncora na raiz do projeto (funciona de qualquer cwd): o compose e o .env ficam aqui.
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
process.chdir(ROOT)

// Lê o .env sem quebrar se o arquivo não existir (o ambiente pode já ter as variáveis).
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

/** Remove credenciais de qualquer texto antes de mostrar (a URL nunca vai para o log). */
function redact(text) {
  return String(text)
    .replaceAll(/\/\/[^/@\s:]+:[^@\s]+@/gi, '//***:***@')
    .replaceAll(/password=[^\s&"']+/gi, 'password=***')
}

function timestamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

const backupsDir = path.join(ROOT, 'backups')
mkdirSync(backupsDir, { recursive: true })

const MAX_BACKUPS = 10
let stdout
let stderr
let status
let spawnError

if (isLocalUrl(url)) {
  const r = spawnSync(
    'docker',
    ['compose', 'exec', '-T', 'db', 'pg_dump', '-U', 'ong', '-d', 'ong', '--clean', '--if-exists'],
    { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 },
  )
  spawnError = r.error
  status = r.status
  stdout = r.stdout
  stderr = r.stderr
} else {
  // Banco remoto: precisa do pg_dump no PATH do próprio sistema.
  const probe = spawnSync('pg_dump', ['--version'], { encoding: 'utf8' })
  if (probe.error || probe.status !== 0) {
    console.error('Este banco não é local e o pg_dump não está disponível no PATH.')
    console.error('Instale o cliente PostgreSQL e tente de novo:')
    console.error('  Windows: winget install PostgreSQL.Postgresql  (ou choco install postgresql)')
    console.error('  macOS:   brew install libpq && brew link --force libpq')
    console.error('  Linux:   sudo apt install postgresql-client')
    process.exit(1)
  }
  // A URL vai apenas como argumento do subprocesso — nunca é impressa.
  const r = spawnSync('pg_dump', [url, '--clean', '--if-exists'], {
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
  })
  spawnError = r.error
  status = r.status
  stdout = r.stdout
  stderr = r.stderr
}

if (spawnError || status !== 0) {
  console.error('O pg_dump falhou e nenhum backup foi gerado.')
  if (spawnError) {
    console.error(redact(spawnError.message))
    if (spawnError.code === 'ENOENT') {
      console.error('O Docker não está instalado ou não está no PATH. Rode `npm run db:up` com o Docker aberto.')
    }
  } else {
    console.error(redact(stderr || '').trim() || `código de saída ${status}`)
  }
  process.exit(1)
}

if (!stdout || !stdout.includes('PostgreSQL database dump')) {
  console.error('O pg_dump terminou, mas a saída não parece um dump válido. Nada foi gravado.')
  process.exit(1)
}

const file = path.join(backupsDir, `ong-${timestamp()}.sql`)
writeFileSync(file, stdout)
console.log(`Backup criado: ${path.relative(ROOT, file)} (${(Buffer.byteLength(stdout) / 1024).toFixed(1)} KB)`)

// Retenção: mantém apenas os MAX_BACKUPS mais recentes (o nome carrega a data/hora).
const existing = readdirSync(backupsDir)
  .filter((f) => f.startsWith('ong-') && f.endsWith('.sql'))
  .sort()
let removed = 0
while (existing.length > MAX_BACKUPS) {
  rmSync(path.join(backupsDir, existing.shift()))
  removed++
}
if (removed > 0) console.log(`Retenção: ${removed} backup(s) antigo(s) removido(s).`)
console.log(`Backups em backups/: ${existing.length} de ${MAX_BACKUPS}.`)
