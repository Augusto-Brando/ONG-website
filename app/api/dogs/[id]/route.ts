import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { dogs } from '@/lib/schema'
import { put, del } from '@vercel/blob'
import { eq } from 'drizzle-orm'

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

function isVercelBlob(url?: string | null) {
  return !!url && (url.includes('vercel-storage.com') || url.includes('public.blob.vercel-storage'))
}

function getUploadFiles(formData: FormData): File[] {
  const files: File[] = []
  for (const f of formData.getAll('photos')) {
    if (f instanceof File && f.size > 0) files.push(f)
  }
  const legacy = formData.get('photo')
  if (legacy instanceof File && legacy.size > 0) files.push(legacy)
  return files
}

function parseExistingImages(formData: FormData): string[] {
  try {
    const raw = (formData.get('existingImages') as string) || '[]'
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((u) => typeof u === 'string' && u) : []
  } catch {
    return []
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dogId = parseInt(id)
  const formData = await req.formData()

  const name = formData.get('name') as string
  const breed = (formData.get('breed') as string) || 'Vira-lata'
  const age = formData.get('age') as string
  const weight = (formData.get('weight') as string) || null
  const description = (formData.get('description') as string) || ''
  const observations = (formData.get('observations') as string) || null
  const color = (formData.get('color') as string) || '#F97316'
  const available = formData.get('available') !== 'false'

  const db = getDb()


  const [current] = await db
    .select({ imageUrl: dogs.imageUrl, images: dogs.images })
    .from(dogs)
    .where(eq(dogs.id, dogId))
  const oldImages = Array.from(
    new Set([current?.imageUrl ?? '', ...((current?.images as string[] | null) ?? [])].filter(Boolean)),
  )

  const existingImages = parseExistingImages(formData)
  const uploadedUrls: string[] = []
  for (const file of getUploadFiles(formData)) {
    const ext = file.name.split('.').pop()
    const { url } = await put(`dogs/${slugify(name)}-${Date.now()}-${uploadedUrls.length}.${ext}`, file, {
      access: 'public',
    })
    uploadedUrls.push(url)
  }

  const images = Array.from(new Set([...existingImages, ...uploadedUrls].filter(Boolean)))

  let imageUrl = (formData.get('imageUrl') as string) || ''
  if (!imageUrl || !images.includes(imageUrl)) imageUrl = images[0] || ''

  const [updated] = await db
    .update(dogs)
    .set({ name, breed, age, weight, description, observations, imageUrl, images, color, available })
    .where(eq(dogs.id, dogId))
    .returning()

  const removed = oldImages.filter((u) => isVercelBlob(u) && !images.includes(u))
  for (const u of removed) {
    try {
      await del(u)
    } catch (error) {
      console.error('Erro ao remover imagem antiga do animal.', error)
    }
  }

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dogId = parseInt(id)
  const db = getDb()

  const [dog] = await db
    .select({ imageUrl: dogs.imageUrl, images: dogs.images })
    .from(dogs)
    .where(eq(dogs.id, dogId))

  await db.delete(dogs).where(eq(dogs.id, dogId))

  const toDelete = Array.from(
    new Set([dog?.imageUrl ?? '', ...((dog?.images as string[] | null) ?? [])].filter(Boolean)),
  ).filter(isVercelBlob)
  for (const u of toDelete) {
    try {
      await del(u)
    } catch (error) {
      console.error('Erro ao remover imagem do animal excluído.', error)
    }
  }

  return NextResponse.json({ success: true })
}
