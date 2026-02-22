import { Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene3D, { type HoverTarget } from './Scene3D'
import { TextReveal, LineReveal, FadeIn } from './TextReveal'
import { useThrottledScrollProgress } from '../hooks/useScrollProgress'

// Match Scene3D: same mouse strength and coefficients so text parallax is in sync with drone/camera
const MOUSE_STRENGTH_NORMAL = 0.4
const MOUSE_X_COEF = 3.5
const MOUSE_Y_COEF = 2
const LERP_FACTOR = 0.08
const PIXELS_PER_UNIT = 18
// 3D tilt: strong angles so text clearly feels like a plane in 3D space
const TILT_Y_DEG = 12
const TILT_X_DEG = 10
const TILT_PERSPECTIVE_PX = 500
const TILT_TRANSLATE_Z = 40

export default function Hero() {
  const [mouse, setMouse] = useState({ normalizedX: 0, normalizedY: 0 })
  const sceneProgress = useThrottledScrollProgress(
    () => Math.min(1, window.scrollY / (window.innerHeight * 3)),
    0.004,
    []
  )
  const [hoveredTarget, setHoveredTarget] = useState<HoverTarget>(null)
  const [focusDroneUntil, setFocusDroneUntil] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef(mouse)
  const scrollRef = useRef(sceneProgress)
  const smoothedX = useRef(0)
  const smoothedY = useRef(0)
  const smoothedRotateX = useRef(0)
  const smoothedRotateY = useRef(0)

  mouseRef.current = mouse
  scrollRef.current = sceneProgress

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = -(e.clientY / window.innerHeight) * 2 + 1
    setMouse({ normalizedX: x, normalizedY: y })
  }, [])

  // Same lerp as Scene3D camera (0.08 per frame) so text and drone stay in sync; add 3D tilt for same-space feel
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const { normalizedX, normalizedY } = mouseRef.current
      const scroll = scrollRef.current
      const mouseStrength = MOUSE_STRENGTH_NORMAL * (1 - scroll * 0.7)
      const targetX = normalizedX * MOUSE_X_COEF * mouseStrength * PIXELS_PER_UNIT
      const targetY = -normalizedY * MOUSE_Y_COEF * mouseStrength * PIXELS_PER_UNIT
      smoothedX.current += (targetX - smoothedX.current) * LERP_FACTOR
      smoothedY.current += (targetY - smoothedY.current) * LERP_FACTOR
      const targetRotateY = normalizedX * TILT_Y_DEG * mouseStrength
      const targetRotateX = normalizedY * TILT_X_DEG * mouseStrength
      smoothedRotateX.current += (targetRotateX - smoothedRotateX.current) * LERP_FACTOR
      smoothedRotateY.current += (targetRotateY - smoothedRotateY.current) * LERP_FACTOR
      const scrollY = -Math.min(1, scroll / 0.2) * 48
      const el = contentRef.current
      if (el) {
        const tx = smoothedX.current
        const ty = scrollY + smoothedY.current
        const rx = smoothedRotateX.current
        const ry = smoothedRotateY.current
        el.style.transform = `translate3d(${tx}px, ${ty}px, ${TILT_TRANSLATE_Z}px) rotateX(${rx}deg) rotateY(${ry}deg)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleDroneClick = useCallback((clockSeconds: number) => {
    setFocusDroneUntil(clockSeconds + 3)
  }, [])

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: '400vh' }}
    >
    <section
      ref={sectionRef}
      className="sticky top-0 left-0 right-0 h-screen w-full overflow-hidden"
      onMouseMove={onMouseMove}
      data-cursor-hover={hoveredTarget != null ? '' : undefined}
    >
        <div
          className="absolute inset-0 z-0"
          data-cursor-hover={hoveredTarget != null ? '' : undefined}
        >
          <Canvas
            camera={{ position: [0, 5, 12], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            shadows
          >
            <Suspense fallback={null}>
              <Scene3D
                mouse={mouse}
                scrollProgress={sceneProgress}
                onHoverChange={setHoveredTarget}
                onDroneClick={handleDroneClick}
                focusDroneUntil={focusDroneUntil}
              />
            </Suspense>
          </Canvas>
        </div>
        
        {/* Content overlay — perspective wrapper so text tilt reads as real 3D */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center items-center transition-[opacity,visibility] duration-500 ease-out"
          style={{
            opacity: Math.max(0, 1 - sceneProgress / 0.2),
            visibility: sceneProgress >= 0.2 ? 'hidden' : 'visible',
            perspective: TILT_PERSPECTIVE_PX,
            perspectiveOrigin: '50% 50%',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            ref={contentRef}
            className="flex flex-col justify-center items-center text-center px-6 sm:px-8 md:px-12 w-full min-h-0"
            style={{
              transformOrigin: '50% 50%',
              backfaceVisibility: 'hidden',
              willChange: 'transform',
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
        </div>
        
        

        {/* Scroll progress bar — shows drone position along path */}
        <div
          className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 md:flex flex-col items-center gap-2"
          style={{ opacity: 0.5 + (1 - sceneProgress) * 0.5 }}
        >

          <div className="h-32 w-1 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="w-full bg-teal-500 rounded-full transition-all duration-150 ease-out"
              style={{ height: `${sceneProgress * 100}%`, marginTop: 'auto' }}
            />
          </div>
          <span className="text-[9px] text-stone-400 tabular-nums">
            {Math.round(sceneProgress * 100)}%
          </span>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-3"
          style={{ opacity: 1 - sceneProgress * 2.5 }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 text-center max-w-[200px]">
            {hoveredTarget
              ? 'Scroll'
              : 'Scroll'}
          </span>
          <div className="h-12 w-px bg-gradient-to-b from-stone-400 to-transparent" />
        </div>
        
        {/* Bottom gradient fade for smooth transition */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-stone-50 via-stone-50/80 to-transparent pointer-events-none z-20"
          style={{ 
            opacity: Math.min(1, sceneProgress * 2),
          }}
        />
    </section>
    </div>
  )
}
