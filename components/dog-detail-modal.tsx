"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Weight, Calendar, PawPrint, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Dog } from "@/lib/schema"

interface DogDetailModalProps {
  dog: Dog | null
  open: boolean
  onClose: () => void
}

export default function DogDetailModal({ dog, open, onClose }: DogDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!dog) return null

  // Combina imageUrl principal com array de imagens adicionais
  const allImages: string[] = [
    ...(dog.imageUrl ? [dog.imageUrl] : []),
    ...(dog.images?.filter((img) => img && img !== dog.imageUrl) ?? []),
  ]
  if (allImages.length === 0) allImages.push("/placeholder.svg")

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setCurrentImageIndex(0)
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl">
        <div className="max-h-[90vh] overflow-y-auto">
          {/* ── Galeria de imagens ── */}
          <div className="relative w-full aspect-[4/3] bg-muted select-none">
            <img
              key={currentImageIndex}
              src={allImages[currentImageIndex]}
              alt={`${dog.name} - foto ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Gradiente sutil no topo para o X ficar legível */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

            {/* Botão fechar sobreposto */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Navegação de imagens (só aparece com múltiplas fotos) */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Contador de fotos */}
                <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
                  {currentImageIndex + 1} / {allImages.length}
                </div>

                {/* Thumbnails */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 max-w-[85%] overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                        idx === currentImageIndex
                          ? "border-white scale-110 shadow-lg"
                          : "border-white/40 opacity-60 hover:opacity-90"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Ponto de cor da raça */}
            <div
              className="absolute bottom-3 right-3 w-4 h-4 rounded-full border-2 border-white shadow z-10"
              style={{ backgroundColor: dog.color }}
            />
          </div>

          {/* ── Informações ── */}
          <div className="p-6">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-foreground leading-tight">
                  {dog.name}
                </h2>
                <p className="text-muted-foreground mt-0.5">{dog.breed}</p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 text-xs font-semibold"
                style={{
                  backgroundColor: dog.color + "18",
                  color: dog.color,
                  borderColor: dog.color + "55",
                }}
              >
                Disponível
              </Badge>
            </div>

            {/* Dados rápidos */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    Idade
                  </p>
                  <p className="text-sm font-semibold">{dog.age}</p>
                </div>
              </div>
              {dog.weight ? (
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                  <Weight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                      Peso
                    </p>
                    <p className="text-sm font-semibold">{dog.weight}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                  <PawPrint className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                      Raça
                    </p>
                    <p className="text-sm font-semibold">{dog.breed}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Descrição */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <PawPrint className="w-4 h-4" />
                Sobre {dog.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {dog.description}
              </p>
            </div>

            {/* Observações (campo opcional) */}
            {dog.observations && (
              <div className="mb-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">
                  ⚠️ Observações
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                  {dog.observations}
                </p>
              </div>
            )}

            {/* CTA */}
            <Button
              asChild
              className="w-full font-semibold py-6 text-base rounded-xl"
              style={{ backgroundColor: dog.color, borderColor: dog.color }}
            >
              <a
                href={`https://wa.me/5532999611971?text=${encodeURIComponent(
                  `Olá! Vi o(a) ${dog.name} no site e tenho interesse em adotar. Pode me contar mais? 🐾`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Quero Adotar {dog.name}! 🐾
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
