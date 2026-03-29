import { useRef, useState, useEffect } from 'react'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import JourneyScene from '../components/JourneyScene'
import { useDevicePerformance } from '../hooks/useDevicePerformance'

export default function JourneySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const performance = useDevicePerformance()
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const top = rect.top
      const height = rect.height


      if (top < viewportHeight && top + height > 0) {
        const progress = 1 - (top + height - viewportHeight) / (height + viewportHeight)
        setScrollProgress(Math.max(0, Math.min(1, progress)))
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const phase = scrollProgress < 0.33 ? 0 : scrollProgress < 0.66 ? 1 : 2
  const phases = [
    { title: 'Liftoff from the hub', desc: 'Autonomous drones collect your package and take flight—no traffic, no delays.' },
    { title: 'Touchdown at the pod', desc: 'The drone drops at a secure, climate-controlled pod near you.' },
    { title: 'Ready at the pod', desc: 'Your package is secure in the locker. Pick it up when you get the alert.' },
  ]

  // Calculate entry opacity - fade in during initial scroll
  const entryOpacity = Math.min(1, scrollProgress * 5)

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="relative h-[400vh] w-full"
    >
      {/* Top gradient blend from transition section */}
      <div
        className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-stone-50 to-transparent pointer-events-none z-10"
        style={{ opacity: 1 - entryOpacity }}
      />

      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ opacity: entryOpacity, transition: 'opacity 0.3s ease-out' }}
        >
          <Canvas
            camera={{ position: [0, 3.4, 12.5], fov: 50 }}
            dpr={performance.dpr as [number, number]}
            shadows={performance.shadows}
            gl={{
              antialias: performance.antialias,
              alpha: false,
              powerPreference: 'high-performance',
            }}
            onCreated={({ gl }) => {
              gl.shadowMap.type = THREE.PCFSoftShadowMap
            }}
          >
            <Suspense fallback={null}>
              <JourneyScene scrollProgress={scrollProgress} />
            </Suspense>
          </Canvas>
        </div>

        {/* Progress bar */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden md:block">
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`h-1 w-8 rounded-full transition-all duration-500 ${phase >= i ? 'bg-teal-500' : 'bg-stone-300'
                  }`} />
                <span className={`text-xs uppercase tracking-widest transition-all duration-500 ${phase === i ? 'text-teal-600' : 'text-stone-400'
                  }`}>
                  {i === 0 ? 'Drone' : i === 1 ? 'Pod' : 'Pickup'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Phase info */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-white/95 via-white/70 to-transparent p-8 md:p-12 lg:p-16">
          <div className="max-w-4xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-teal-600">
              Step {phase + 1} of 3
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-stone-800 md:text-5xl lg:text-6xl transition-all duration-500">
              {phases[phase].title}
            </h2>
            <p className="mt-4 max-w-xl text-stone-500 text-lg">
              {phases[phase].desc}
            </p>
          </div>
        </div>

        {/* Interaction hint */}
        <div className="absolute top-8 right-8 z-20 flex items-center gap-2 text-stone-400">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span className="text-xs uppercase tracking-wider">Drag to look around</span>
        </div>
      </div>
    </section>
  )
}
