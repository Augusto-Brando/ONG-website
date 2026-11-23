// Implantação do ERP/CRM no banco de PRODUÇÃO (npm run db:implantar -- --confirmo).
// Faz, nesta ordem, e para no primeiro problema:
//   1. Recusa banco local e exige a flag --confirmo.
//   2. Backup dos dados de todas as tabelas em backups/producao-AAAA-MM-DD-HHmm.json.
//   3. Confere que o esquema antigo (dogs, news) bate com a migração 0000_inicial.
//   4. Se o banco foi criado por db:push (sem controle de migrações), registra a 0000 como aplicada,
//      com o hash calculado do arquivo local (o mesmo que o migrador do Drizzle usa).
//   5. Aplica as migrações pendentes (0001_erp_crm, 0002_doacao_pix): só criam tabelas e
//      acrescentam colunas com valor padrão, nada é apagado.
//   6. Confere o resultado (tabelas, migrações registradas, contagem de animais e notícias).
// A URL vem de DATABASE_URL (ambiente) ou de --env <arquivo>; nunca é impressa.
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
process.chdir(ROOT)

const args = process.argv.slice(2)
const envIdx = args.indexOf('--env')
if (envIdx >= 0) process.loadEnvFile(args[envIdx + 1])

const url = process.env.DATABASE_URL
const redact = (t) => String(t).replaceAll(/\/\/[^/@\s:]+:[^@\s]+@/gi, '//***:***@')
const fail = (msg) => {
  console.error(`\n✗ ${redact(msg)}\nNada mais foi feito.`)
  process.exit(1)
}

if (!url) fail('DATABASE_URL não configurada (use a variável de ambiente ou --env <arquivo>).')
if (/@(localhost|127\.0\.0\.1|postgres|db)(:\d+)?\//.test(url)) fail('Este script é só para o banco de produção (a URL é local).')
if (!args.includes('--confirmo')) fail('Passe --confirmo para executar contra o banco de produção.')

const host = new URL(url).host
console.log(`Banco: ${host}`)

// SSL vem do sslmode da URL; sslmode e channel_binding saem da string (o pg trata o SSL pelo objeto).
const parsed = new URL(url)
const ssl = /^(require|verify)/.test(parsed.searchParams.get('sslmode') ?? '') ? { rejectUnauthorized: false } : undefined
parsed.searchParams.delete('sslmode')
parsed.searchParams.delete('channel_binding')
const client = new pg.Client({ connectionString: parsed.toString(), ssl })
await client.connect().catch((e) => fail(`Falha ao conectar: ${e.message}`))
const q = async (sql, params) => (await client.query(sql, params)).rows

try {
  // 2. Backup
  const tables = (await q(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY 1`)).map((r) => r.table_name)
  const dump = { host, criadoEm: new Date().toISOString(), tabelas: {} }
  for (const t of tables) dump.tabelas[t] = await q(`SELECT * FROM "${t}"`)
  mkdirSync('backups', { recursive: true })
  const stamp = new Date().toISOString().slice(0, 19).replace('T', '-').replaceAll(':', '')
  const file = path.join('backups', `producao-${stamp}.json`)
  writeFileSync(file, JSON.stringify(dump, null, 2))
  console.log(`✓ Backup: ${file} (${tables.map((t) => `${t}=${dump.tabelas[t].length}`).join(', ')})`)

  // 3. Esquema antigo
  const cols = async (t) => (await q(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`, [t])).map((r) => r.column_name)
  const expected = {
    dogs: ['id', 'name', 'breed', 'age', 'weight', 'description', 'observations', 'image_url', 'color', 'images', 'available', 'created_at'],
    news: ['id', 'title', 'summary', 'content', 'cover_image_url', 'published', 'published_at', 'created_at'],
  }
  for (const [t, need] of Object.entries(expected)) {
    if (!tables.includes(t)) fail(`Tabela "${t}" não existe no banco de produção: o esquema não é o esperado.`)
    const have = await cols(t)
    const missing = need.filter((c) => !have.includes(c))
    if (missing.length) fail(`Tabela "${t}" sem as colunas ${missing.join(', ')}: o esquema não bate com a 0000_inicial.`)
  }
  console.log('✓ Esquema antigo confere com a 0000_inicial')

  // 4. Controle de migrações
  const journal = JSON.parse(readFileSync('drizzle/meta/_journal.json', 'utf8'))
  const hashOf = (tag) => createHash('sha256').update(readFileSync(`drizzle/${tag}.sql`).toString()).digest('hex')
  await q('CREATE SCHEMA IF NOT EXISTS drizzle')
  await q('CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)')
  const applied = await q('SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at')
  if (applied.length === 0) {
    const first = journal.entries[0]
    if (tables.includes('users')) fail('Há tabelas do ERP sem registro de migração: estado misto, revise à mão.')
    await q('INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)', [hashOf(first.tag), first.when])
    console.log(`✓ ${first.tag} registrada como aplicada (banco criado por db:push)`)
  } else {
    console.log(`✓ Controle de migrações já existe (${applied.length} registrada(s))`)
  }

  // 5. Migrações pendentes
  await migrate(drizzle(client), { migrationsFolder: './drizzle' })
  console.log('✓ Migrações aplicadas')
  if (applied.length === 0) {
    // Primeira implantação: a coluna nova `status` nasce 'disponivel' para todos; quem estava
    // fora da vitrine (available = false) passa a 'indisponivel' no painel.
    const r = await client.query(`UPDATE dogs SET status = 'indisponivel' WHERE available = false AND status = 'disponivel'`)
    console.log(`✓ ${r.rowCount} animal(is) fora da vitrine marcado(s) como indisponível`)
  }

  // 6. Conferência
  const after = (await q(`SELECT count(*)::int n FROM information_schema.tables WHERE table_schema='public'`))[0].n
  const regs = (await q('SELECT count(*)::int n FROM drizzle.__drizzle_migrations'))[0].n
  const dogs = (await q('SELECT count(*)::int n FROM dogs'))[0].n
  const news = (await q('SELECT count(*)::int n FROM news'))[0].n
  if (regs !== journal.entries.length) fail(`Esperava ${journal.entries.length} migrações registradas, há ${regs}.`)
  if (dogs !== dump.tabelas.dogs.length || news !== dump.tabelas.news.length) fail('A contagem de animais ou notícias mudou: restaure o backup.')
  console.log(`✓ Conferido: ${after} tabelas, ${regs} migrações, ${dogs} animais e ${news} notícias preservados`)
  console.log('\nPróximo passo: SESSION_SECRET (e BLOB/SMTP) na Vercel e redeploy. Ver docs/implantacao.md, seções 4 a 6.')
} catch (e) {
  fail(e.message)
} finally {
  await client.end()
}
