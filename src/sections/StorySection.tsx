import { useRef, useEffect, useState } from 'react'
import { TextReveal, FadeIn } from '../components/TextReveal'

const steps = [
  {
    id: 'drone',
    num: '01',
    title: 'Drones fly to pods',
    description: 'Our autonomous fleet delivers packages from the hub to secure pods placed every 500m across the city—zero traffic, zero delays.',
    gradient: 'from-teal-500/15 to-teal-500/0',
  },
  {
    id: 'pods',
    num: '02',
    title: 'Pods hold your order',
    description: 'Temperature-controlled smart pods keep everything secure. Real-time notifications let you know when your package arrives.',
    gradient: 'from-slate-500/15 to-slate-500/0',
  },
  {
    id: 'rider',
    num: '03',
    title: 'Riders complete delivery',
    description: 'A local rider collects from the nearest pod and brings your order directly to your door. Fast, predictable, human where it matters.',
    gradient: 'from-stone-500/15 to-stone-500/0',
  },
  {
    id: 'door',
    num: '04',
    title: 'You receive at home',
    description: 'Track every step in real-time. Same-day and next-day options with a fraction of the carbon footprint.',
    gradient: 'from-teal-500/15 to-teal-500/0',
  },
]

export default function StorySection() {
  return (
    <section id="how-it-works" className="relative py-32 md:py-48 lg:py-64 bg-white">
      <div className="mx-auto max-w-7xl px-8 md:px-12 lg:px-16">
        <div className="mb-24 md:mb-32 lg:mb-40">
          <FadeIn>
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-teal-600">
              How it works
            </p>
          </FadeIn>
          <h2 className="text-5xl font-bold tracking-tight text-stone-800 md:text-7xl lg:text-8xl">
            <TextReveal delay={0.1} stagger={0.04}>
              Sky → Pod → Door.
            </TextReveal>
          </h2>
          <FadeIn delay={0.4} className="mt-8 max-w-2xl">
            <p className="text-xl text-stone-500 leading-relaxed">
              A simple chain that changes everything. Drones to pods, riders to you. 
              Fewer trucks, faster delivery, cleaner cities.
            </p>
          </FadeIn>
        </div>

        <div className="grid gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16">
          {steps.map((step, i) => (
            <StoryCard key={step.id} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StoryCard({
  step,
  index,
}: {
  step: (typeof steps)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  
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
      { threshold: 0.2, rootMargin: '-50px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-3xl border border-stone-200 bg-stone-50 p-8 md:p-10 lg:p-12 shadow-sm transition-all duration-700 hover:border-stone-300 hover:bg-white hover:shadow-md ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      data-cursor-hover
    >
      {/* Gradient accent */}
      <div className={`absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br ${step.gradient} blur-3xl transition-all duration-500 group-hover:scale-150`} />
      
      <div className="relative z-10">
        <span className="text-sm font-medium text-stone-400">{step.num}</span>
        <h3 className="mt-4 text-2xl font-bold text-stone-800 md:text-3xl">{step.title}</h3>
        <p className="mt-4 text-stone-500 leading-relaxed">{step.description}</p>
        
        <div className="mt-8 flex items-center gap-2 text-teal-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="text-sm font-medium">Learn more</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  )
}
