// Tipos compartilhados pelos componentes do módulo de doações.

export type DonationRow = {
  id: number
  status: 'pendente' | 'confirmada' | 'recusada'
  pixTxid: string | null
  donorName: string | null
  donorEmail: string | null
  donorPhone: string | null
  type: string
  amount: number | null
  description: string
  method: string | null
  campaignId: number | null
  receivedAt: string
  campaign: { id: number; title: string } | null
}

export const DONATION_STATUS = { pendente: 'Pendente', confirmada: 'Confirmada', recusada: 'Recusada' }

export type DonationForm = {
  donorName: string
  donorEmail: string
  donorPhone: string
  type: string
  amount: string
  description: string
  method: string
  campaignId: string
  receivedAt: string
}

export type CampaignRow = {
  id: number
  title: string
  description: string
  goalAmount: number | null
  startDate: string
  endDate: string | null
  active: boolean
  raised: number
  donationsCount: number
}

export type CampaignForm = {
  title: string
  description: string
  goalAmount: string
  startDate: string
  endDate: string
  active: boolean
}

/** Valor sentinela dos <Select> (Radix não aceita string vazia como valor). */
export const NONE = 'nenhuma'

/** Tipos de doação aceitos pela API (`donation_type`). */
export const DONATION_TYPES = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'racao', label: 'Ração' },
  { value: 'medicamento', label: 'Medicamento' },
  { value: 'material', label: 'Material' },
  { value: 'outro', label: 'Outro' },
]

/** Formas de pagamento aceitas pela API (`payment_method`). */
export const PAYMENT_METHODS = [
  { value: 'pix', label: 'Pix' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'outro', label: 'Outro' },
]
