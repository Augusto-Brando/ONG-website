import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireArea } from '@/lib/api'
import { news } from '@/lib/schema'
import { put } from '@vercel/blob'
import { desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

function slugify(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-').slice(0, 40)
}

export async function GET() {
  const db = getDb()
  const all = await db.select().from(news).orderBy(desc(news.publishedAt))
  return NextResponse.json(all)
}

export async function POST(req: Request) {
  const auth = await requireArea('noticias')
  if (auth instanceof Response) return auth
  const formData = await req.formData()

  const title = formData.get('title') as string
  const summary = (formData.get('summary') as string) || ''
  const content = (formData.get('content') as string) || ''
  const published = formData.get('published') !== 'false'

  const publishedAtRaw = formData.get('publishedAt') as string | null
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date()

  let coverImageUrl = (formData.get('coverImageUrl') as string) || ''
  const file = formData.get('cover') as File | null
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const { url } = await put(`news/${slugify(title)}-${Date.now()}.${ext}`, file, { access: 'public' })
    coverImageUrl = url
  }

  const db = getDb()
  const [created] = await db
    .insert(news)
    .values({ title, summary, content, coverImageUrl, published, publishedAt })
    .returning()

  return NextResponse.json(created, { status: 201 })
}