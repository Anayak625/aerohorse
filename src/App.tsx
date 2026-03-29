import { Suspense, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { LenisProvider } from './context/LenisContext'
import { preloadWebGLModels } from './constants/webglAssets'
import { CanvasLoadOverlay } from './components/CanvasLoadOverlay'
import { useResponsiveCanvasFov } from './hooks/useResponsiveCanvasFov'
import Cursor from './components/Cursor'
import Header from './components/Header'
import Hero from './components/Hero'
import TransitionSection from './components/TransitionSection'
import JourneyScene from './components/JourneyScene'
import DeliveryReceipt from './components/DeliveryReceipt'
import StorySection from './sections/StorySection'
import Benefits from './sections/Benefits'
import Technology from './sections/Technology'
import PodNetwork from './sections/PodNetwork'
import CTA from './sections/CTA'
import Footer from './components/Footer'
import { useThrottledScrollProgress } from './hooks/useScrollProgress'
import { useDevicePerformance } from './hooks/useDevicePerformance'

// Parcel lands early in section so "landed" + receipt get most of the scroll; How it works appears only after.
const JOURNEY_DRONE_END = 0.65
const PARCEL_DROP_END = 0.88
const STICK_SCROLL_START = 0.32 // raw scroll where drone reaches end
const STICK_SCROLL_END = 0.42   // parcel lands here; raw 0.42→1 = long hold on receipt view

function stickScrollToProgress(raw: number): number {
  if (raw <= STICK_SCROLL_START) {
    return (raw / STICK_SCROLL_START) * JOURNEY_DRONE_END
  }
  if (raw <= STICK_SCROLL_END) {
    return JOURNEY_DRONE_END + ((raw - STICK_SCROLL_START) / (STICK_SCROLL_END - STICK_SCROLL_START)) * (PARCEL_DROP_END - JOURNEY_DRONE_END)
  }
  return PARCEL_DROP_END + ((raw - STICK_SCROLL_END) / (1 - STICK_SCROLL_END)) * (1 - PARCEL_DROP_END)
}

function JourneySection() {
  const performance = useDevicePerformance()
  const journeyFov = useResponsiveCanvasFov(50)
  const sectionRef = useRef<HTMLElement>(null)
  const scrollProgress = useThrottledScrollProgress(
    () => {
      const el = sectionRef.current
      if (!el) return 0
      const rect = el.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const sectionHeight = rect.height
      if (rect.top >= viewportHeight || rect.bottom <= 0) return 0
      const raw = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (sectionHeight + viewportHeight)))
      return stickScrollToProgress(raw)
    },
    0.004,
    []
  )

  const narrativePhase =
    scrollProgress < 0.35 ? 0 : scrollProgress < 0.6 ? 1 : 2
  const narrativeLines = [
    'The drone leaves the hub. Autopilot on, route locked in.',
    'Across the sky. Your package is under the drone, flying to the pod.',
    'Parcel off the drone. Into the pod. Delivered.',
  ]
  const phaseLabels = ['Hub', 'In flight', 'Delivered']
  // Crossfade: show current and next line for smooth transition
  const narrativeOpacity = Math.min(1, scrollProgress * 4)

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="relative h-[320vh] sm:h-[380vh] md:h-[420vh] w-full bg-stone-50"
    >
      <div className="sticky top-0 h-[100dvh] min-h-[100svh] w-full overflow-hidden relative isolate">
        <Canvas
          className="absolute inset-0 z-0 h-full w-full"
          camera={{ position: [0, 6, 12], fov: journeyFov, near: 0.1, far: 200 }}
          dpr={performance.dpr as [number, number]}
          gl={{ antialias: performance.antialias, alpha: false, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <JourneyScene scrollProgress={scrollProgress} />
          </Suspense>
        </Canvas>
        <CanvasLoadOverlay />

        {/* Delivery Receipt - materializes when parcel lands */}
        <DeliveryReceipt scrollProgress={scrollProgress} />

        {/* Story arc: Hub — Transit — Delivery */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-10 md:px-12 md:pb-14"
          aria-live="polite"
        >
          <div className="max-w-2xl border-l-2 border-teal-500/30 pl-3 sm:pl-5 md:pl-6">
            {/* Step counter */}
            <p
              className="text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400 mb-4 transition-opacity duration-500"
              style={{ opacity: narrativeOpacity }}
            >
              Step {narrativePhase + 1} of 3 · Your delivery
            </p>

            {/* Phase labels with connecting line */}
            <div className="mb-6 flex items-center gap-2">
              {phaseLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold uppercase tracking-widest transition-all duration-500 ${narrativePhase === i
                      ? 'text-teal-600'
                      : narrativePhase > i
                        ? 'text-teal-500/70'
                        : 'text-stone-300'
                      }`}
                  >
                    {label}
                  </span>
                  {i < phaseLabels.length - 1 && (
                    <div className="w-8 md:w-12 h-px bg-stone-200 overflow-hidden">
                      <div
                        className="h-full bg-teal-500 transition-all duration-700 ease-out"
                        style={{
                          width: narrativePhase > i ? '100%' : '0%',
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Narrative line with crossfade */}
            <div className="relative min-h-[4rem] sm:min-h-[4.5rem] md:min-h-[3.5rem]">
              {narrativeLines.map((line, i) => (
                <p
                  key={i}
                  className="absolute left-0 right-0 top-0 text-sm sm:text-base md:text-lg text-stone-600 leading-relaxed transition-all duration-500"
                  style={{
                    opacity: narrativePhase === i ? narrativeOpacity : 0,
                    transform:
                      narrativePhase === i
                        ? 'translateY(0)'
                        : narrativePhase > i
                          ? 'translateY(-10px)'
                          : 'translateY(10px)',
                    pointerEvents: 'none',
                  }}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Story progress: filled path */}
            <div className="mt-5 flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1 flex-1 max-w-20 rounded-full bg-stone-200 overflow-hidden"
                >
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: narrativePhase >= i ? '100%' : '0%',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function App() {
  useEffect(() => {
    preloadWebGLModels()
  }, [])

  return (
    <LenisProvider>
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
        <PodNetwork />
        <CTA />
      </main>
      <Footer />
    </LenisProvider>
  )
}

export default App
