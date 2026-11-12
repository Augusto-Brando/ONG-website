import { SiteShell } from '@/components/site/SiteShell'
import { HomeHero } from '@/components/site/home/HomeHero'
import { HomeImpacto } from '@/components/site/home/HomeImpacto'
import { HomeAnimais } from '@/components/site/home/HomeAnimais'
import { HomePassos } from '@/components/site/home/HomePassos'
import { HomeCampanha } from '@/components/site/home/HomeCampanha'
import { HomeNoticias } from '@/components/site/home/HomeNoticias'
import { HomeContato } from '@/components/site/home/HomeContato'
import type { News } from '@/lib/schema'

export const dynamic = 'force-dynamic'

/** Notícias publicadas, direto do banco (os números de impacto vêm da API pública). */
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

/**
 * Home do site público: hero, impacto, vitrine, como funciona, campanha + Pix + sócio,
 * notícias e contato. Tudo dentro do `SiteShell` (cabeçalho, rodapé e barra fixa do celular).
 */
export default async function Home() {
  const noticias = await getNews()

  return (
    <SiteShell>
      <HomeHero />
      <HomeImpacto />
      <HomeAnimais />
      <HomePassos />
      <HomeCampanha />
      <HomeNoticias noticias={noticias} />
      <HomeContato />
    </SiteShell>
  )
}
