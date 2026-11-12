import DogCarousel from '@/components/dog-carousel'
import DogCatalog from '@/components/dog-catalog'
import Header from '@/components/header'
import AboutSection from '@/components/about-section'
import NewsSection from '@/components/news-section'
import DonationSection from '@/components/donation-section'
import ContactSection from '@/components/contact-section'
import Footer from '@/components/footer'
import type { Dog, News } from '@/lib/schema'

export const dynamic = 'force-dynamic'

async function getDogs(): Promise<Dog[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const { getDb } = await import('@/lib/db')
    const { dogs } = await import('@/lib/schema')
    const { asc, eq } = await import('drizzle-orm')
    // Vitrine pública: só animais disponíveis ou em processo de adoção.
    return getDb().select().from(dogs).where(eq(dogs.available, true)).orderBy(asc(dogs.createdAt))
  } catch (e) {
    console.error('getDogs falhou:', e)
    return []
  }
}

async function getNews(): Promise<News[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const { getDb } = await import('@/lib/db')
    const { news } = await import('@/lib/schema')
    const { desc, eq } = await import('drizzle-orm')
    return await getDb()
      .select()
      .from(news)
      .where(eq(news.published, true))
      .orderBy(desc(news.publishedAt))
  } catch (e) {
    console.error('getNews falhou:', e)
    return []
  }
}

export default async function Home() {
  const [dogs, news] = await Promise.all([getDogs(), getNews()])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="conteudo" tabIndex={-1} className="focus:outline-none">
        <DogCarousel dogs={dogs} />
        <DogCatalog dogs={dogs} />
        <AboutSection />
        <NewsSection news={news} />
        <DonationSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}