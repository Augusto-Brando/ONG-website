"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Dog } from "@/lib/schema"

export default function DogCarousel({ dogs }: { dogs: Dog[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [liked, setLiked] = useState<number[]>([])

  const next = () => setCurrentIndex((prev) => (prev + 1) % dogs.length)
  const prev = () => setCurrentIndex((prev) => (prev - 1 + dogs.length) % dogs.length)
  const toggleLike = (id: number) =>
    setLiked((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))

  if (dogs.length === 0) {
    return (
      <section id="dogs" className="py-20 px-4 text-center text-muted-foreground">
        <p className="text-lg">Nenhum animal disponível no momento. Volte em breve!</p>
      </section>
    )
  }

  const current = dogs[currentIndex]
  const isLiked = liked.includes(current.id)

  return (
    <section id="dogs" className="py-0">
      <div className="text-center py-12 px-4 bg-background">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Animais Disponíveis para Adoção
        </h2>
        <p className="text-lg text-muted-foreground">Encontre seu novo melhor amigo</p>
      </div>

      <div className="w-full relative group">
        {/* Image */}
        <div className="relative w-full aspect-video lg:aspect-auto lg:h-150 overflow-hidden">
          <img
            src={current.imageUrl || "/placeholder.svg"}
            alt={current.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Nav buttons */}
        <Button
          onClick={prev}
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 w-12 h-12 md:w-16 md:h-16"
        >
          <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 text-black" />
        </Button>
        <Button
          onClick={next}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 w-12 h-12 md:w-16 md:h-16"
        >
          <ChevronRight className="w-8 h-8 md:w-10 md:h-10 text-black" />
        </Button>

        {/* Like */}
        <Button
          onClick={() => toggleLike(current.id)}
          variant="ghost"
          size="icon"
          className="absolute top-6 right-6 bg-white/80 hover:bg-white rounded-full z-10 w-12 h-12 md:w-14 md:h-14"
        >
          <Heart
            className="w-6 h-6 md:w-8 md:h-8"
            fill={isLiked ? "#EC4899" : "none"}
            stroke={isLiked ? "#EC4899" : "currentColor"}
          />
        </Button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {dogs.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-white w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 py-8 bg-linear-to-t from-black/80 via-black/40 to-transparent">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{current.name}</h3>
                <p className="text-lg md:text-xl text-gray-200 mb-1">{current.breed}</p>
                <p className="text-sm md:text-base text-gray-300 font-medium">
                  {current.age}{current.weight ? ` · ${current.weight}` : ''}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-full opacity-30 shrink-0"
                style={{ backgroundColor: current.color }}
              />
            </div>
            <p className="text-gray-100 mb-6 leading-relaxed text-sm md:text-base">
              {current.description}
            </p>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8"
              size="lg"
            >
              <a
                href={`https://wa.me/5532999611971?text=${encodeURIComponent(`Olá! Vi o(a) ${current.name} no site e tenho interesse em adotar. Pode me contar mais? 🐾`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Quero adotar {current.name}!
              </a>
            </Button>
          </div>
        </div>

        {/* Counter */}
        <div className="absolute top-6 left-6 text-sm text-white/80 font-medium z-10">
          {currentIndex + 1} de {dogs.length}
        </div>
      </div>
    </section>
  )
}
