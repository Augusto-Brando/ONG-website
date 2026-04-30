'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Phone, Mail, Heart } from 'lucide-react'
import DogCarousel from '@/components/dog-carousel'
import Header from '@/components/header'
import AboutSection from '@/components/about-section'
import ContactSection from '@/components/contact-section'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <DogCarousel />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
