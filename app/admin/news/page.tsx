'use client'

// Notícias: cadastro com capa, publicação e exclusão. Usa a casca do painel
// (AdminShell) para ter a navegação e o link "pular para o conteúdo".
import { useEffect, useRef, useState } from 'react'
import { Newspaper, Plus, Pencil, Trash2, Check, X, ImagePlus, Eye, EyeOff } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
    else toast.error('Erro ao carregar as notícias.')
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
    <AdminShell
      title="Notícias"
      description={`${items.length} notícia(s) no cadastro`}
      actions={
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Nova notícia
        </Button>
      }
    >
      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Carregando...</div>
      ) : items.length === 0 ? (
        <div className="space-y-4 py-20 text-center">
          <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-muted-foreground">Nenhuma notícia cadastrada ainda.</p>
          <Button onClick={openCreate} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" /> Cadastrar primeira
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="relative aspect-video overflow-hidden bg-muted">
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Newspaper className="h-10 w-10 text-muted-foreground/30" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="line-clamp-2 font-semibold text-foreground">{item.title}</h2>
                  <Badge variant={item.published ? 'default' : 'secondary'} className="shrink-0 text-xs">
                    {item.published ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.publishedAt).toLocaleDateString('pt-BR')}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{item.summary}</p>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1 text-xs"
                    onClick={() => openEdit(item)}
                    aria-label={`Editar notícia ${item.title}`}
                  >
                    <Pencil className="h-3 w-3" aria-hidden="true" /> Editar
                  </Button>
                  {deleteId === item.id ? (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1 px-2 text-xs"
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Confirmar exclusão da notícia ${item.title}`}
                      >
                        <Check className="h-3 w-3" aria-hidden="true" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="px-2"
                        onClick={() => setDeleteId(null)}
                        aria-label={`Cancelar exclusão da notícia ${item.title}`}
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteId(item.id)}
                      aria-label={`Excluir notícia ${item.title}`}
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Notícia' : 'Nova Notícia'}</DialogTitle>
            <DialogDescription>
              As notícias publicadas aparecem na home do site. A imagem de capa é opcional.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Capa */}
            <div className="space-y-2">
              <Label htmlFor="cover-file">Imagem de capa</Label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="block w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted transition-colors hover:border-primary/50"
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Pré-visualização da imagem de capa"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
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
              aria-pressed={form.published}
              className="flex items-center gap-2 text-sm font-medium"
            >
              {form.published ? (
                <Eye className="h-4 w-4 text-primary" aria-hidden="true" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
    </AdminShell>
  )
}
