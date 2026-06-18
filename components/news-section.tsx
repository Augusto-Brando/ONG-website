"use client"

import { useState } from "react"
import { Calendar, Newspaper, ArrowRight } from "lucide-react"
import NewsDetailModal from "@/components/news-detail-modal"
import type { News } from "@/lib/schema"

export default function NewsSection({ news }: { news: News[] }) {
  const [selected, setSelected] = useState<News | null>(null)

  const visible = news.filter((n) => n.published)
  if (visible.length === 0) return null

  return (
    <>
      <section id="news" className="py-20 px-4 md:px-8 bg-background">
        <div className="container mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">Notícias</h2>
            <p className="text-muted-foreground">Fique por dentro das novidades da nossa ONG</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((item) => (
              <NewsCard key={item.id} item={item} onClick={() => setSelected(item)} />
            ))}
          </div>
        </div>
      </section>

      <NewsDetailModal item={selected} open={!!selected} onClose={() => setSelected(null)} />
    </>
  )
}

function NewsCard({ item, onClick }: { item: News; onClick: () => void }) {
  const date = new Date(item.publishedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return (
    <button
      onClick={onClick}
      className="group rounded-2xl overflow-hidden border border-border bg-card shadow-sm
                 hover:shadow-md hover:-translate-y-1 transition-all duration-200
                 h-full flex flex-col w-full text-left cursor-pointer
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {item.coverImageUrl ? (
          <img
            src={item.coverImageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{date}</span>
        </div>
        <h3 className="font-bold text-foreground text-lg leading-tight line-clamp-2">{item.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{item.summary}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Ver mais
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  )
}