// Tipos compartilhados do módulo de tratamentos (lado cliente).
export type TreatmentRow = {
  id: number
  animalId: number
  type: string
  description: string
  veterinarian: string | null
  date: string
  nextDate: string | null
  cost: string | null
  status: string
  notes: string | null
  animal: { id: number; name: string; species: string } | null
}

export type DogRow = {
  id: number
  name: string
  species: string
}