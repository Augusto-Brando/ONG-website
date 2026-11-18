import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { parseAnimalExtras } from '@/lib/animal-form'
import { getSession, requireArea } from '@/lib/api'
import { dogs } from '@/lib/schema'
import { isAllowedImage, uploadFile } from '@/lib/upload'
import { asc, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

function getUploadFiles(formData: FormData): File[] {
  const files: File[] = []
  for (const f of formData.getAll('photos')) {
    if (f instanceof File && isAllowedImage(f)) files.push(f)
  }
  const legacy = formData.get('photo')
  if (legacy instanceof File && isAllowedImage(legacy)) files.push(legacy)
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
  // Visitante vê só a vitrine; a equipe logada vê todos (inclusive adotados e em tratamento).
  const session = await getSession()
  const rows = session
    ? await db.select().from(dogs).orderBy(asc(dogs.createdAt))
    : await db.select().from(dogs).where(eq(dogs.available, true)).orderBy(asc(dogs.createdAt))
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const auth = await requireArea('animais')
  if (auth instanceof Response) return auth
  const formData = await req.formData()

  const name = formData.get('name') as string
  const breed = (formData.get('breed') as string) || 'Vira-lata'
  const age = formData.get('age') as string
  const weight = (formData.get('weight') as string) || null
  const description = (formData.get('description') as string) || ''
  const observations = (formData.get('observations') as string) || null
  const color = (formData.get('color') as string) || '#F97316'
  const available = formData.get('available') !== 'false'
  const extras = parseAnimalExtras(formData)
  if (!name?.trim() || !age?.trim()) {
    return NextResponse.json({ error: 'Nome e idade são obrigatórios' }, { status: 400 })
  }

  const existingImages = parseExistingImages(formData)

  // Novos uploads.
  const uploadedUrls: string[] = []
  for (const file of getUploadFiles(formData)) {
    const ext = file.name.split('.').pop()
    const url = await uploadFile(`dogs/${slugify(name)}-${Date.now()}-${uploadedUrls.length}.${ext}`, file)
    uploadedUrls.push(url)
  }

  const images = Array.from(new Set([...existingImages, ...uploadedUrls].filter(Boolean)))

  let imageUrl = (formData.get('imageUrl') as string) || ''
  if (!imageUrl || !images.includes(imageUrl)) imageUrl = images[0] || ''

  const db = getDb()
  const [created] = await db
    .insert(dogs)
    .values({ name, breed, age, weight, description, observations, imageUrl, images, color, available, ...extras })
    .returning()

  return NextResponse.json(created, { status: 201 })
}