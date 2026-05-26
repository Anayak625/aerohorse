import React, { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from './hooks/useLenis'

import { ScrollProgress } from './components/ui/ScrollProgress'
import { Header } from './components/ui/Header'
import { Footer } from './components/ui/Footer'

import { HeroSection } from './components/sections/HeroSection'
import { ProductsSection } from './components/sections/ProductsSection'
import { TechnologySection } from './components/sections/TechnologySection'
import { SolutionsSection } from './components/sections/SolutionsSection'
import { MissionSection } from './components/sections/MissionSection'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useLenis()

  useEffect(() => {
    // Sync lenis with GSAP ScrollTrigger
    ScrollTrigger.refresh()
    return () => ScrollTrigger.killAll()
  }, [])

  return (
    <div className="min-h-screen bg-void text-primary antialiased">
      <ScrollProgress />
      <Header />
      <main>
        <HeroSection />
        <ProductsSection />
        <TechnologySection />
        <SolutionsSection />
        <MissionSection />
      </main>
      <Footer />
    </div>
  )
}
