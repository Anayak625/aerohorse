import { useRef, useEffect, useState } from 'react'
import { TextReveal, FadeIn } from '../components/TextReveal'

/** Deterministic "kg CO₂ saved this month" for display. Same value per minute. */
function getCarbonSavedKg(): number {
  const now = new Date()
  const day = now.getDate()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const baseThisMonth = 14_000 + day * 1_200
  const liveTick = Math.floor(hours * 42 + minutes * 0.7)
  return baseThisMonth + liveTick
}

const benefits = [
  {
    stat: '< 30',
    unit: 'min',
    title: 'Door-to-door in under 30',
    description: 'Pods every 500m keep the last mile short. Same-day and next-day, without sitting in traffic.',
    color: 'teal',
  },
  {
    stat: '60',
    unit: '%',
    title: 'Up to 60% less carbon',
    description: 'Drones and riders replace road traffic. Cleaner air, quieter streets, a smaller footprint.',
    color: 'slate',
  },
  {
    stat: '100',
    unit: '%',
    title: 'Track every step',
    description: 'From warehouse to your door—see where it is and get a clear ETA so you’re never left guessing.',
    color: 'stone',
  },
]

export default function Benefits() {
  return (
    <section className="relative overflow-hidden border-y border-stone-200 bg-stone-50 py-20 sm:py-28 md:py-48 lg:py-64">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent" />
      
      <div className="relative mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="mb-12 sm:mb-16 md:mb-28 lg:mb-36 max-w-3xl">
          <FadeIn>
            <p className="mb-4 sm:mb-6 text-xs font-medium uppercase tracking-[0.4em] text-teal-600">
              Why choose us
            </p>
          </FadeIn>
          <h2 className="text-4xl font-bold tracking-tight text-stone-800 sm:text-5xl md:text-7xl lg:text-8xl">
            <TextReveal delay={0.1} stagger={0.04}>
              Fast for you.
            </TextReveal>
            <TextReveal className="text-stone-400" delay={0.3} stagger={0.04}>
              Lighter on the planet.
            </TextReveal>
          </h2>
        </div>
        
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3 md:gap-6 lg:gap-12">
          {benefits.map((b, i) => (
            <BenefitCard key={b.title} benefit={b} index={i} />
          ))}
        </div>

        <CarbonSavedStrip />
      </div>
    </section>
  )
}

function CarbonSavedStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const displayRef = useRef(0)
  const [inView, setInView] = useState(false)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Animate from 0 to target when in view
  useEffect(() => {
    if (!inView) return
    const target = getCarbonSavedKg()
    const duration = 2000
    const start = Date.now()

    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = Math.floor(eased * target)
      displayRef.current = value
      setDisplayValue(value)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [inView])

  // Tick up every 60s with a short animation
  useEffect(() => {
    if (!inView) return
    const interval = setInterval(() => {
      const next = getCarbonSavedKg()
      const from = displayRef.current
      const start = Date.now()
      const duration = 800
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const value = Math.floor(from + (next - from) * eased)
        displayRef.current = value
        setDisplayValue(value)
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, 60_000)
    return () => clearInterval(interval)
  }, [inView])

  return (
    <div
      ref={ref}
      className={`mt-12 sm:mt-16 md:mt-28 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 rounded-2xl border border-teal-500/20 bg-gradient-to-r from-teal-500/10 to-teal-500/5 px-4 py-6 sm:px-6 sm:py-6 md:px-10 md:py-8 transition-all duration-700 ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-3xl sm:text-4xl font-bold tabular-nums text-teal-700 md:text-5xl">
          {displayValue.toLocaleString()}
        </span>
        <span className="text-lg sm:text-xl font-medium text-teal-600">kg CO₂</span>
        <span className="text-stone-500 text-base sm:text-lg">saved by Aerohorse deliveries this month.</span>
      </div>
      <p className="text-xs text-stone-400 sm:text-right">
        Based on drone + rider miles vs. traditional road delivery.
      </p>
    </div>
  )
}

function BenefitCard({ benefit, index }: { benefit: typeof benefits[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Animate number
  useEffect(() => {
    if (!inView) return
    const target = parseInt(benefit.stat.replace(/[^0-9]/g, ''))
    const duration = 1500
    const start = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      
      if (progress < 1) requestAnimationFrame(animate)
    }
    
    setTimeout(animate, index * 150)
  }, [inView, benefit.stat, index])

  const colorClasses = {
    teal: 'text-teal-600 bg-teal-500/10 border-teal-500/20',
    slate: 'text-slate-600 bg-slate-500/10 border-slate-500/20',
    stone: 'text-stone-600 bg-stone-500/10 border-stone-500/20',
  }

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 md:p-10 shadow-sm transition-all duration-700 hover:border-stone-300 hover:shadow-md ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      data-cursor-hover
    >
      <div className={`inline-flex items-baseline gap-1 rounded-full border px-4 py-2 ${colorClasses[benefit.color as keyof typeof colorClasses]}`}>
        <span className="text-3xl font-bold tabular-nums sm:text-4xl md:text-5xl">
          {benefit.stat.includes('<') && '< '}
          {count}
        </span>
        <span className="text-lg font-medium">{benefit.unit}</span>
      </div>
      
      <h3 className="mt-4 sm:mt-6 text-lg font-bold text-stone-800 sm:text-xl md:text-2xl">{benefit.title}</h3>
      <p className="mt-3 text-stone-500 leading-relaxed">{benefit.description}</p>
    </div>
  )
}
