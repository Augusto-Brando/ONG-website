'use client'

import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { News } from '@/lib/schema'

export function toDateInput(value: string | Date): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function emptyForm() {
  return {
    title: '',
    summary: '',
    content: '',
    published: true,
    publishedAt: toDateInput(new Date()),
    coverImageUrl: '',
  }
}

export function NewsDialog({
  open,
  onOpenChange,
  news,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  news: News | null
  onSaved: () => void
}) {
  const [form, setForm] = useState(emptyForm)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (news) {
      setForm({
        title: news.title,
        summary: news.summary,
        content: news.content,
        published: news.published,
        publishedAt: toDateInput(news.publishedAt),
        coverImageUrl: news.coverImageUrl,
      })
      setCoverPreview(news.coverImageUrl)
    } else {
      setForm(emptyForm())
      setCoverPreview('')
    }
    setCoverFile(null)
  }, [open, news])

  function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
    if (coverFile) fd.append('cover', coverFile)

    try {
      const res = await fetch(news ? `/api/news/${news.id}` : '/api/news', {
        method: news ? 'PUT' : 'POST',
        body: fd,
      })
      if (res.ok) {
        toast.success(news ? 'Notícia atualizada!' : 'Notícia cadastrada!')
        onOpenChange(false)
        onSaved()
      } else {
        toast.error('Erro ao salvar. Verifique os dados e tente novamente.')
      }
    } catch {
      toast.error('Falha de conexão ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{news ? 'Editar notícia' : 'Nova notícia'}</DialogTitle>
          <DialogDescription>
            As notícias publicadas aparecem na home do site. A imagem de capa é opcional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="cover-file">Imagem de capa</Label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="block w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted transition-colors hover:border-primary/50"
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Pré-visualização da imagem de capa" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                  <ImagePlus className="h-8 w-8" aria-hidden="true" />
                  <span className="text-sm">Clique para selecionar (opcional)</span>
                </span>
              )}
            </button>
            <input
              ref={fileRef}
              id="cover-file"
              type="file"
              accept="image/*"
              tabIndex={-1}
              className="sr-only"
              onChange={handleCover}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="news-title">Título *</Label>
            <Input id="news-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="news-summary">Resumo *</Label>
            <Textarea
              id="news-summary"
              rows={2}
              placeholder="Texto curto exibido no card da Home..."
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="news-content">Conteúdo completo</Label>
            <Textarea
              id="news-content"
              rows={6}
              placeholder="Texto completo da notícia..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="news-publishedAt">Data de publicação</Label>
            <Input
              id="news-publishedAt"
              type="date"
              value={form.publishedAt}
              onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            />
          </div>

          <button
            type="button"
            onClick={() => setForm({ ...form, published: !form.published })}
            aria-pressed={form.published}
            className="flex min-h-11 items-center gap-2 text-sm font-medium"
          >
            {form.published ? (
              <Eye className="h-4 w-4 text-primary" aria-hidden="true" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            )}
            {form.published ? 'Ativa (visível na Home)' : 'Inativa (oculta da Home)'}
          </button>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Salvando...' : news ? 'Salvar alterações' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
