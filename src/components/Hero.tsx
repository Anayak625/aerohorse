import { Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene3D, { type HoverTarget } from './Scene3D'
import { TextReveal, LineReveal, FadeIn } from './TextReveal'

export default function Hero() {
  const [mouse, setMouse] = useState({ normalizedX: 0, normalizedY: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [hoveredTarget, setHoveredTarget] = useState<HoverTarget>(null)
  const [focusDroneUntil, setFocusDroneUntil] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = -(e.clientY / window.innerHeight) * 2 + 1
    setMouse({ normalizedX: x, normalizedY: y })
  }, [])

  useEffect(() => {
    const onScroll = () => {
      // Progress 0→1 over full hero height (220vh) so scroll fully drives drone along path
      const heroHeight = 2.2 * window.innerHeight
      const progress = Math.min(1, window.scrollY / heroHeight)
      setScrollProgress(progress)
    }
    onScroll() // set initial value
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleDroneClick = useCallback((clockSeconds: number) => {
    setFocusDroneUntil(clockSeconds + 3)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-[250vh] w-full"
      onMouseMove={onMouseMove}
      data-cursor-hover={hoveredTarget != null ? '' : undefined}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          data-cursor-hover={hoveredTarget != null ? '' : undefined}
        >
          <Canvas
            camera={{ position: [0, 5, 12], fov: 50 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            shadows
          >
            <Suspense fallback={null}>
              <Scene3D
                mouse={mouse}
                scrollProgress={scrollProgress}
                onHoverChange={setHoveredTarget}
                onDroneClick={handleDroneClick}
                focusDroneUntil={focusDroneUntil}
              />
            </Suspense>
          </Canvas>
        </div>
        
        {/* Content overlay — centered on screen, drone appears above in 3D */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6 sm:px-8 md:px-12 transition-[opacity,transform] duration-500 ease-out"
          style={{
            opacity: Math.max(0, 1 - scrollProgress / 0.2),
            transform: `translateY(${-Math.min(1, scrollProgress / 0.2) * 48}px)`,
            visibility: scrollProgress >= 0.2 ? 'hidden' : 'visible',
          }}
        >
          <div className="max-w-4xl mx-auto">
            <LineReveal delay={0.2}>
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-teal-600">
                The future of delivery
              </p>
            </LineReveal>
            
            <h1 className="relative z-10 text-5xl font-bold leading-[0.88] tracking-tight text-stone-800 sm:text-6xl md:text-7xl lg:text-8xl [&>div]:block [&>div]:leading-[0.88] [&>div:first-child]:-mb-[0.08em] drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)]" style={{ textShadow: '0 2px 12px rgba(255,255,255,0.85), 0 1px 3px rgba(0,0,0,0.06)' }}>
              <TextReveal className="block" delay={0.3} stagger={0.05}>
                From sky
              </TextReveal>
              <TextReveal className="block gradient-text" delay={0.5} stagger={0.05}>
                to your door.
              </TextReveal>
            </h1>
            
            <FadeIn delay={0.8} className="max-w-xl mx-auto">
              <p className="text-base text-stone-600 md:text-lg leading-relaxed drop-shadow-sm" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
                Autonomous drones deliver to smart pods every 500m. Local riders complete the final mile. 
                <span className="text-stone-800 font-medium"> Faster. Cleaner. Smarter.</span>
              </p>
            </FadeIn>
            
            <FadeIn delay={1} className="mt-6 flex flex-wrap gap-4 justify-center pointer-events-auto">
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
        
        

        {/* Scroll progress bar — shows drone position along path */}
        <div
          className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 md:flex flex-col items-center gap-2"
          style={{ opacity: 0.5 + (1 - scrollProgress) * 0.5 }}
        >
          <span className="text-[9px] uppercase tracking-widest text-stone-400 whitespace-nowrap -rotate-90 origin-center translate-y-8">
            Scroll to move drone
          </span>
          <div className="h-32 w-1 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="w-full bg-teal-500 rounded-full transition-all duration-150 ease-out"
              style={{ height: `${scrollProgress * 100}%`, marginTop: 'auto' }}
            />
          </div>
          <span className="text-[9px] text-stone-400 tabular-nums">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-3"
          style={{ opacity: 1 - scrollProgress * 2.5 }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 text-center max-w-[200px]">
            {hoveredTarget
              ? 'Click drone to follow camera · At 20% scroll, drone view starts automatically'
              : 'Hover drone or pods · At 20% scroll, view from drone until 65%'}
          </span>
          <div className="h-12 w-px bg-gradient-to-b from-stone-400 to-transparent" />
        </div>
        
        {/* Bottom gradient fade for smooth transition */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-stone-50 via-stone-50/80 to-transparent pointer-events-none z-20"
          style={{ 
            opacity: Math.min(1, scrollProgress * 2),
          }}
        />
      </div>
    </section>
  )
}
