import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireArea } from '@/lib/api'
import { news } from '@/lib/schema'
import { del } from '@vercel/blob'
import { isAllowedImage, uploadFile } from '@/lib/upload'
import { eq } from 'drizzle-orm'

function slugify(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-').slice(0, 40)
}

function isVercelBlob(url?: string | null) {
  return !!url && (url.includes('vercel-storage.com') || url.includes('public.blob.vercel-storage'))
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireArea('noticias')
  if (auth instanceof Response) return auth
  const { id } = await params
  const newsId = parseInt(id)
  const formData = await req.formData()

  const title = formData.get('title') as string
  const summary = (formData.get('summary') as string) || ''
  const content = (formData.get('content') as string) || ''
  const published = formData.get('published') !== 'false'

  const publishedAtRaw = formData.get('publishedAt') as string | null
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date()

  const db = getDb()

  let coverImageUrl = (formData.get('coverImageUrl') as string) || ''
  const file = formData.get('cover') as File | null
  if (file instanceof File && isAllowedImage(file)) {
    const [cur] = await db.select({ coverImageUrl: news.coverImageUrl }).from(news).where(eq(news.id, newsId))
    if (isVercelBlob(cur?.coverImageUrl)) {
      try {
        await del(cur!.coverImageUrl)
      } catch {
      }
    }
    const ext = file.name.split('.').pop()
    const url = await uploadFile(`news/${slugify(title)}-${Date.now()}.${ext}`, file)
    coverImageUrl = url
  }

  const [updated] = await db
    .update(news)
    .set({ title, summary, content, coverImageUrl, published, publishedAt })
    .where(eq(news.id, newsId))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireArea('noticias')
  if (auth instanceof Response) return auth
  const { id } = await params
  const newsId = parseInt(id)
  const db = getDb()

  const [item] = await db.select({ coverImageUrl: news.coverImageUrl }).from(news).where(eq(news.id, newsId))
  await db.delete(news).where(eq(news.id, newsId))

  if (isVercelBlob(item?.coverImageUrl)) {
    try {
      await del(item!.coverImageUrl)
    } catch {
    }
  }

  return NextResponse.json({ success: true })
}