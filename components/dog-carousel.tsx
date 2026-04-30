"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

const dogs = [
  {
    id: 1,
    name: "Gisele",
    breed: "Vira-lata",
    age: "2 anos",
    description: "Gisele é uma cadela fêmea de porte médio, super brincalhona e cheia de energia!",
    image: "/images/cachorro11.jpg",
    color: "#F97316",
  },
  {
    id: 2,
    name: "Pintadinha",
    breed: "Vira-lata",
    age: "6 anos",
    description: "Pintadinha é uma cadela fêmea de porte grande, tranquila e muito amorosa.",
    image: "/images/cachorro13.jpg",
    color: "#8B5CF6",
  },
  {
    id: 3,
    name: "Uguinho",
    breed: "Vira-lata",
    age: "2 anos",
    description: "Uguinho é um cachorro macho de porte médio, alegre e cheio de vida!",
    image: "/images/cachorro9.jpg",
    color: "#EC4899",
  },
  {
    id: 4,
    name: "Toddynho",
    breed: "Vira-lata",
    age: "10 meses",
    description: "Toddynho é um filhote macho de porte médio, super fofo e carinhoso!",
    image: "/images/cachorro12.jpg",
    color: "#06B6D4",
  },
  {
    id: 5,
    name: "Zezinho",
    breed: "Vira-lata",
    age: "2 anos",
    description: "Zezinho é um cachorro macho de porte médio, elegante e muito leal.",
    image: "/images/cachorro8.jpg",
    color: "#F97316",
  },
  {
    id: 6,
    name: "Panqueca",
    breed: "Vira-lata",
    age: "10 meses",
    description: "Panqueca é uma cadela fêmea de porte médio, brincalhona e super divertida!",
    image: "/images/cachorro10.jpg",
    color: "#8B5CF6",
  },
  {
    id: 7,
    name: "Scooby",
    breed: "Vira-lata",
    age: "3 anos",
    description: "Scooby é um cachorro macho de porte médio, dócil e protetor.",
    image: "/images/cachorro7.jpg",
    color: "#EC4899",
  },
  {
    id: 8,
    name: "Sophia",
    breed: "Labrador",
    age: "5 anos",
    description: "Sophia é uma cadela fêmea de porte grande, calma e muito companheira.",
    image: "/images/cachorro14.jpg",
    color: "#06B6D4",
  },
  {
    id: 9,
    name: "Dani",
    breed: "Vira-lata",
    age: "8 meses",
    description: "Dani é uma cadela fêmea jovem, cheia de energia e amor para dar!",
    image: "/images/cachorro1.jpg",
    color: "#F97316",
  },
  {
    id: 10,
    name: "Lóri",
    breed: "Vira-lata",
    age: "4 anos",
    description: "Lóri é uma cadela fêmea de porte médio, doce e muito companheira!",
    image: "/images/cachorro5.jpg",
    color: "#8B5CF6",
  },
  {
    id: 11,
    name: "Letícia",
    breed: "Vira-lata",
    age: "5 anos",
    description: "Letícia é uma cadela fêmea de porte pequeno, carinhosa e fiel.",
    image: "/images/cachorro3.jpg",
    color: "#EC4899",
  },
  {
    id: 12,
    name: "Branca",
    breed: "Vira-lata",
    age: "2 anos",
    description: "Branca é uma cadela fêmea de porte médio, tranquila e amorosa.",
    image: "/images/cachorro2.jpg",
    color: "#06B6D4",
  },
  {
    id: 13,
    name: "Chico",
    breed: "Vira-lata",
    age: "1 ano",
    description: "Chico é um cachorro macho de porte médio, brincalhão e cheio de personalidade!",
    image: "/images/cachorro6.jpg",
    color: "#F97316",
  },
  {
    id: 14,
    name: "Bidu",
    breed: "Vira-lata",
    age: "2 anos",
    description: "Bidu é um cachorro macho de porte médio, alegre e muito amigável!",
    image: "/images/cachorro4.jpg",
    color: "#8B5CF6",
  },
]

const cats = [
  {
    id: 5,
    name: "Mia",
    breed: "Siamês",
    age: "2 anos",
    description: "Mia é elegante e carinhosa. Adora receber atenção!",
    image: "/siamese-cat-beautiful-portrait.jpg",
    color: "#F97316",
  },
  {
    id: 6,
    name: "Thor",
    breed: "Maine Coon",
    age: "3 anos",
    description: "Thor é imponente e gentil. Um gigante de coração mole.",
    image: "/maine-coon-cat-majestic.jpg",
    color: "#8B5CF6",
  },
  {
    id: 7,
    name: "Nina",
    breed: "Persa",
    age: "1 ano",
    description: "Nina é tranquila e sofisticada. Perfeita para ambientes calmos.",
    image: "/persian-cat-fluffy-white.jpg",
    color: "#EC4899",
  },
  {
    id: 8,
    name: "Felix",
    breed: "Vira-lata",
    age: "4 anos",
    description: "Felix é independente e brincalhão. Adora explorar!",
    image: "/tabby-cat-playful-orange.jpg",
    color: "#06B6D4",
  },
]

export default function DogCarousel() {
  const [activeTab, setActiveTab] = useState<"dogs" | "cats">("dogs")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [liked, setLiked] = useState<number[]>([])

  const animals = activeTab === "dogs" ? dogs : cats
  const currentAnimal = animals[currentIndex]

  const switchTab = (tab: "dogs" | "cats") => {
    setActiveTab(tab)
    setCurrentIndex(0)
  }

  const next = () => setCurrentIndex((prev) => (prev + 1) % animals.length)
  const prev = () => setCurrentIndex((prev) => (prev - 1 + animals.length) % animals.length)

  const toggleLike = (id: number) => {
    setLiked((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const isLiked = liked.includes(currentAnimal.id)

  return (
    <section id="dogs" className="py-0">
      <div className="text-center py-12 px-4 bg-background">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          {activeTab === "dogs" ? "Cães" : "Gatos"} Disponíveis para Adoção
        </h2>
        <p className="text-lg text-muted-foreground mb-6">Encontre seu novo melhor amigo</p>

        <div className="flex justify-center gap-2">
          <Button
            onClick={() => switchTab("dogs")}
            variant={activeTab === "dogs" ? "default" : "outline"}
            size="lg"
            className="px-8 font-semibold"
          >
            Cães
          </Button>
          <Button
            onClick={() => switchTab("cats")}
            variant={activeTab === "cats" ? "default" : "outline"}
            size="lg"
            className="px-8 font-semibold"
          >
            Gatos
          </Button>
        </div>
      </div>

      <div className="w-full relative group">
        {/* Image carousel - full width and taller */}
        <div className="relative w-full aspect-video lg:aspect-auto lg:h-[600px] overflow-hidden">
          <img
            src={currentAnimal.image || "/placeholder.svg"}
            alt={currentAnimal.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Navigation Buttons */}
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

        {/* Like Button */}
        <Button
          onClick={() => toggleLike(currentAnimal.id)}
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

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {animals.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-white w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 py-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{currentAnimal.name}</h3>
                <p className="text-lg md:text-xl text-gray-200 mb-1">{currentAnimal.breed}</p>
                <p className="text-sm md:text-base text-gray-300 font-medium">{currentAnimal.age}</p>
              </div>
              <div
                className="w-12 h-12 rounded-full opacity-30 flex-shrink-0"
                style={{ backgroundColor: currentAnimal.color }}
              />
            </div>
            <p className="text-gray-100 mb-6 leading-relaxed text-sm md:text-base">{currentAnimal.description}</p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8"
              size="lg"
            >
              Quero Adotar!
            </Button>
          </div>
        </div>

        {/* Counter */}
        <div className="absolute top-6 left-6 text-sm text-white/80 font-medium z-10">
          {currentIndex + 1} de {animals.length}
        </div>
      </div>
    </section>
  )
}
