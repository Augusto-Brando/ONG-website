// Teste de ponta a ponta (E2E) do site e do painel.
// Porte do roteiro antigo `smoke.sh`, sem dependências: só `fetch` (Node 20+).
//
// Uso:
//   npm run test:e2e
//   E2E_BASE_URL=http://localhost:3000 MAILPIT_URL=http://localhost:8025 npm run test:e2e
//
// Variáveis:
//   E2E_BASE_URL  endereço do app (padrão http://localhost:3000)
//   MAILPIT_URL   endereço do Mailpit; sem ela a checagem de e-mail é pulada (é o caso do CI)
//
// Pré-requisito: banco com dados de demonstração (`npm run db:seed`).
// Saída só com caracteres ASCII (compatível com qualquer terminal/CI); código 1 se falhar algo.

const BASE = (process.env.E2E_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '')
const MAILPIT = process.env.MAILPIT_URL ? process.env.MAILPIT_URL.replace(/\/+$/, '') : null
const PASSWORD = 'ong12345'

// O formulário público aceita 5 envios por IP a cada 10 minutos e 30 no total (todos os IPs).
// Cada execução usa um IP de teste próprio para que rodar a suíte em sequência não esbarre
// no limite por IP; o teto global é por processo e some ao reiniciar o servidor.
const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1))
const TEST_IP = `10.${rand(1, 254)}.${rand(1, 254)}.${rand(1, 254)}`

const cookies = new Map() // perfil -> "admin_session=..."
let okCount = 0
let failCount = 0
let skipped = 0

function check(name, expected, actual) {
  if (String(expected) === String(actual)) {
    okCount += 1
    console.log(`  ok    ${name}`)
  } else {
    failCount += 1
    console.log(`  FALHA ${name} (esperado ${expected}, veio ${actual})`)
  }
}

function skip(name) {
  skipped += 1
  console.log(`  pular ${name} (MAILPIT_URL nao definido)`)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Requisição com cookie do perfil e sem seguir redirecionamento. */
function api(path, { user, method = 'GET', body, headers = {} } = {}) {
  const h = { ...headers }
  if (body !== undefined) h['content-type'] = 'application/json'
  if (user && cookies.has(user)) h.cookie = cookies.get(user)
  return fetch(`${BASE}${path}`, {
    method,
    headers: h,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual',
  })
}

async function status(path, options) {
  return (await api(path, options)).status
}

async function json(path, options) {
  const res = await api(path, options)
  return res.json()
}

function extractCookie(res) {
  const all = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [res.headers.get('set-cookie') || '']
  for (const raw of all) {
    const pair = raw.split(';')[0].trim()
    if (pair.startsWith('admin_session=')) return pair
  }
  return null
}

async function login(user) {
  const res = await api('/api/auth', {
    method: 'POST',
    body: { email: `${user}@ong.local`, password: PASSWORD },
  })
  if (res.status !== 200) {
    console.log(`  FALHA login ${user}@ong.local (esperado 200, veio ${res.status})`)
    failCount += 1
    return false
  }
  const cookie = extractCookie(res)
  if (!cookie) {
    console.log(`  FALHA login ${user}@ong.local (resposta sem cookie de sessao)`)
    failCount += 1
    return false
  }
  cookies.set(user, cookie)
  return true
}

async function mailpitTotal() {
  const res = await fetch(`${MAILPIT}/api/v1/messages`)
  if (!res.ok) throw new Error(`Mailpit respondeu ${res.status}`)
  const body = await res.json()
  return Number(body.total ?? 0)
}

async function main() {
  console.log(`== E2E em ${BASE}`)
  const health = await api('/api/health')
  const healthBody = await health.json().catch(() => ({}))
  check('health responde 200', 200, health.status)
  check('health com banco ok', 'ok', healthBody.db)

  for (const user of ['admin', 'voluntario', 'financeiro']) {
    if (!(await login(user))) {
      console.log('Login falhou: o restante da suite depende dos tres perfis. Abortando.')
      return
    }
  }

  console.log('== Telas (admin)')
  const pages = [
    '/admin',
    '/admin/painel',
    '/admin/adocoes',
    '/admin/doacoes',
    '/admin/financeiro',
    '/admin/estoque',
    '/admin/tratamentos',
    '/admin/voluntarios',
    '/admin/usuarios',
    '/admin/reports',
    '/admin/news',
  ]
  for (const page of pages) {
    check(`tela ${page}`, 200, await status(page, { user: 'admin' }))
  }

  console.log('== CRM de adocoes')
  const mail0 = MAILPIT ? await mailpitTotal() : null

  // O animal do teste e escolhido em tempo de execucao: um que esteja na vitrine agora.
  // Assim a suite roda de novo sem novo seed (o animal adotado no teste e devolvido ao fim).
  const dogsBefore = await json('/api/dogs')
  const candidate = dogsBefore.find((d) => d.available && d.status !== 'adotado' && d.status !== 'indisponivel')
  const animalId = candidate ? candidate.id : 1
  check('animal disponivel para o teste', 'sim', candidate ? 'sim' : 'nao')

  check(
    'form publico cria',
    201,
    await status('/api/public/adoption', {
      method: 'POST',
      headers: { 'x-real-ip': TEST_IP },
      body: {
        name: 'Teste Smoke',
        phone: '(32) 99999-1234',
        email: 'smoke@example.com',
        animalId,
        message: 'oi',
        consentLgpd: true,
      },
    }),
  )
  check(
    'form publico sem consentimento',
    400,
    await status('/api/public/adoption', {
      method: 'POST',
      headers: { 'x-real-ip': TEST_IP },
      body: { name: 'Teste Smoke', phone: '(32) 99999-1234' },
    }),
  )
  check(
    'form publico honeypot nao grava',
    200,
    await status('/api/public/adoption', {
      method: 'POST',
      headers: { 'x-real-ip': TEST_IP },
      body: { name: 'Robo', phone: '(32) 99999-1234', consentLgpd: true, website: 'spam' },
    }),
  )

  const requests = await json('/api/adoption-requests', { user: 'voluntario' })
  const smokeRequests = requests.filter((r) => r.adopter && r.adopter.name === 'Teste Smoke' && r.animalId === animalId)
  const request = smokeRequests.sort((a, b) => b.id - a.id)[0]
  check('solicitacao aparece na lista', 'sim', request ? 'sim' : 'nao')

  if (request) {
    check(
      'mudar etapa p/ adotado',
      200,
      await status(`/api/adoption-requests/${request.id}/stage`, {
        user: 'voluntario',
        method: 'PATCH',
        body: { stage: 'adotado', note: 'smoke' },
      }),
    )
    const dogs = await json('/api/dogs')
    const animal = dogs.find((d) => d.id === animalId)
    check(`animal ${animalId} virou adotado`, 'adotado', animal ? animal.status : 'sem animal')
    check('animal do teste saiu da vitrine', 'nao', animal && animal.available ? 'sim' : 'nao')

    const detail = await json(`/api/adoption-requests/${request.id}`, { user: 'voluntario' })
    check('detalhe tem interacoes', 'sim', (detail.interactions || []).length >= 1 ? 'sim' : 'nao')
    check(
      'interacao manual',
      201,
      await status(`/api/adoption-requests/${request.id}/interactions`, {
        user: 'voluntario',
        method: 'POST',
        body: { type: 'nota', content: 'ligar amanha' },
      }),
    )
  }
  check('financeiro barrado no CRM', 403, await status('/api/adoption-requests', { user: 'financeiro' }))

  if (MAILPIT) {
    await sleep(1000)
    const mail1 = await mailpitTotal()
    check('e-mails enviados (>=2)', 'sim', mail1 - mail0 >= 2 ? 'sim' : 'nao')
  } else {
    skip('e-mails enviados (>=2)')
  }

  // Desfaz a adocao do teste (volta a solicitacao para "novo"): o animal sai de "adotado"
  // e volta para a vitrine, entao a suite pode rodar de novo sem precisar de outro seed.
  if (request) {
    check(
      'volta a solicitacao de teste p/ novo',
      200,
      await status(`/api/adoption-requests/${request.id}/stage`, {
        user: 'voluntario',
        method: 'PATCH',
        body: { stage: 'novo', note: 'e2e: restaura o animal do teste' },
      }),
    )
    const dogsAfter = await json('/api/dogs')
    const restored = dogsAfter.find((d) => d.id === animalId)
    check('animal do teste volta para a vitrine', 'sim', restored && restored.available ? 'sim' : 'nao')
  }

  console.log('== Doacoes e financeiro')
  const before = await json('/api/transactions', { user: 'financeiro' })
  const receitas0 = Number(before.summary.receitas)
  const donation = await json('/api/donations', {
    user: 'financeiro',
    method: 'POST',
    body: { donorName: 'Smoke', type: 'dinheiro', amount: 100, method: 'pix', receivedAt: '2026-11-12' },
  })
  const after = await json('/api/transactions', { user: 'financeiro' })
  check('doacao em dinheiro gera receita (+100)', 100, Math.round(Number(after.summary.receitas) - receitas0))

  const entry = (after.items || []).find((t) => t.donationId === donation.id)
  if (entry) {
    check(
      'lancamento de doacao nao edita direto',
      409,
      await status(`/api/transactions/${entry.id}`, { user: 'financeiro', method: 'DELETE' }),
    )
  } else {
    check('lancamento de doacao nao edita direto', 409, 'sem lancamento vinculado')
  }

  check('excluir doacao', 200, await status(`/api/donations/${donation.id}`, { user: 'financeiro', method: 'DELETE' }))
  const undo = await json('/api/transactions', { user: 'financeiro' })
  check('receita desfeita', 0, Math.round(Number(undo.summary.receitas) - receitas0))

  const campaigns = await json('/api/campaigns', { user: 'financeiro' })
  check(
    'campanhas com arrecadado',
    'sim',
    campaigns.length > 0 && campaigns.every((c) => 'raised' in c) ? 'sim' : 'nao',
  )
  check('voluntario barrado em doacoes', 403, await status('/api/donations', { user: 'voluntario' }))
  check('voluntario barrado no financeiro', 403, await status('/api/transactions', { user: 'voluntario' }))

  console.log('== Estoque e tratamentos')
  check(
    'saida acima do saldo',
    409,
    await status('/api/inventory/movements', {
      user: 'voluntario',
      method: 'POST',
      body: { itemId: 5, type: 'saida', quantity: 9999, date: '2026-11-12' },
    }),
  )
  check('financeiro barrado em tratamentos', 403, await status('/api/treatments', { user: 'financeiro' }))

  console.log('== Painel e exportacao')
  const dashboardAdmin = await json('/api/dashboard', { user: 'admin' })
  check('dashboard admin tem financeiro', 'sim', dashboardAdmin.financeiro ? 'sim' : 'nao')
  const dashboardVoluntario = await json('/api/dashboard', { user: 'voluntario' })
  check('dashboard voluntario sem financeiro', 'sem', dashboardVoluntario.financeiro ? 'com' : 'sem')

  check('export doacoes 200', 200, await status('/api/export/doacoes', { user: 'admin' }))
  const csv = await (await api('/api/export/doacoes', { user: 'admin' })).text()
  check('export sem e-mail de doador', 0, (csv.match(/@/g) || []).length)
  check('export entidade invalida', 404, await status('/api/export/senhas', { user: 'admin' }))
  check('voluntario barrado na exportacao', 403, await status('/api/export/doacoes', { user: 'voluntario' }))
}

try {
  await main()
} catch (e) {
  failCount += 1
  console.log(`  FALHA erro inesperado: ${e && e.message ? e.message : e}`)
  console.log('Servidor no ar? Confira E2E_BASE_URL (padrao http://localhost:3000).')
}

const parts = [`${okCount} ok`, `${failCount} falha(s)`]
if (skipped) parts.push(`${skipped} pulada(s)`)
console.log(`== Resultado: ${parts.join(', ')}`)
process.exit(failCount ? 1 : 0)