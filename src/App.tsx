import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useLenis } from './hooks/useLenis'
import Cursor from './components/Cursor'
import Header from './components/Header'
import Hero from './components/Hero'
import TransitionSection from './components/TransitionSection'
import JourneyScene from './components/JourneyScene'
import StorySection from './sections/StorySection'
import Benefits from './sections/Benefits'
import Technology from './sections/Technology'
import CTA from './sections/CTA'
import Footer from './components/Footer'

function JourneySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const sectionHeight = rect.height
      
      if (rect.top < viewportHeight && rect.bottom > 0) {
        const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (sectionHeight + viewportHeight)))
        setScrollProgress(progress)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="relative h-[200vh] w-full bg-stone-50"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Canvas
          camera={{ position: [0, 6, 12], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <JourneyScene scrollProgress={scrollProgress} />
          </Suspense>
        </Canvas>
      </div>
    </section>
  )
}

function App() {
  useLenis()

  return (
    <>
      <Cursor />
      <div className="noise-overlay" aria-hidden />
      <Header />
      <main>
        <Hero />
        <TransitionSection />
        <JourneySection />
        <StorySection />
        <Benefits />
        <Technology />
        <CTA />
      </main>
      <Footer />
    </>
  )
}

export default App
