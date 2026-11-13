import {
  pgTable,
  pgEnum,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  date,
  numeric,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'

// ---------------------------------------------------------------------------
// Enums (valores em pt-BR, sem acento, usados também nos validadores zod)
// ---------------------------------------------------------------------------
export const userRole = pgEnum('user_role', ['admin', 'voluntario', 'financeiro'])
export const animalSpecies = pgEnum('animal_species', ['cao', 'gato'])
export const animalSex = pgEnum('animal_sex', ['macho', 'femea', 'indefinido'])
export const animalStatus = pgEnum('animal_status', [
  'disponivel',
  'em_tratamento',
  'em_processo',
  'adotado',
  'indisponivel',
])
export const treatmentType = pgEnum('treatment_type', [
  'vacina',
  'vermifugo',
  'castracao',
  'consulta',
  'medicacao',
  'cirurgia',
  'exame',
  'outro',
])
export const treatmentStatus = pgEnum('treatment_status', ['agendado', 'realizado', 'cancelado'])
export const inventoryCategory = pgEnum('inventory_category', [
  'racao',
  'medicamento',
  'higiene',
  'limpeza',
  'acessorio',
  'outro',
])
export const movementType = pgEnum('movement_type', ['entrada', 'saida'])
export const donationType = pgEnum('donation_type', ['dinheiro', 'racao', 'medicamento', 'material', 'outro'])
// Doação feita pelo site (Pix) nasce 'pendente' e só conta nos totais depois de 'confirmada' pela equipe.
export const donationStatus = pgEnum('donation_status', ['pendente', 'confirmada', 'recusada'])
export const paymentMethod = pgEnum('payment_method', ['pix', 'dinheiro', 'transferencia', 'cartao', 'outro'])
export const transactionKind = pgEnum('transaction_kind', ['receita', 'despesa'])
export const adoptionStage = pgEnum('adoption_stage', [
  'novo',
  'triagem',
  'entrevista',
  'visita',
  'aprovado',
  'adotado',
  'pos_adocao',
  'recusado',
  'desistiu',
])
export const requestSource = pgEnum('request_source', ['site', 'whatsapp', 'instagram', 'evento', 'outro'])
export const interactionType = pgEnum('interaction_type', [
  'nota',
  'ligacao',
  'whatsapp',
  'email',
  'visita',
  'mudanca_etapa',
])

// ---------------------------------------------------------------------------
// Usuários e auditoria
// ---------------------------------------------------------------------------
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRole('role').notNull().default('voluntario'),
  active: boolean('active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const auditLog = pgTable(
  'audit_log',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(), // ex.: 'create', 'update', 'delete', 'login', 'stage_change'
    entity: text('entity').notNull(), // ex.: 'dogs', 'donations'
    entityId: integer('entity_id'),
    details: jsonb('details'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('audit_log_entity_idx').on(t.entity, t.entityId)],
)

// ---------------------------------------------------------------------------
// Animais (tabela legada `dogs`: cães e gatos) e tratamentos
// ---------------------------------------------------------------------------
export const dogs = pgTable('dogs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  species: animalSpecies('species').notNull().default('cao'),
  sex: animalSex('sex').notNull().default('indefinido'),
  breed: text('breed').notNull().default('Vira-lata'),
  age: text('age').notNull(),
  weight: text('weight'),
  description: text('description').notNull().default(''),
  observations: text('observations'),
  imageUrl: text('image_url').notNull().default(''),
  color: text('color').notNull().default('#F97316'),
  images: text('images').array().default([]),
  // `available` continua sendo o que a vitrine pública usa; `status` é o controle interno.
  available: boolean('available').notNull().default(true),
  status: animalStatus('status').notNull().default('disponivel'),
  castrated: boolean('castrated').notNull().default(false),
  vaccinated: boolean('vaccinated').notNull().default(false),
  rescuedAt: date('rescued_at'),
  adoptedAt: date('adopted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const treatments = pgTable(
  'treatments',
  {
    id: serial('id').primaryKey(),
    animalId: integer('animal_id')
      .notNull()
      .references(() => dogs.id, { onDelete: 'cascade' }),
    type: treatmentType('type').notNull(),
    description: text('description').notNull().default(''),
    veterinarian: text('veterinarian'),
    date: date('date').notNull(),
    nextDate: date('next_date'),
    cost: numeric('cost', { precision: 10, scale: 2 }),
    status: treatmentStatus('status').notNull().default('realizado'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('treatments_animal_idx').on(t.animalId)],
)

// ---------------------------------------------------------------------------
// Estoque
// ---------------------------------------------------------------------------
export const inventoryItems = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: inventoryCategory('category').notNull().default('outro'),
  unit: text('unit').notNull().default('un'), // un, kg, cx, ml...
  quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull().default('0'),
  minQuantity: numeric('min_quantity', { precision: 12, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const inventoryMovements = pgTable(
  'inventory_movements',
  {
    id: serial('id').primaryKey(),
    itemId: integer('item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'cascade' }),
    type: movementType('type').notNull(),
    quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull(),
    reason: text('reason').notNull().default(''),
    date: date('date').notNull(),
    donationId: integer('donation_id').references(() => donations.id, { onDelete: 'set null' }),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('inventory_movements_item_idx').on(t.itemId)],
)

// ---------------------------------------------------------------------------
// Doações, campanhas e financeiro
// ---------------------------------------------------------------------------
export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  goalAmount: numeric('goal_amount', { precision: 12, scale: 2 }),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const donations = pgTable(
  'donations',
  {
    id: serial('id').primaryKey(),
    donorName: text('donor_name'), // null = anônimo
    donorEmail: text('donor_email'),
    donorPhone: text('donor_phone'),
    type: donationType('type').notNull().default('dinheiro'),
    amount: numeric('amount', { precision: 12, scale: 2 }), // valor em R$ (dinheiro) ou estimado
    description: text('description').notNull().default(''),
    method: paymentMethod('method'),
    campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
    receivedAt: date('received_at').notNull(),
    status: donationStatus('status').notNull().default('confirmada'),
    pixTxid: text('pix_txid'), // identificador do Pix gerado no site (aparece no extrato)
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('donations_received_idx').on(t.receivedAt), index('donations_status_idx').on(t.status)],
)

export const transactions = pgTable(
  'transactions',
  {
    id: serial('id').primaryKey(),
    kind: transactionKind('kind').notNull(),
    category: text('category').notNull(), // ex.: 'doacao', 'veterinario', 'racao', 'aluguel'
    description: text('description').notNull().default(''),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(), // sempre positivo
    date: date('date').notNull(),
    donationId: integer('donation_id').references(() => donations.id, { onDelete: 'set null' }),
    treatmentId: integer('treatment_id').references(() => treatments.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('transactions_date_idx').on(t.date)],
)

// ---------------------------------------------------------------------------
// CRM de adoções
// ---------------------------------------------------------------------------
export const adopters = pgTable('adopters', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone').notNull(),
  city: text('city'),
  housingType: text('housing_type'), // casa, apartamento...
  hasOtherPets: boolean('has_other_pets'),
  notes: text('notes'),
  consentLgpd: boolean('consent_lgpd').notNull().default(false),
  consentAt: timestamp('consent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const adoptionRequests = pgTable(
  'adoption_requests',
  {
    id: serial('id').primaryKey(),
    adopterId: integer('adopter_id')
      .notNull()
      .references(() => adopters.id, { onDelete: 'cascade' }),
    animalId: integer('animal_id').references(() => dogs.id, { onDelete: 'set null' }),
    stage: adoptionStage('stage').notNull().default('novo'),
    source: requestSource('source').notNull().default('site'),
    message: text('message').notNull().default(''),
    assignedTo: integer('assigned_to').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    closedAt: timestamp('closed_at'),
  },
  (t) => [index('adoption_requests_stage_idx').on(t.stage)],
)

export const interactions = pgTable(
  'interactions',
  {
    id: serial('id').primaryKey(),
    requestId: integer('request_id')
      .notNull()
      .references(() => adoptionRequests.id, { onDelete: 'cascade' }),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    type: interactionType('type').notNull().default('nota'),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('interactions_request_idx').on(t.requestId)],
)

// ---------------------------------------------------------------------------
// Voluntários
// ---------------------------------------------------------------------------
export const volunteers = pgTable('volunteers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  availability: text('availability'), // ex.: "sábados de manhã"
  skills: text('skills'),
  active: boolean('active').notNull().default(true),
  consentLgpd: boolean('consent_lgpd').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ---------------------------------------------------------------------------
// Notícias
// ---------------------------------------------------------------------------
export const news = pgTable('news', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  summary: text('summary').notNull().default(''),
  content: text('content').notNull().default(''),
  coverImageUrl: text('cover_image_url').notNull().default(''),
  published: boolean('published').notNull().default(true),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Dog = typeof dogs.$inferSelect
export type NewDog = typeof dogs.$inferInsert
export type Treatment = typeof treatments.$inferSelect
export type InventoryItem = typeof inventoryItems.$inferSelect
export type InventoryMovement = typeof inventoryMovements.$inferSelect
export type Campaign = typeof campaigns.$inferSelect
export type Donation = typeof donations.$inferSelect
export type Transaction = typeof transactions.$inferSelect
export type Adopter = typeof adopters.$inferSelect
export type AdoptionRequest = typeof adoptionRequests.$inferSelect
export type Interaction = typeof interactions.$inferSelect
export type Volunteer = typeof volunteers.$inferSelect
export type News = typeof news.$inferSelect
export type NewNews = typeof news.$inferInsert
export type DonationStatus = (typeof donationStatus.enumValues)[number]
export type UserRole = (typeof userRole.enumValues)[number]
export type AdoptionStage = (typeof adoptionStage.enumValues)[number]
