import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { and, eq, ne } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { dogs } from '@/lib/schema'
import { AnimalDetalhe } from '@/components/site/animais/AnimalDetalhe'

export const dynamic = 'force-dynamic'

const getAnimal = cache(async (id: string) => {
  const numero = Number(id)
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(numero) || numero < 1 || numero > 2147483647) notFound()
  const [animal] = await getDb().select().from(dogs).where(and(eq(dogs.id, numero), eq(dogs.available, true))).limit(1)
  if (!animal) notFound()
  return animal
})

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const animal = await getAnimal((await params).id)
  return {
    title: `${animal.name} para adoção | Amor Não Tem Raça`,
    description: animal.description || `Conheça ${animal.name}, ${animal.age}, esperando por um lar em Juiz de Fora.`,
  }
}

export default async function AnimalPage({ params }: Props) {
  const animal = await getAnimal((await params).id)
  const parecidos = await getDb().select().from(dogs)
    .where(and(eq(dogs.available, true), eq(dogs.species, animal.species), ne(dogs.id, animal.id))).limit(3)
  // O componente público recebe só os campos exibidos, sem observações internas.
  const publico = (a: typeof animal) => ({
    id: a.id, name: a.name, species: a.species, breed: a.breed, age: a.age,
    weight: a.weight, sex: a.sex, castrated: a.castrated, vaccinated: a.vaccinated,
    description: a.description, imageUrl: a.imageUrl, images: a.images,
  })
  return <AnimalDetalhe animal={publico(animal)} parecidos={parecidos.map(a => ({ ...a, observations: null }))} />
}
