'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Newspaper, Plus, Pencil, Trash2, ArrowLeft, X, Check, ImagePlus, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { News } from '@/lib/schema'

function toDateInput(value: string | Date): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  // yyyy-mm-dd para <input type="date">
  return d.toISOString().slice(0, 10)
}

const emptyForm = {
  title: '',
  summary: '',
  content: '',
  published: true,
  publishedAt: toDateInput(new Date()),
  coverImageUrl: '',
}

export default function AdminNewsPage() {
  const [items, setItems] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<News | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function fetchNews() {
    const res = await fetch('/api/news')
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    fetchNews()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setCoverFile(null)
    setCoverPreview('')
    setOpen(true)
  }

  function openEdit(item: News) {
    setEditing(item)
    setForm({
      title: item.title,
      summary: item.summary,
      content: item.content,
      published: item.published,
      publishedAt: toDateInput(item.publishedAt),
      coverImageUrl: item.coverImageUrl,
    })
    setCoverFile(null)
    setCoverPreview(item.coverImageUrl)
    setOpen(true)
  }

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

    const url = editing ? `/api/news/${editing.id}` : '/api/news'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, body: fd })

    if (res.ok) {
      toast.success(editing ? 'Notícia atualizada!' : 'Notícia cadastrada!')
      setOpen(false)
      fetchNews()
    } else {
      toast.error('Erro ao salvar. Verifique os dados e tente novamente.')
    }
    setSaving(false)
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/news/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Notícia removida.')
      setItems((prev) => prev.filter((n) => n.id !== id))
    } else {
      toast.error('Erro ao remover.')
    }
    setDeleteId(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b border-border bg-background/95 sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-primary leading-none">Notícias</p>
              <p className="text-xs text-muted-foreground">Amor não tem Raça</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Animais</span>
              </Link>
            </Button>
            <Button onClick={openCreate} size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Adicionar</span>
            </Button>
          </div>
        </div>
      </header>

      {}
      <main className="container mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Notícias Cadastradas</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} notícia(s) no cadastro</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Newspaper className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">Nenhuma notícia cadastrada ainda.</p>
            <Button onClick={openCreate} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Cadastrar primeira
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {item.coverImageUrl ? (
                    <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground line-clamp-2">{item.title}</p>
                    <Badge variant={item.published ? 'default' : 'secondary'} className="shrink-0 text-xs">
                      {item.published ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.publishedAt).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => openEdit(item)}>
                      <Pencil className="w-3 h-3" /> Editar
                    </Button>
                    {deleteId === item.id ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1 text-xs px-2"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="px-2" onClick={() => setDeleteId(null)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Notícia' : 'Nova Notícia'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Capa */}
            <div className="space-y-2">
              <Label>Imagem de capa</Label>
              <div
                className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                    <ImagePlus className="w-8 h-8" />
                    <span className="text-sm">Clique para selecionar (opcional)</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Resumo *</Label>
              <Textarea
                id="summary"
                rows={2}
                placeholder="Texto curto exibido no card da Home..."
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo completo</Label>
              <Textarea
                id="content"
                rows={6}
                placeholder="Texto completo da notícia..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedAt">Data de publicação</Label>
              <Input
                id="publishedAt"
                type="date"
                value={form.publishedAt}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
              />
            </div>

            <button
              type="button"
              onClick={() => setForm({ ...form, published: !form.published })}
              className="flex items-center gap-2 text-sm font-medium"
            >
              {form.published ? (
                <Eye className="w-4 h-4 text-primary" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
              {form.published ? 'Ativa (visível na Home)' : 'Inativa (oculta da Home)'}
            </button>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}