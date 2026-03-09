import { useRef } from 'react'
import { Suspense } from 'react'
import TransitionDrone from './TransitionDrone'
import { useThrottledScrollProgress } from '../hooks/useScrollProgress'

export default function TransitionSection() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const scrollState = useThrottledScrollProgress(
    () => {
      const el = wrapperRef.current
      if (!el) return { enterProgress: 0, droneProgress: 0 }
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const top = rect.top
      const enterProgress = top >= vh ? 0 : top <= 0 ? 1 : (vh - top) / vh
      const droneProgress = top > 0 ? 0 : Math.min(1, -top / vh)
      return { enterProgress, droneProgress }
    },
    0.004,
    []
  )

  const { enterProgress, droneProgress } = scrollState
  const fadeInOut = droneProgress < 0.5 ? droneProgress * 2 : 1 - (droneProgress - 0.5) * 2
  const bgOpacity = Math.min(1, enterProgress * 2)
  const droneLayerOpacity = droneProgress < 0.08 ? droneProgress / 0.08 : droneProgress > 0.92 ? (1 - droneProgress) / 0.08 : 1

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: '200vh' }}
    >
      <section
        className="sticky top-0 left-0 right-0 h-screen w-full overflow-hidden"
      >
      {/* Gradient overlay for smooth blend */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-b from-stone-50 via-white to-stone-50"
        style={{ opacity: bgOpacity }}
      />
      
      {/* Animated teal accent lines */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"
            style={{
              top: `${20 + i * 15}%`,
              left: '-10%',
              right: '-10%',
              transform: `translateX(${(droneProgress - 0.5) * (i % 2 === 0 ? 100 : -100)}%)`,
              opacity: fadeInOut * 0.6,
              transition: 'transform 0.1s ease-out'
            }}
          />
        ))}
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const baseX = (i * 17) % 100
          const baseY = (i * 23) % 100
          const size = 2 + (i % 3) * 2
          const delay = i * 0.1
          return (
            <div
              key={i}
              className="absolute rounded-full bg-teal-500"
              style={{
                left: `${baseX}%`,
                top: `${baseY}%`,
                width: size,
                height: size,
                opacity: fadeInOut * (0.2 + (i % 5) * 0.1),
                transform: `translateY(${(droneProgress - 0.5) * -200 + Math.sin(delay) * 50}px) scale(${0.5 + droneProgress * 0.5})`,
                transition: 'transform 0.15s ease-out, opacity 0.2s ease-out'
              }}
            />
          )
        })}
      </div>

      {/* Centered transition content */}
      <div 
        className="sticky top-0 h-screen w-full flex items-center justify-center relative z-10"
      >
<div 
        className="text-center max-w-3xl px-4 sm:px-6 md:px-8"
      >
          <div 
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-4 py-2 backdrop-blur-sm transition-all duration-700"
            style={{
              opacity: enterProgress > 0.1 ? 1 : 0,
              transform: enterProgress > 0.1 ? 'translateY(0)' : 'translateY(8px)',
            }}
          >
            <span className="text-[10px] font-semibold text-teal-600/80 tracking-[0.2em]">
              YOUR PACKAGE'S JOURNEY
            </span>
            <span className="text-stone-300">·</span>
            <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-wider text-teal-700">
              Scroll to follow along
            </span>
          </div>
          
          <h2 
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-stone-900 transition-all duration-700"
            style={{
              opacity: enterProgress > 0.2 ? 1 : 0,
              transform: enterProgress > 0.2 ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            One package.
            <span 
              className="block gradient-text mt-1"
              style={{
                opacity: enterProgress > 0.35 ? 1 : 0,
                transform: enterProgress > 0.35 ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
              }}
            >
              One clear path.
            </span>
          </h2>
          
          <p 
            className="mt-6 text-lg text-stone-600 max-w-xl mx-auto italic transition-all duration-700"
            style={{
              opacity: enterProgress > 0.5 ? 1 : 0,
              transform: enterProgress > 0.5 ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            Hub → drone → pod → your door. Watch the flight, the drop, and the moment it lands.
          </p>

          {/* Story progress bars with labels — fill as drone moves */}
          <div 
            className="mt-14 flex flex-col items-center gap-4 relative z-10 transition-all duration-500"
            style={{
              opacity: enterProgress > 0.4 ? 1 : 0,
            }}
          >
            <div className="flex items-center gap-4 md:gap-6">
              {[
                { label: 'Launch', threshold: 0.3 },
                { label: 'In flight', threshold: 0.5 },
                { label: 'Touchdown', threshold: 0.7 },
              ].map(({ label, threshold }, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-1.5 w-10 rounded-full bg-stone-200 overflow-hidden">
                    <div 
                    className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: droneProgress > threshold ? '100%' : '0%',
                    }}
                  />
                  </div>
                  <span 
                    className={`text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                      droneProgress > threshold ? 'text-teal-600' : 'text-stone-300'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-xs uppercase tracking-widest text-stone-400">
              Scroll to continue
            </span>
          </div>
        </div>
      </div>

      {/* Drone (GLTF) passing from left to right — above gradient so it's visible */}
      <div
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          opacity: droneLayerOpacity,
          pointerEvents: 'none',
        }}
        aria-hidden
      >
        <Suspense fallback={null}>
          <TransitionDrone progress={droneProgress} />
        </Suspense>
      </div>

      {/* Bottom gradient blend into journey section */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-stone-50 to-transparent pointer-events-none"
        style={{ opacity: Math.max(0, (droneProgress - 0.6) * 2.5) }}
      />
    </section>
    </div>
  )
}
