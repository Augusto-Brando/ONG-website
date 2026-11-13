// Contratos de entrada da API (zod). Toda rota que grava dados valida com estes schemas.
// Datas no formato 'AAAA-MM-DD'. Valores monetários/quantidades como número (convertidos para string no insert).
import { z } from 'zod'
import {
  userRole,
  animalSpecies,
  animalSex,
  animalStatus,
  treatmentType,
  treatmentStatus,
  inventoryCategory,
  movementType,
  donationType,
  paymentMethod,
  transactionKind,
  adoptionStage,
  requestSource,
  interactionType,
} from './schema'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato AAAA-MM-DD')
const money = z.coerce.number().nonnegative().max(10_000_000)
const optText = z.string().trim().max(2000).optional().nullable()
const phone = z.string().trim().min(8, 'Telefone inválido').max(30)

// Auth e usuários ------------------------------------------------------------
export const loginInput = z.object({
  email: z.string().trim().toLowerCase().email().optional(),
  password: z.string().min(1).max(200),
})

export const userInput = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(userRole.enumValues),
  active: z.boolean().default(true),
  password: z.string().min(8, 'Mínimo de 8 caracteres').max(200).optional(), // obrigatória só na criação
})

// Animais e tratamentos ------------------------------------------------------
export const animalStatusInput = z.object({
  status: z.enum(animalStatus.enumValues),
  castrated: z.boolean().optional(),
  vaccinated: z.boolean().optional(),
  species: z.enum(animalSpecies.enumValues).optional(),
  sex: z.enum(animalSex.enumValues).optional(),
  rescuedAt: isoDate.optional().nullable(),
})

export const treatmentInput = z.object({
  animalId: z.coerce.number().int().positive(),
  type: z.enum(treatmentType.enumValues),
  description: z.string().trim().max(1000).default(''),
  veterinarian: optText,
  date: isoDate,
  nextDate: isoDate.optional().nullable(),
  cost: money.optional().nullable(),
  status: z.enum(treatmentStatus.enumValues).default('realizado'),
  notes: optText,
})

// Estoque ---------------------------------------------------------------------
export const inventoryItemInput = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.enum(inventoryCategory.enumValues),
  unit: z.string().trim().min(1).max(10).default('un'),
  minQuantity: z.coerce.number().nonnegative().default(0),
  notes: optText,
})

export const inventoryMovementInput = z.object({
  itemId: z.coerce.number().int().positive(),
  type: z.enum(movementType.enumValues),
  quantity: z.coerce.number().positive(),
  reason: z.string().trim().max(500).default(''),
  date: isoDate,
  donationId: z.coerce.number().int().positive().optional().nullable(),
})

// Doações, campanhas, financeiro -----------------------------------------------
export const campaignInput = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).default(''),
  goalAmount: money.optional().nullable(),
  startDate: isoDate,
  endDate: isoDate.optional().nullable(),
  active: z.boolean().default(true),
})

export const donationInput = z.object({
  donorName: optText,
  donorEmail: z.string().trim().toLowerCase().email().optional().nullable().or(z.literal('')),
  donorPhone: optText,
  type: z.enum(donationType.enumValues),
  amount: money.optional().nullable(),
  description: z.string().trim().max(1000).default(''),
  method: z.enum(paymentMethod.enumValues).optional().nullable(),
  campaignId: z.coerce.number().int().positive().optional().nullable(),
  receivedAt: isoDate,
})

export const transactionInput = z.object({
  kind: z.enum(transactionKind.enumValues),
  category: z.string().trim().min(2).max(60),
  description: z.string().trim().max(500).default(''),
  amount: money.refine((v) => v > 0, 'Valor deve ser maior que zero'),
  date: isoDate,
  donationId: z.coerce.number().int().positive().optional().nullable(),
  treatmentId: z.coerce.number().int().positive().optional().nullable(),
})

// CRM de adoções -----------------------------------------------------------------
/** Formulário público "Quero adotar" (sem login). Consentimento LGPD obrigatório. */
export const publicAdoptionInput = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().optional().or(z.literal('')),
  phone,
  city: optText,
  housingType: optText,
  hasOtherPets: z.boolean().optional().nullable(),
  animalId: z.coerce.number().int().positive().optional().nullable(),
  message: z.string().trim().max(2000).default(''),
  consentLgpd: z.literal(true, { errorMap: () => ({ message: 'É preciso aceitar o uso dos dados' }) }),
  website: z.string().max(0).optional(), // honeypot anti-spam: deve vir vazio
})

export const adoptionRequestInput = z.object({
  adopterId: z.coerce.number().int().positive(),
  animalId: z.coerce.number().int().positive().optional().nullable(),
  stage: z.enum(adoptionStage.enumValues).default('novo'),
  source: z.enum(requestSource.enumValues).default('outro'),
  message: z.string().trim().max(2000).default(''),
  assignedTo: z.coerce.number().int().positive().optional().nullable(),
})

export const stageChangeInput = z.object({
  stage: z.enum(adoptionStage.enumValues),
  note: z.string().trim().max(1000).optional(),
})

export const interactionInput = z.object({
  type: z.enum(interactionType.enumValues).default('nota'),
  content: z.string().trim().min(1).max(4000),
})

export const adopterInput = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().optional().nullable().or(z.literal('')),
  phone,
  city: optText,
  housingType: optText,
  hasOtherPets: z.boolean().optional().nullable(),
  notes: optText,
  consentLgpd: z.boolean().default(false),
})

// Voluntários --------------------------------------------------------------------
export const volunteerInput = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().optional().nullable().or(z.literal('')),
  phone: optText,
  availability: optText,
  skills: optText,
  active: z.boolean().default(true),
  consentLgpd: z.boolean().default(false),
})

/** Etapas que encerram a solicitação (gravam `closedAt`). */
export const CLOSED_STAGES = ['adotado', 'recusado', 'desistiu'] as const

// Doações por Pix feitas no site ----------------------------------------------------
/** "Já fiz o Pix": registra a doação como pendente até a equipe conferir no extrato. */
export const publicPixDonationInput = z.object({
  valor: z.coerce.number().min(1, 'Valor mínimo de R$ 1,00').max(100000),
  txid: z.string().regex(/^[A-Z0-9]{8,25}$/, 'Identificador do Pix inválido'),
  campaignId: z.coerce.number().int().positive().optional().nullable(),
  nome: z.string().trim().max(120).optional().nullable(),
  email: z.string().trim().toLowerCase().email().optional().nullable().or(z.literal('')),
  website: z.string().max(0).optional(), // honeypot anti-spam
})

export const donationStatusInput = z.object({
  status: z.enum(['confirmada', 'recusada']),
})
