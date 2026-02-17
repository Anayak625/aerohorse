import { Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene3D from './Scene3D'
import { TextReveal, LineReveal, FadeIn } from './TextReveal'

export default function Hero() {
  const [mouse, setMouse] = useState({ normalizedX: 0, normalizedY: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = -(e.clientY / window.innerHeight) * 2 + 1
    setMouse({ normalizedX: x, normalizedY: y })
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const progress = Math.min(window.scrollY / window.innerHeight, 1)
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-[200vh] w-full"
      onMouseMove={onMouseMove}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas
            camera={{ position: [0, 5, 12], fov: 50 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            shadows
          >
            <Suspense fallback={null}>
              <Scene3D mouse={mouse} scrollProgress={scrollProgress} />
            </Suspense>
          </Canvas>
        </div>
        
        {/* Content overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-16 lg:px-24"
          style={{ opacity: 1 - scrollProgress * 1.5 }}
        >
          <div className="max-w-5xl">
            <LineReveal delay={0.2}>
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-teal-600">
                The future of delivery
              </p>
            </LineReveal>
            
            <h1 className="text-6xl font-bold leading-[0.95] tracking-tight text-stone-800 md:text-8xl lg:text-9xl">
              <TextReveal className="block" delay={0.3} stagger={0.05}>
                From sky
              </TextReveal>
              <TextReveal className="block gradient-text" delay={0.5} stagger={0.05}>
                to your door.
              </TextReveal>
            </h1>
            
            <FadeIn delay={0.8} className="mt-10 max-w-xl">
              <p className="text-lg text-stone-500 md:text-xl leading-relaxed">
                Autonomous drones deliver to smart pods every 500m. Local riders complete the final mile. 
                <span className="text-stone-700"> Faster. Cleaner. Smarter.</span>
              </p>
            </FadeIn>
            
            <FadeIn delay={1} className="mt-14 flex flex-wrap gap-5 pointer-events-auto">
              <a
                href="#journey"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-teal-600 px-8 py-4 text-sm font-medium text-white shadow-lg shadow-teal-600/20 transition-all duration-300 hover:bg-teal-700 hover:shadow-teal-600/30 hover:scale-105"
                data-cursor-hover
              >
                <span className="relative z-10">Experience the journey</span>
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#contact"
                className="inline-flex items-center rounded-full border border-stone-300 bg-white/80 px-8 py-4 text-sm font-medium text-stone-700 transition-all duration-300 hover:border-stone-400 hover:bg-white hover:scale-105"
                data-cursor-hover
              >
                Partner with us
              </a>
            </FadeIn>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div
          className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-3"
          style={{ opacity: 1 - scrollProgress * 3 }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400">Scroll to explore</span>
          <div className="h-12 w-px bg-gradient-to-b from-stone-400 to-transparent" />
        </div>
      </div>
    </section>
  )
}
