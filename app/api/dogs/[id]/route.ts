import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { dogs } from '@/lib/schema'
import { put } from '@vercel/blob'
import { eq } from 'drizzle-orm'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const formData = await req.formData()

  const name = formData.get('name') as string
  const breed = (formData.get('breed') as string) || 'Vira-lata'
  const age = formData.get('age') as string
  const weight = (formData.get('weight') as string) || null
  const description = (formData.get('description') as string) || ''
  const observations = (formData.get('observations') as string) || null
  const color = (formData.get('color') as string) || '#F97316'
  const available = formData.get('available') !== 'false'
  const file = formData.get('photo') as File | null

  let imageUrl = (formData.get('imageUrl') as string) || ''

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const { url } = await put(`dogs/${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${ext}`, file, {
      access: 'public',
    })
    imageUrl = url
  }

  const db = getDb()
  const [updated] = await db
    .update(dogs)
    .set({ name, breed, age, weight, description, observations, imageUrl, color, available })
    .where(eq(dogs.id, parseInt(id)))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  await db.delete(dogs).where(eq(dogs.id, parseInt(id)))
  return NextResponse.json({ success: true })
}
