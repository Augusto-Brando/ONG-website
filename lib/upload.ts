// Upload de imagens: Vercel Blob quando há token; em desenvolvimento, grava em public/uploads.
import { put } from '@vercel/blob'

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

export function isAllowedImage(file: File): boolean {
  return ALLOWED.includes(file.type) && file.size > 0 && file.size <= MAX_BYTES
}

export async function uploadFile(path: string, file: File): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { url } = await put(path, file, { access: 'public' })
    return url
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BLOB_READ_WRITE_TOKEN não configurado')
  }
  const { mkdir, writeFile } = await import('node:fs/promises')
  const { join } = await import('node:path')
  const safe = path.replace(/[^a-zA-Z0-9._-]+/g, '-')
  const dir = join(process.cwd(), 'public', 'uploads')
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, safe), Buffer.from(await file.arrayBuffer()))
  return `/uploads/${safe}`
}
