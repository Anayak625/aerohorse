import { useRef, useEffect, useState } from 'react'
import { TextReveal, FadeIn } from '../components/TextReveal'

const benefits = [
  {
    stat: '< 30',
    unit: 'min',
    title: 'Faster delivery',
    description: 'Pods every 500m mean the last mile is short. Same-day and next-day, without the road gridlock.',
    color: 'teal',
  },
  {
    stat: '60',
    unit: '%',
    title: 'Less emissions',
    description: 'Drones and riders replace heavy trucks. Cleaner air, quieter streets, smaller carbon footprint.',
    color: 'slate',
  },
  {
    stat: '100',
    unit: '%',
    title: 'Real-time tracking',
    description: 'Track your package from warehouse to your door. Know exactly when it arrives.',
    color: 'stone',
  },
]

export default function Benefits() {
  return (
    <section className="relative overflow-hidden border-y border-stone-200 bg-stone-50 py-32 md:py-48 lg:py-64">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent" />
      
      <div className="relative mx-auto px-8 md:px-12 lg:px-16">
        <div className="mb-20 md:mb-28 lg:mb-36 max-w-3xl">
          <FadeIn>
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-teal-600">
              Why Aerohorse
            </p>
          </FadeIn>
          <h2 className="text-5xl font-bold tracking-tight text-stone-800 md:text-7xl lg:text-8xl">
            <TextReveal delay={0.1} stagger={0.04}>
              Built for speed.
            </TextReveal>
            <TextReveal className="text-stone-400" delay={0.3} stagger={0.04}>
              Designed for scale.
            </TextReveal>
          </h2>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-12">
          {benefits.map((b, i) => (
            <BenefitCard key={b.title} benefit={b} index={i} />
          ))}
        </div>
      </div>
    </section>
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
      className={`group relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-8 md:p-10 shadow-sm transition-all duration-700 hover:border-stone-300 hover:shadow-md ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      data-cursor-hover
    >
      <div className={`inline-flex items-baseline gap-1 rounded-full border px-4 py-2 ${colorClasses[benefit.color as keyof typeof colorClasses]}`}>
        <span className="text-4xl font-bold tabular-nums md:text-5xl">
          {benefit.stat.includes('<') && '< '}
          {count}
        </span>
        <span className="text-lg font-medium">{benefit.unit}</span>
      </div>
      
      <h3 className="mt-6 text-xl font-bold text-stone-800 md:text-2xl">{benefit.title}</h3>
      <p className="mt-3 text-stone-500 leading-relaxed">{benefit.description}</p>
    </div>
  )
}
