import DogCarousel from '@/components/dog-carousel'
import DogCatalog from '@/components/dog-catalog'
import Header from '@/components/header'
import AboutSection from '@/components/about-section'
import ContactSection from '@/components/contact-section'
import Footer from '@/components/footer'
import type { Dog } from '@/lib/schema'

async function getDogs(): Promise<Dog[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const { getDb } = await import('@/lib/db')
    const { dogs } = await import('@/lib/schema')
    const { asc } = await import('drizzle-orm')
    return getDb().select().from(dogs).orderBy(asc(dogs.createdAt))
  } catch {
    return []
  }
}

export default async function Home() {
  const dogs = await getDogs()

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <DogCarousel dogs={dogs} />
      <DogCatalog dogs={dogs} />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
