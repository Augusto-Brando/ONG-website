"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import DogDetailModal from "@/components/dog-detail-modal"
import type { Dog } from "@/lib/schema"

export default function DogCarousel({ dogs }: { dogs: Dog[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [modalDog, setModalDog] = useState<Dog | null>(null)

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % dogs.length)
    setCurrentImageIndex(0)
  }
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + dogs.length) % dogs.length)
    setCurrentImageIndex(0)
  }
  if (dogs.length === 0) {
    return (
      <section id="dogs" className="py-20 px-4 text-center text-muted-foreground">
        <p className="text-lg">Nenhum animal disponível no momento. Volte em breve!</p>
      </section>
    )
  }

  const current = dogs[currentIndex]

  
  const allImages: string[] = [
    ...(current.imageUrl ? [current.imageUrl] : []),
    ...(current.images?.filter((img) => img && img !== current.imageUrl) ?? []),
  ]
  if (allImages.length === 0) allImages.push("/placeholder.svg")

  return (
    <>
      <section id="dogs" className="py-0 bg-muted/30">
        {}
        <div className="text-center py-12 px-4 bg-background">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Animais Disponíveis para Adoção
          </h2>
          <p className="text-lg text-muted-foreground">Encontre seu novo melhor amigo</p>
        </div>

        <div className="container py-10 px-4 md:px-8">
          <div className="relative mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                <div className="relative bg-muted">
                  <div className="flex aspect-[4/5] max-h-[720px] min-h-[360px] items-center justify-center sm:aspect-[3/4] lg:aspect-auto lg:h-[620px]">
                    <img
                      src={allImages[currentImageIndex]}
                      alt={current.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto rounded-lg bg-black/35 p-2 backdrop-blur-sm">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 bg-muted transition-all ${
                            idx === currentImageIndex
                              ? "border-white shadow-lg"
                              : "border-white/40 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between p-6 md:p-8">
                  <div>
                    <p className="mb-4 text-sm font-medium text-muted-foreground">
                      {currentIndex + 1} de {dogs.length}
                    </p>
                    <h3 className="mb-2 text-3xl font-bold text-primary md:text-4xl">
                      {current.name}
                    </h3>
                    <p className="text-lg text-foreground/80">{current.breed}</p>
                    <p className="mt-1 text-sm font-medium text-muted-foreground md:text-base">
                      {current.age}
                      {current.weight ? ` · ${current.weight}` : ""}
                    </p>

                    <p className="mt-6 leading-relaxed text-muted-foreground md:text-lg">
                      {current.description}
                    </p>
                  </div>

                  <div className="mt-8 space-y-5">
                    <div className="flex gap-2">
                      {dogs.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentIndex(index)
                            setCurrentImageIndex(0)
                          }}
                          aria-label={`Ir para animal ${index + 1}`}
                          className={`h-2 rounded-full transition-all ${
                            index === currentIndex ? "bg-primary w-8" : "bg-muted-foreground/30 w-2"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                      <Button
                        asChild
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 flex-1"
                        size="lg"
                      >
                        <a
                          href={`https://wa.me/5532999611971?text=${encodeURIComponent(
                            `Olá! Vi o(a) ${current.name} no site e tenho interesse em adotar. Pode me contar mais?`
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
                        className="border-primary text-primary hover:bg-primary/5 font-semibold py-3 px-6 bg-transparent"
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={goToPrev}
              variant="ghost"
              size="icon"
              aria-label="Animal anterior"
              className="absolute left-3 top-[42%] z-10 h-11 w-11 -translate-y-1/2 rounded-full bg-background/90 shadow-md hover:bg-background md:-left-5 md:h-12 md:w-12"
            >
              <ChevronLeft className="h-7 w-7 text-foreground" />
            </Button>
            <Button
              onClick={goToNext}
              variant="ghost"
              size="icon"
              aria-label="Próximo animal"
              className="absolute right-3 top-[42%] z-10 h-11 w-11 -translate-y-1/2 rounded-full bg-background/90 shadow-md hover:bg-background md:-right-5 md:h-12 md:w-12"
            >
              <ChevronRight className="h-7 w-7 text-foreground" />
            </Button>
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
