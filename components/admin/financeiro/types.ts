// Tipos compartilhados pelos componentes do módulo financeiro.

export type TransactionRow = {
  id: number
  kind: string
  category: string
  description: string
  amount: number
  date: string
  donationId: number | null
  treatmentId: number | null
}

export type TransactionsSummary = {
  receitas: number
  despesas: number
  saldo: number
}

export type TransactionForm = {
  kind: string
  category: string
  description: string
  amount: string
  date: string
}

/** Categorias sugeridas no formulário de lançamento. */
export const CATEGORY_OPTIONS = [
  'doacao',
  'bazar',
  'veterinario',
  'racao',
  'aluguel',
  'transporte',
  'outros',
]
