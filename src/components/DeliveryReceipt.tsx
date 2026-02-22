import { useRef, useEffect, useState, useMemo } from 'react'

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )
  useEffect(() => {
    const m = window.matchMedia(query)
    const handler = () => setMatches(m.matches)
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [query])
  return matches
}

interface DeliveryReceiptProps {
  scrollProgress: number
}

const RECEIPT_APPEAR = 0.88
const RECEIPT_FULL = 0.96 // scroll range for internal content (route, stats, etc.)

export default function DeliveryReceipt({ scrollProgress }: DeliveryReceiptProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [animatedTime, setAnimatedTime] = useState(0)
  const [animatedDist, setAnimatedDist] = useState(0)
  const [animatedCO2, setAnimatedCO2] = useState(0)
  const countUpStartedRef = useRef(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const visible = scrollProgress >= RECEIPT_APPEAR
  // Internal content (route, stats, footer) driven by scroll within receipt zone
  const contentProgress = visible
    ? Math.min(1, Math.max(0, (scrollProgress - RECEIPT_APPEAR) / (RECEIPT_FULL - RECEIPT_APPEAR)))
    : 0
  const eased = contentProgress * contentProgress * (3 - 2 * contentProgress)

  useEffect(() => {
    if (!visible) {
      countUpStartedRef.current = false
      setAnimatedTime(0)
      setAnimatedDist(0)
      setAnimatedCO2(0)
      return
    }
  }, [visible])

  // Stats count-up runs once when scroll progress crosses threshold (scroll-driven trigger)
  useEffect(() => {
    if (!visible || eased < 0.25) return
    if (countUpStartedRef.current) return
    countUpStartedRef.current = true
    const duration = 800
    const start = Date.now()
    let raf: number
    const animate = () => {
      const elapsed = Date.now() - start
      const t = Math.min(elapsed / duration, 1)
      const e = 1 - Math.pow(1 - t, 3)
      setAnimatedTime(Math.round(e * 28))
      setAnimatedDist(+(e * 4.2).toFixed(1))
      setAnimatedCO2(+(e * 0.8).toFixed(1))
      if (t < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [visible, eased])

  const routeSteps = useMemo(
    () => [
      { label: 'Hub', icon: 'hub', time: '0:00' },
      { label: 'Drone', icon: 'drone', time: '0:04' },
      { label: 'Pod #12', icon: 'pod', time: '0:11' },
      { label: 'Rider', icon: 'rider', time: '0:19' },
      { label: 'Door', icon: 'door', time: '0:28' },
    ],
    []
  )

  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!visible) {
      setShow(false)
      return
    }
    const frame = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(frame)
  }, [visible])

  if (!visible) return null

  return (
    <div
      ref={ref}
      className="absolute left-4 right-4 md:left-auto md:right-12 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-20 pointer-events-auto"
      style={{
        ...(isMobile ? { bottom: 'calc(8rem + env(safe-area-inset-bottom, 0px))' } : {}),
        opacity: show ? 1 : 0,
        transform: isMobile
          ? `scale(${show ? 1 : 0.94}) translateZ(0)`
          : `translateY(-50%) translateX(${show ? 0 : 32}px) scale(${show ? 1 : 0.94}) translateZ(0)`,
        transition: 'opacity 0.28s ease-out, transform 0.28s ease-out',
        willChange: 'transform, opacity',
      }}
    >
      <div
        className="receipt-card w-full max-w-[300px] md:max-w-none md:w-[340px] overflow-hidden rounded-3xl border border-stone-200/60 bg-white/80 shadow-2xl shadow-stone-900/10 backdrop-blur-xl mx-auto md:mx-0"
        style={{ contain: 'layout style paint' }}
      >
        {/* Header stripe */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 top-8 h-12 w-12 rounded-full bg-white/5" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-teal-100">
                You're all set
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                Delivery summary
              </p>
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-500 ease-out"
              style={{
                transform: eased > 0.6 ? 'scale(1)' : 'scale(0)',
                transitionDelay: eased > 0.6 ? '0.2s' : '0s',
              }}
            >
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats grid — scroll-driven reveal */}
        <div className="grid grid-cols-3 gap-px bg-stone-100">
          {[
            { value: `${animatedTime}`, unit: 'min', label: 'Door-to-door' },
            { value: `${animatedDist}`, unit: 'km', label: 'Distance covered' },
            { value: `${animatedCO2}`, unit: 'kg', label: 'Carbon saved' },
          ].map((stat, i) => {
            const statVisible = eased > 0.3 + i * 0.15
            return (
            <div
              key={stat.label}
              className="bg-white px-4 py-4 text-center transition-all duration-400 ease-out"
              style={{
                opacity: statVisible ? 1 : 0,
                transform: statVisible ? 'translateY(0)' : 'translateY(10px)',
                transitionDelay: statVisible ? `${0.1 + i * 0.08}s` : '0s',
              }}
            >
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-2xl font-bold tabular-nums text-stone-800">{stat.value}</span>
                <span className="text-xs font-medium text-stone-400">{stat.unit}</span>
              </div>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-stone-400">
                {stat.label}
              </p>
            </div>
            )
          })}
        </div>

        {/* Route visualization */}
        <div className="px-6 py-5">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
            How it got there
          </p>
          <div className="relative">
            {routeSteps.map((step, i) => {
              const stepDelay = 0.3 + i * 0.12
              const stepVisible = eased > stepDelay
              const isLast = i === routeSteps.length - 1

              return (
                <div key={step.label} className="flex items-start gap-3" style={{ marginBottom: isLast ? 0 : 16 }}>
                  {/* Timeline dot + line — scroll-driven */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-400 ${
                        stepVisible
                          ? isLast
                            ? 'border-teal-500 bg-teal-500'
                            : 'border-teal-400 bg-teal-50'
                          : 'border-stone-200 bg-white'
                      }`}
                      style={{
                        transform: stepVisible ? 'scale(1)' : 'scale(0.6)',
                        transitionDelay: stepVisible ? `${stepDelay * 0.3}s` : '0s',
                      }}
                    >
                      <RouteIcon type={step.icon} active={stepVisible} isLast={isLast} />
                    </div>
                    {!isLast && (
                      <div className="relative h-4 w-0.5 bg-stone-100">
                        <div
                          className="absolute inset-x-0 top-0 bg-teal-400 transition-all duration-400"
                          style={{
                            height: stepVisible ? '100%' : '0%',
                            transitionDelay: stepVisible ? `${stepDelay * 0.3 + 0.05}s` : '0s',
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Step label */}
                  <div
                    className="flex flex-1 items-center justify-between pt-1 transition-all duration-400 ease-out"
                    style={{
                      opacity: stepVisible ? 1 : 0,
                      transform: stepVisible ? 'translateX(0)' : 'translateX(10px)',
                      transitionDelay: stepVisible ? `${stepDelay * 0.3 + 0.02}s` : '0s',
                    }}
                  >
                    <span className={`text-sm font-medium ${isLast ? 'text-teal-600' : 'text-stone-700'}`}>
                      {step.label}
                    </span>
                    <span className="text-xs tabular-nums text-stone-400">{step.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer — scroll-driven */}
        <div
          className="border-t border-stone-100 px-6 py-4 transition-opacity duration-400 ease-out"
          style={{
            opacity: eased > 0.8 ? 1 : 0,
            transitionDelay: eased > 0.8 ? '0.15s' : '0s',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 receipt-pulse" />
              <span className="text-xs text-stone-400">Goa Network</span>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-stone-300">
              AH-{Math.floor(Math.random() * 9000 + 1000)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RouteIcon({ type, active, isLast }: { type: string; active: boolean; isLast: boolean }) {
  const color = !active ? '#d6d3d1' : isLast ? '#ffffff' : '#0d9488'
  const size = 13

  switch (type) {
    case 'hub':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 4v16M15 4v16M4 9h16M4 15h16" />
        </svg>
      )
    case 'drone':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M3 8l3 3M21 8l-3 3M3 16l3-3M21 16l-3-3" />
        </svg>
      )
    case 'pod':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      )
    case 'rider':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="3" />
          <path d="M12 8v8M8 21l4-5 4 5" />
        </svg>
      )
    case 'door':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-6h6v6" />
        </svg>
      )
    default:
      return null
  }
}
