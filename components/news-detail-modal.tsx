"use client"

import { Calendar, Newspaper, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import type { News } from "@/lib/schema"

interface NewsDetailModalProps {
  item: News | null
  open: boolean
  onClose: () => void
}

export default function NewsDetailModal({ item, open, onClose }: NewsDetailModalProps) {
  if (!item) return null

  const date = new Date(item.publishedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl">
        <div className="max-h-[90vh] overflow-y-auto">
          {}
          <div className="relative w-full aspect-[16/9] bg-muted">
            {item.coverImageUrl ? (
              <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Newspaper className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {}
          <div className="p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>{date}</span>
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground leading-tight mb-4">{item.title}</DialogTitle>
            <DialogDescription className="sr-only">Notícia completa</DialogDescription>

            {item.summary && (
              <p className="text-base text-foreground/80 font-medium leading-relaxed mb-4">{item.summary}</p>
            )}

            {item.content && (
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {item.content}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}