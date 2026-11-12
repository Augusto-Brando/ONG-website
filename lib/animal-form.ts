// Campos de controle interno do animal enviados pelo formulário do painel (FormData).
import { animalSex, animalSpecies, animalStatus, type NewDog } from './schema'

function pick<T extends string>(fd: FormData, key: string, allowed: readonly T[]): T | undefined {
  const v = fd.get(key)
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : undefined
}

/** Só devolve o que veio no formulário; `status` é quem define `available` (vitrine pública). */
export function parseAnimalExtras(fd: FormData): Partial<NewDog> {
  const out: Partial<NewDog> = {}
  const species = pick(fd, 'species', animalSpecies.enumValues)
  const sex = pick(fd, 'sex', animalSex.enumValues)
  const status = pick(fd, 'status', animalStatus.enumValues)
  if (species) out.species = species
  if (sex) out.sex = sex
  if (status) {
    out.status = status
    out.available = status === 'disponivel' || status === 'em_processo'
    if (status !== 'adotado') out.adoptedAt = null
  }
  if (fd.has('castrated')) out.castrated = fd.get('castrated') === 'true'
  if (fd.has('vaccinated')) out.vaccinated = fd.get('vaccinated') === 'true'
  if (fd.has('rescuedAt')) {
    const v = String(fd.get('rescuedAt'))
    out.rescuedAt = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null
  }
  return out
}
