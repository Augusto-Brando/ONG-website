'use client'

import { PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { Dog } from '@/lib/schema'

export default function DogCatalog({ dogs }: { dogs: Dog[] }) {
  if (dogs.length === 0) return null

  return (
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

        <Carousel
          opts={{ align: 'start', loop: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {dogs.map((dog) => (
              <CarouselItem
                key={dog.id}
                className="pl-4 basis-4/5 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <DogCard dog={dog} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-5" />
          <CarouselNext className="hidden md:flex -right-5" />
        </Carousel>
      </div>
    </section>
  )
}

function DogCard({ dog }: { dog: Dog }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Photo */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {dog.imageUrl ? (
          <img
            src={dog.imageUrl}
            alt={dog.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PawPrint className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        {/* Color dot */}
        <div
          className="absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-white shadow"
          style={{ backgroundColor: dog.color }}
        />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-bold text-foreground text-lg leading-tight">{dog.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {dog.breed} · {dog.age}{dog.weight ? ` · ${dog.weight}` : ''}
          </p>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {dog.description}
        </p>
        <Button
          asChild
          size="sm"
          className="w-full mt-2 font-semibold"
          style={{ backgroundColor: dog.color, borderColor: dog.color }}
        >
          <a
            href={`https://wa.me/5532999611971?text=${encodeURIComponent(`Olá! Vi o(a) ${dog.name} no site e tenho interesse em adotar. Pode me contar mais? 🐾`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Adotar {dog.name}
          </a>
        </Button>
      </div>
    </div>
  )
}
