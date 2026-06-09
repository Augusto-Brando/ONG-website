"use client"

import { useState } from "react"
import { PawPrint, Images } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import DogDetailModal from "@/components/dog-detail-modal"
import type { Dog } from "@/lib/schema"

export default function DogCatalog({ dogs }: { dogs: Dog[] }) {
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null)

  if (dogs.length === 0) return null

  return (
    <>
      <section className="py-16 px-4 md:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              Conheça Todos os Nossos Animais
            </h2>
            <p className="text-muted-foreground">
              Cada um esperando por um lar cheio de amor
            </p>
          </div>

          {/* Padding lateral para os botões de nav não cortarem */}
          <div className="px-8 md:px-10">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {dogs.map((dog) => (
                  <CarouselItem
                    key={dog.id}
                    className="pl-4 basis-4/5 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <DogCard dog={dog} onClick={() => setSelectedDog(dog)} />
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Botões visíveis em todos os tamanhos de tela */}
              <CarouselPrevious className="-left-8 md:-left-10 shadow-md bg-background border-border hover:bg-muted" />
              <CarouselNext className="-right-8 md:-right-10 shadow-md bg-background border-border hover:bg-muted" />
            </Carousel>
          </div>
        </div>
      </section>

      <DogDetailModal
        dog={selectedDog}
        open={!!selectedDog}
        onClose={() => setSelectedDog(null)}
      />
    </>
  )
}

function DogCard({ dog, onClick }: { dog: Dog; onClick: () => void }) {
  // Conta fotos extras além da capa
  const extraPhotos = dog.images?.filter((img) => img && img !== dog.imageUrl).length ?? 0

  return (
    <button
      onClick={onClick}
      className="group rounded-2xl overflow-hidden border border-border bg-card shadow-sm
                 hover:shadow-md hover:-translate-y-1 transition-all duration-200
                 h-full flex flex-col w-full text-left cursor-pointer
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Foto */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {dog.imageUrl ? (
          <img
            src={dog.imageUrl}
            alt={dog.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PawPrint className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Ponto de cor */}
        <div
          className="absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-white shadow"
          style={{ backgroundColor: dog.color }}
        />

        {/* Badge de fotos extras */}
        {extraPhotos > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <Images className="w-3 h-3" />
            +{extraPhotos}
          </div>
        )}

        {/* Overlay "Ver Detalhes" ao hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1.5 rounded-full">
            Ver Detalhes
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-bold text-foreground text-lg leading-tight">{dog.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {dog.breed} · {dog.age}
            {dog.weight ? ` · ${dog.weight}` : ""}
          </p>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{dog.description}</p>
        <div
          className="mt-2 text-xs font-semibold text-center py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: dog.color + "18",
            color: dog.color,
            border: `1px solid ${dog.color}44`,
          }}
        >
          Adotar {dog.name} →
        </div>
      </div>
    </button>
  )
}
