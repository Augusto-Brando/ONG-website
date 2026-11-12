// Tipos compartilhados do módulo de estoque (lado cliente).
export type InventoryItem = {
  id: number
  name: string
  category: string
  unit: string
  quantity: string
  minQuantity: string
  notes: string | null
  createdAt: string
  low: boolean
}

export type Movement = {
  id: number
  itemId: number
  type: string
  quantity: string
  reason: string
  date: string
  item: { id: number; name: string; unit: string } | null
}