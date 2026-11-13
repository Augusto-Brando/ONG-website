// Popula o banco LOCAL com dados fictícios. Uso: npm run db:seed
// Recusa rodar fora de localhost para nunca tocar o banco de produção.
import { getDb, isLocalUrl } from '../lib/db'
import * as s from '../lib/schema'
import { hashPassword } from '../lib/auth'
import { sql } from 'drizzle-orm'

const url = process.env.DATABASE_URL ?? ''
// Banco de DEMONSTRAÇÃO remoto (ex.: Neon só para mostrar o sistema): exige --demo E passa pela
// trava de dados abaixo. Sem --demo, só banco local.
const modoDemo = process.argv.includes('--demo')
if (!isLocalUrl(url) && !modoDemo) {
  console.error('seed: DATABASE_URL não é local. Abortado para proteger a produção.')
  process.exit(1)
}
// Senha dos logins de teste (em demonstração pública, defina SEED_SENHA com uma senha forte).
const senhaTeste = process.env.SEED_SENHA || 'ong12345'

const db = getDb()

/** Trava do modo demo: só aceita banco vazio ou que já seja de demonstração (tem admin@ong.local). */
async function confereBancoDemo() {
  const linhas = async (q: ReturnType<typeof sql>) => {
    try {
      const r = (await db.execute(q)) as unknown as { rows?: { n: number }[] } | { n: number }[]
      const rows = Array.isArray(r) ? r : (r.rows ?? [])
      return Number(rows[0]?.n ?? 0)
    } catch {
      return 0 // tabela ainda não existe
    }
  }
  const animais = await linhas(sql`select count(*)::int as n from dogs`)
  const demo = await linhas(sql`select count(*)::int as n from users where email = 'admin@ong.local'`)
  if (animais > 0 && demo === 0) {
    console.error('seed --demo: o banco tem animais e não é de demonstração. Abortado (pode ser a produção).')
    process.exit(1)
  }
}
const d = (offsetDays: number) => {
  const dt = new Date()
  dt.setDate(dt.getDate() + offsetDays)
  return dt.toISOString().slice(0, 10)
}

async function main() {
  if (modoDemo && !isLocalUrl(url)) await confereBancoDemo()
  console.log('Limpando tabelas...')
  await db.execute(sql`TRUNCATE audit_log, interactions, adoption_requests, adopters, transactions,
    inventory_movements, donations, campaigns, inventory_items, treatments, volunteers, news, dogs, users
    RESTART IDENTITY CASCADE`)

  console.log('Usuários...')
  const senha = await hashPassword(senhaTeste)
  const [admin, voluntaria] = await db
    .insert(s.users)
    .values([
      { name: 'Admin ONG', email: 'admin@ong.local', passwordHash: senha, role: 'admin' },
      { name: 'Vera Voluntária', email: 'voluntario@ong.local', passwordHash: senha, role: 'voluntario' },
      { name: 'Fábio Financeiro', email: 'financeiro@ong.local', passwordHash: senha, role: 'financeiro' },
    ])
    .returning()

  console.log('Animais...')
  const animais = await db
    .insert(s.dogs)
    .values([
      { name: 'Thor', species: 'cao', sex: 'macho', breed: 'Golden Retriever', age: '3 anos', weight: '28 kg', description: 'Dócil, ama crianças e passeios.', imageUrl: '/smiling-golden-retriever.png', images: ['/smiling-golden-retriever.png'], castrated: true, vaccinated: true, rescuedAt: d(-200) },
      { name: 'Pipoca', species: 'cao', sex: 'femea', breed: 'Beagle', age: '6 meses', weight: '7 kg', description: 'Filhote cheia de energia.', imageUrl: '/beagle-puppy-playing.jpg', images: ['/beagle-puppy-playing.jpg'], vaccinated: true, rescuedAt: d(-60) },
      { name: 'Nego', species: 'cao', sex: 'macho', breed: 'Labrador', age: '1 ano', weight: '20 kg', description: 'Brincalhão e muito carinhoso.', imageUrl: '/black-labrador-puppy.jpg', images: ['/black-labrador-puppy.jpg'], status: 'em_processo', castrated: true, vaccinated: true, rescuedAt: d(-120) },
      { name: 'Floquinho', species: 'cao', sex: 'macho', breed: 'Poodle (mestiço)', age: '5 anos', weight: '6 kg', description: 'Calmo, ideal para apartamento.', imageUrl: '/poodle-mix-dog-white.jpg', images: ['/poodle-mix-dog-white.jpg'], status: 'em_tratamento', available: false, rescuedAt: d(-20) },
      { name: 'Mia', species: 'gato', sex: 'femea', breed: 'Siamês', age: '2 anos', weight: '4 kg', description: 'Independente e curiosa.', imageUrl: '/siamese-cat-beautiful-portrait.jpg', images: ['/siamese-cat-beautiful-portrait.jpg'], castrated: true, vaccinated: true, rescuedAt: d(-90) },
      { name: 'Laranja', species: 'gato', sex: 'macho', breed: 'SRD', age: '8 meses', weight: '3 kg', description: 'Brincalhão, se dá bem com outros gatos.', imageUrl: '/tabby-cat-playful-orange.jpg', images: ['/tabby-cat-playful-orange.jpg'], vaccinated: true, rescuedAt: d(-45) },
      { name: 'Neve', species: 'gato', sex: 'femea', breed: 'Persa', age: '4 anos', weight: '4,5 kg', description: 'Tranquila e afetuosa.', imageUrl: '/persian-cat-fluffy-white.jpg', images: ['/persian-cat-fluffy-white.jpg'], status: 'adotado', available: false, castrated: true, vaccinated: true, rescuedAt: d(-300), adoptedAt: d(-30) },
      { name: 'Leão', species: 'gato', sex: 'macho', breed: 'Maine Coon', age: '3 anos', weight: '7 kg', description: 'Grandão e gentil.', imageUrl: '/maine-coon-cat-majestic.jpg', images: ['/maine-coon-cat-majestic.jpg'], castrated: true, vaccinated: true, rescuedAt: d(-150) },
    ])
    .returning()
  const [thor, pipoca, nego, floquinho, mia, laranja, neve] = animais

  console.log('Tratamentos...')
  const trats = await db
    .insert(s.treatments)
    .values([
      { animalId: thor.id, type: 'vacina', description: 'V10 anual', veterinarian: 'Dra. Ana', date: d(-30), nextDate: d(335), cost: '90.00' },
      { animalId: pipoca.id, type: 'vermifugo', description: 'Vermífugo filhote', date: d(-10), nextDate: d(20), cost: '35.00' },
      { animalId: pipoca.id, type: 'castracao', description: 'Castração agendada', veterinarian: 'Clínica Patas', date: d(5), status: 'agendado', cost: '250.00' },
      { animalId: floquinho.id, type: 'medicacao', description: 'Antibiótico (dermatite)', veterinarian: 'Dra. Ana', date: d(-7), nextDate: d(7), cost: '60.00', notes: '2x ao dia por 14 dias' },
      { animalId: mia.id, type: 'exame', description: 'Hemograma', date: d(-40), cost: '80.00' },
      { animalId: laranja.id, type: 'vacina', description: 'Quádrupla felina', date: d(-15), nextDate: d(6), cost: '75.00' },
    ])
    .returning()

  console.log('Estoque...')
  const itens = await db
    .insert(s.inventoryItems)
    .values([
      { name: 'Ração cão adulto', category: 'racao', unit: 'kg', quantity: '45', minQuantity: '30' },
      { name: 'Ração filhote', category: 'racao', unit: 'kg', quantity: '8', minQuantity: '10' },
      { name: 'Ração gato', category: 'racao', unit: 'kg', quantity: '15', minQuantity: '10' },
      { name: 'Vermífugo', category: 'medicamento', unit: 'un', quantity: '12', minQuantity: '5' },
      { name: 'Areia sanitária', category: 'higiene', unit: 'kg', quantity: '4', minQuantity: '12' },
      { name: 'Desinfetante', category: 'limpeza', unit: 'L', quantity: '10', minQuantity: '5' },
    ])
    .returning()

  console.log('Campanhas e doações...')
  const [natal, castracao] = await db
    .insert(s.campaigns)
    .values([
      { title: 'Natal sem abandono', description: 'Ração e vacinas para o fim de ano.', goalAmount: '5000.00', startDate: d(-20), endDate: d(40) },
      { title: 'Mutirão de castração', description: 'Castrar 30 animais resgatados.', goalAmount: '7500.00', startDate: d(-60), endDate: d(-5), active: false },
    ])
    .returning()

  const doacoes = await db
    .insert(s.donations)
    .values([
      { donorName: 'Maria S.', donorEmail: 'maria@example.com', type: 'dinheiro', amount: '150.00', method: 'pix', campaignId: natal.id, receivedAt: d(-12) },
      { donorName: null, type: 'dinheiro', amount: '50.00', method: 'pix', receivedAt: d(-9), description: 'Doação anônima' },
      { donorName: 'Pet Shop Amigo', type: 'racao', amount: '400.00', description: '20 kg de ração adulto', receivedAt: d(-8) },
      { donorName: 'João P.', type: 'dinheiro', amount: '300.00', method: 'transferencia', campaignId: castracao.id, receivedAt: d(-40) },
      { donorName: 'Clínica Patas', type: 'medicamento', amount: '120.00', description: 'Vermífugos', receivedAt: d(-25) },
      { donorName: 'Carla M.', type: 'dinheiro', amount: '80.00', method: 'pix', campaignId: natal.id, receivedAt: d(-3) },
    ])
    .returning()

  await db.insert(s.inventoryMovements).values([
    { itemId: itens[0].id, type: 'entrada', quantity: '20', reason: 'Doação Pet Shop Amigo', date: d(-8), donationId: doacoes[2].id, userId: voluntaria.id },
    { itemId: itens[0].id, type: 'saida', quantity: '15', reason: 'Consumo semanal', date: d(-1), userId: voluntaria.id },
    { itemId: itens[3].id, type: 'entrada', quantity: '10', reason: 'Doação Clínica Patas', date: d(-25), donationId: doacoes[4].id },
    { itemId: itens[4].id, type: 'saida', quantity: '6', reason: 'Gatil', date: d(-2) },
  ])

  console.log('Financeiro...')
  await db.insert(s.transactions).values([
    { kind: 'receita', category: 'doacao', description: 'Doação Maria S. (Natal)', amount: '150.00', date: d(-12), donationId: doacoes[0].id },
    { kind: 'receita', category: 'doacao', description: 'Doação anônima', amount: '50.00', date: d(-9), donationId: doacoes[1].id },
    { kind: 'receita', category: 'doacao', description: 'Doação João P. (castração)', amount: '300.00', date: d(-40), donationId: doacoes[3].id },
    { kind: 'receita', category: 'doacao', description: 'Doação Carla M. (Natal)', amount: '80.00', date: d(-3), donationId: doacoes[5].id },
    { kind: 'receita', category: 'bazar', description: 'Bazar beneficente', amount: '620.00', date: d(-18) },
    { kind: 'despesa', category: 'veterinario', description: 'Vacina V10 - Thor', amount: '90.00', date: d(-30), treatmentId: trats[0].id },
    { kind: 'despesa', category: 'veterinario', description: 'Antibiótico - Floquinho', amount: '60.00', date: d(-7), treatmentId: trats[3].id },
    { kind: 'despesa', category: 'racao', description: 'Compra de ração filhote', amount: '180.00', date: d(-14) },
    { kind: 'despesa', category: 'aluguel', description: 'Aluguel do abrigo', amount: '900.00', date: d(-5) },
  ])

  console.log('CRM de adoções...')
  const adotantes = await db
    .insert(s.adopters)
    .values([
      { name: 'Paula Ribeiro', email: 'paula@example.com', phone: '(32) 99999-0001', city: 'Juiz de Fora', housingType: 'casa', hasOtherPets: true, consentLgpd: true, consentAt: new Date() },
      { name: 'Ricardo Lima', email: 'ricardo@example.com', phone: '(32) 99999-0002', city: 'Juiz de Fora', housingType: 'apartamento', hasOtherPets: false, consentLgpd: true, consentAt: new Date() },
      { name: 'Ana Souza', phone: '(32) 99999-0003', city: 'Matias Barbosa', housingType: 'casa', consentLgpd: true, consentAt: new Date() },
      { name: 'Bruno Alves', email: 'bruno@example.com', phone: '(32) 99999-0004', city: 'Juiz de Fora', housingType: 'casa', hasOtherPets: true, consentLgpd: true, consentAt: new Date() },
      { name: 'Camila Duarte', email: 'camila@example.com', phone: '(32) 99999-0005', city: 'Juiz de Fora', housingType: 'apartamento', consentLgpd: true, consentAt: new Date() },
    ])
    .returning()

  const pedidos = await db
    .insert(s.adoptionRequests)
    .values([
      { adopterId: adotantes[0].id, animalId: thor.id, stage: 'novo', source: 'site', message: 'Tenho quintal grande e outro cachorro.' },
      { adopterId: adotantes[1].id, animalId: mia.id, stage: 'triagem', source: 'instagram', message: 'Moro sozinho, trabalho em casa.', assignedTo: voluntaria.id },
      { adopterId: adotantes[2].id, animalId: nego.id, stage: 'visita', source: 'whatsapp', assignedTo: voluntaria.id },
      { adopterId: adotantes[3].id, animalId: neve.id, stage: 'pos_adocao', source: 'evento', assignedTo: admin.id },
      { adopterId: adotantes[4].id, animalId: laranja.id, stage: 'entrevista', source: 'site', message: 'Sempre quis um gato laranja!' },
    ])
    .returning()

  await db.insert(s.interactions).values([
    { requestId: pedidos[1].id, userId: voluntaria.id, type: 'ligacao', content: 'Primeiro contato; perfil compatível.' },
    { requestId: pedidos[2].id, userId: voluntaria.id, type: 'mudanca_etapa', content: 'Etapa: entrevista → visita' },
    { requestId: pedidos[2].id, userId: voluntaria.id, type: 'nota', content: 'Visita marcada para sábado às 10h.' },
    { requestId: pedidos[3].id, userId: admin.id, type: 'visita', content: 'Visita pós-adoção: Neve adaptada e saudável.' },
  ])

  console.log('Voluntários e notícias...')
  await db.insert(s.volunteers).values([
    { name: 'Lucas T.', phone: '(32) 98888-0001', availability: 'Sábados de manhã', skills: 'Passeios, banho', consentLgpd: true },
    { name: 'Júlia F.', email: 'julia@example.com', availability: 'Dias úteis à noite', skills: 'Redes sociais', consentLgpd: true },
  ])
  await db.insert(s.news).values([
    { title: 'Feira de adoção no sábado', summary: 'Venha conhecer nossos animais!', content: 'Neste sábado, das 9h às 13h, na praça central.', coverImageUrl: '/happy-dogs-rescue-sanctuary.jpg' },
    { title: 'Campanha Natal sem abandono', summary: 'Ajude com ração e vacinas.', content: 'Doe via Pix e acompanhe a meta no site.', coverImageUrl: '/dog-rescue-team-volunteers-helping-dogs.jpg' },
  ])

  console.log('\nSeed concluído. Logins (senha: ong12345):')
  console.log('  admin@ong.local | voluntario@ong.local | financeiro@ong.local')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
