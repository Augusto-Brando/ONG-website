// Tipos compartilhados da tela de adoções (formato devolvido pelas APIs).
import type { AdoptionStage } from '@/lib/schema'

export const ACTIVE_STAGES: AdoptionStage[] = [
  'novo',
  'triagem',
  'entrevista',
  'visita',
  'aprovado',
  'adotado',
  'pos_adocao',
]

export const CLOSED_STAGE_LIST: AdoptionStage[] = ['recusado', 'desistiu']

export const ALL_STAGES: AdoptionStage[] = [...ACTIVE_STAGES, ...CLOSED_STAGE_LIST]

export const SOURCES = ['site', 'whatsapp', 'instagram', 'evento', 'outro'] as const

export type RequestAdopter = {
  id: number
  name: string
  phone: string
  email: string | null
  city: string | null
}

export type RequestAnimal = { id: number; name: string; imageUrl: string }

export type RequestListItem = {
  id: number
  adopterId: number
  animalId: number | null
  stage: AdoptionStage
  source: string
  message: string
  assignedTo: number | null
  createdAt: string
  updatedAt: string
  closedAt: string | null
  adopter: RequestAdopter
  animal: RequestAnimal | null
}

export type AdopterRecord = RequestAdopter & {
  housingType: string | null
  hasOtherPets: boolean | null
  notes: string | null
  consentLgpd: boolean
  consentAt: string | null
  createdAt: string
}

export type InteractionItem = {
  id: number
  requestId: number
  userId: number | null
  type: string
  content: string
  createdAt: string
}

export type RequestDetail = Omit<RequestListItem, 'adopter' | 'animal'> & {
  adopter: AdopterRecord | null
  animal: (RequestAnimal & { status: string }) | null
  interactions: InteractionItem[]
}
