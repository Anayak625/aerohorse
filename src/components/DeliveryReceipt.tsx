import { useRef, useEffect, useState, useMemo } from 'react'

interface DeliveryReceiptProps {
  scrollProgress: number
}

const RECEIPT_APPEAR = 0.88
const RECEIPT_FULL = 0.95

export default function DeliveryReceipt({ scrollProgress }: DeliveryReceiptProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [animatedTime, setAnimatedTime] = useState(0)
  const [animatedDist, setAnimatedDist] = useState(0)
  const [animatedCO2, setAnimatedCO2] = useState(0)

  const visible = scrollProgress >= RECEIPT_APPEAR
  const progress = Math.min(1, Math.max(0, (scrollProgress - RECEIPT_APPEAR) / (RECEIPT_FULL - RECEIPT_APPEAR)))
  const eased = progress * progress * (3 - 2 * progress)

  useEffect(() => {
    if (!visible) {
      setAnimatedTime(0)
      setAnimatedDist(0)
      setAnimatedCO2(0)
      return
    }
    const duration = 1200
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
  }, [visible])

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

  if (!visible) return null

  return (
    <div
      ref={ref}
      className="absolute right-6 top-1/2 z-20 -translate-y-1/2 pointer-events-auto md:right-12"
      style={{
        opacity: eased,
        transform: `translateY(-50%) translateX(${(1 - eased) * 60}px) scale(${0.9 + eased * 0.1})`,
        transition: 'none',
      }}
    >
      <div className="receipt-card w-[300px] md:w-[340px] overflow-hidden rounded-3xl border border-stone-200/60 bg-white/80 shadow-2xl shadow-stone-900/10 backdrop-blur-xl">
        {/* Header stripe */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 top-8 h-12 w-12 rounded-full bg-white/5" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-teal-100">
                Delivery complete
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                Receipt
              </p>
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
              style={{
                transform: `scale(${eased > 0.6 ? 1 : 0})`,
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: '0.3s',
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

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-px bg-stone-100">
          {[
            { value: `${animatedTime}`, unit: 'min', label: 'Delivery time' },
            { value: `${animatedDist}`, unit: 'km', label: 'Distance' },
            { value: `${animatedCO2}`, unit: 'kg', label: 'CO₂ saved' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white px-4 py-4 text-center"
              style={{
                opacity: eased > 0.3 + i * 0.15 ? 1 : 0,
                transform: `translateY(${eased > 0.3 + i * 0.15 ? 0 : 12}px)`,
                transition: 'all 0.5s ease-out',
                transitionDelay: `${0.2 + i * 0.1}s`,
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
          ))}
        </div>

        {/* Route visualization */}
        <div className="px-6 py-5">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
            Route
          </p>
          <div className="relative">
            {routeSteps.map((step, i) => {
              const stepDelay = 0.3 + i * 0.12
              const stepVisible = eased > stepDelay
              const isLast = i === routeSteps.length - 1

              return (
                <div key={step.label} className="flex items-start gap-3" style={{ marginBottom: isLast ? 0 : 16 }}>
                  {/* Timeline dot + line */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                        stepVisible
                          ? isLast
                            ? 'border-teal-500 bg-teal-500'
                            : 'border-teal-400 bg-teal-50'
                          : 'border-stone-200 bg-white'
                      }`}
                      style={{
                        transform: `scale(${stepVisible ? 1 : 0.6})`,
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transitionDelay: `${stepDelay}s`,
                      }}
                    >
                      <RouteIcon type={step.icon} active={stepVisible} isLast={isLast} />
                    </div>
                    {!isLast && (
                      <div className="relative h-4 w-0.5 bg-stone-100">
                        <div
                          className="absolute inset-x-0 top-0 bg-teal-400 transition-all duration-500"
                          style={{
                            height: stepVisible ? '100%' : '0%',
                            transitionDelay: `${stepDelay + 0.1}s`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Step label */}
                  <div
                    className="flex flex-1 items-center justify-between pt-1"
                    style={{
                      opacity: stepVisible ? 1 : 0,
                      transform: `translateX(${stepVisible ? 0 : 10}px)`,
                      transition: 'all 0.4s ease-out',
                      transitionDelay: `${stepDelay + 0.05}s`,
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

        {/* Footer */}
        <div
          className="border-t border-stone-100 px-6 py-4"
          style={{
            opacity: eased > 0.8 ? 1 : 0,
            transition: 'opacity 0.5s ease-out',
            transitionDelay: '0.7s',
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
