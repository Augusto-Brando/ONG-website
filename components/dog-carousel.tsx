"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Heart, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import DogDetailModal from "@/components/dog-detail-modal"
import type { Dog } from "@/lib/schema"

export default function DogCarousel({ dogs }: { dogs: Dog[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [liked, setLiked] = useState<number[]>([])
  const [modalDog, setModalDog] = useState<Dog | null>(null)

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % dogs.length)
    setCurrentImageIndex(0)
  }
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + dogs.length) % dogs.length)
    setCurrentImageIndex(0)
  }
  const toggleLike = (id: number) =>
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )

  if (dogs.length === 0) {
    return (
      <section id="dogs" className="py-20 px-4 text-center text-muted-foreground">
        <p className="text-lg">Nenhum animal disponível no momento. Volte em breve!</p>
      </section>
    )
  }

  const current = dogs[currentIndex]
  const isLiked = liked.includes(current.id)

  
  const allImages: string[] = [
    ...(current.imageUrl ? [current.imageUrl] : []),
    ...(current.images?.filter((img) => img && img !== current.imageUrl) ?? []),
  ]
  if (allImages.length === 0) allImages.push("/placeholder.svg")

  return (
    <>
      <section id="dogs" className="py-0">
        {}
        <div className="text-center py-12 px-4 bg-background">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Animais Disponíveis para Adoção
          </h2>
          <p className="text-lg text-muted-foreground">Encontre seu novo melhor amigo</p>
        </div>

        <div className="w-full relative group">
          {}
          <div className="relative w-full aspect-video lg:aspect-auto lg:h-[600px] overflow-hidden">
            <img
              src={allImages[currentImageIndex]}
              alt={current.name}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {}
            {allImages.length > 1 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10 max-h-[70%] overflow-y-auto">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      idx === currentImageIndex
                        ? "border-white scale-105 shadow-lg"
                        : "border-white/40 opacity-60 hover:opacity-90"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {}
          <Button
            onClick={goToPrev}
            variant="ghost"
            size="icon"
            aria-label="Cão anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full z-10
                       w-12 h-12 md:w-16 md:h-16
                       opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 text-black" />
          </Button>
          <Button
            onClick={goToNext}
            variant="ghost"
            size="icon"
            aria-label="Próximo cão"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full z-10
                       w-12 h-12 md:w-16 md:h-16
                       opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-8 h-8 md:w-10 md:h-10 text-black" />
          </Button>

          {}
          <Button
            onClick={() => toggleLike(current.id)}
            variant="ghost"
            size="icon"
            aria-label={isLiked ? "Remover curtida" : "Curtir"}
            className="absolute top-6 right-6 bg-white/80 hover:bg-white rounded-full z-10 w-12 h-12 md:w-14 md:h-14"
          >
            <Heart
              className="w-6 h-6 md:w-8 md:h-8"
              fill={isLiked ? "#EC4899" : "none"}
              stroke={isLiked ? "#EC4899" : "currentColor"}
            />
          </Button>

          {}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {dogs.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setCurrentImageIndex(0)
                }}
                aria-label={`Ir para cão ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-white w-6" : "bg-white/50 w-2"
                }`}
              />
            ))}
          </div>

          {}
          <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 py-8 bg-linear-to-t from-black/80 via-black/40 to-transparent">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {current.name}
                  </h3>
                  <p className="text-lg md:text-xl text-gray-200">{current.breed}</p>
                  <p className="text-sm md:text-base text-gray-300 font-medium mt-0.5">
                    {current.age}
                    {current.weight ? ` · ${current.weight}` : ""}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-full opacity-30 shrink-0"
                  style={{ backgroundColor: current.color }}
                />
              </div>

              {}
              <p className="text-gray-100 mb-5 leading-relaxed text-sm md:text-base line-clamp-2 md:line-clamp-4">
                {current.description}
              </p>

              {}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 flex-1"
                  size="lg"
                >
                  <a
                    href={`https://wa.me/5532999611971?text=${encodeURIComponent(
                      `Olá! Vi o(a) ${current.name} no site e tenho interesse em adotar. Pode me contar mais? 🐾`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Quero adotar {current.name}!
                  </a>
                </Button>
                <Button
                  onClick={() => setModalDog(current)}
                  variant="outline"
                  size="lg"
                  className="border-white/60 text-white hover:bg-white/10 hover:text-white font-semibold py-3 px-6 bg-transparent"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </div>

          {}
          <div className="absolute top-6 left-6 text-sm text-white/80 font-medium z-10">
            {currentIndex + 1} de {dogs.length}
          </div>
        </div>
      </section>

      <DogDetailModal
        dog={modalDog}
        open={!!modalDog}
        onClose={() => setModalDog(null)}
      />
    </>
  )
}
