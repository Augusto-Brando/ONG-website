import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { dogs } from '@/lib/schema'
import { put } from '@vercel/blob'
import { asc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
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

export async function GET() {
  const db = getDb()
  const all = await db.select().from(dogs).orderBy(asc(dogs.createdAt))
  return NextResponse.json(all)
}

export async function POST(req: Request) {
  const formData = await req.formData()

  const name = formData.get('name') as string
  const breed = (formData.get('breed') as string) || 'Vira-lata'
  const age = formData.get('age') as string
  const weight = (formData.get('weight') as string) || null
  const description = (formData.get('description') as string) || ''
  const observations = (formData.get('observations') as string) || null
  const color = (formData.get('color') as string) || '#F97316'
  const available = formData.get('available') !== 'false'

  const existingImages = parseExistingImages(formData)

  // Novos uploads.
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

  const db = getDb()
  const [created] = await db
    .insert(dogs)
    .values({ name, breed, age, weight, description, observations, imageUrl, images, color, available })
    .returning()

  return NextResponse.json(created, { status: 201 })
}