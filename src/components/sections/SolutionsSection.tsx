import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Map, Siren, FlameKindling, Users, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TextReveal } from '../ui/TextReveal'

gsap.registerPlugin(ScrollTrigger)

const solutions = [
  {
    id: 'law',
    icon: Users,
    chip: 'chip chip-gold',
    tag: 'Law Enforcement',
    headline: 'Eyes on Scene Before Officers Arrive',
    body: 'Deploy a drone the instant a 911 call comes in. Stream live 4K video, assess threats, and even de-escalate — before the first unit arrives.',
    metrics: [{ label: 'Faster Assessment', value: '3.4×' }, { label: 'Risk Reduction', value: '62%' }],
    metricColor: 'text-gold',
    borderGlow: 'hover:border-gold/25 hover:shadow-gold',
    topBar: 'bg-gradient-to-r from-gold/60 to-goldDim/20',
    link: '/solutions'
  },
  {
    id: 'dfr',
    icon: Siren,
    chip: 'chip chip-rose',
    tag: 'Drone as First Responder',
    headline: 'Autonomous Emergency Response at Scale',
    body: 'From station to scene in under 70 seconds, fully autonomous. AeroHorse\'s DFR program works 24/7 with no pilot required.',
    metrics: [{ label: 'Avg. Arrival', value: '< 70s' }, { label: 'Calls Cleared', value: '1 in 3' }],
    metricColor: 'text-rose',
    borderGlow: 'hover:border-rose/25 hover:shadow-rose',
    topBar: 'bg-gradient-to-r from-rose/60 to-roseDim/20',
    link: '/dfr'
  },
  {
    id: 'sar',
    icon: Map,
    chip: 'chip chip-indigo',
    tag: 'Search & Rescue',
    headline: 'Find Them Faster, Bring Them Home',
    body: 'Thermal imaging, wide-area search patterns, and real-time terrain mapping help SAR teams cover ground in a fraction of the time.',
    metrics: [{ label: 'Search Area/hr', value: '12 km²' }, { label: 'Success Rate', value: '↑ 78%' }],
    metricColor: 'text-indigo',
    borderGlow: 'hover:border-indigo/25 hover:shadow-indigo',
    topBar: 'bg-gradient-to-r from-indigo/60 to-indigoDim/20',
    link: '/solutions'
  },
  {
    id: 'fire',
    icon: FlameKindling,
    chip: 'chip chip-sage',
    tag: 'Firefighting',
    headline: 'Situational Awareness From Above',
    body: 'Give incident commanders a real-time aerial view of structure fires, wildland incidents, and hazmat scenes — live, from a safe altitude.',
    metrics: [{ label: 'Perimeter Mapping', value: 'Live' }, { label: 'IR Detection', value: '640p' }],
    metricColor: 'text-sage',
    borderGlow: 'hover:border-sage/25',
    topBar: 'bg-gradient-to-r from-sage/60 to-sageDim/20',
    link: '/solutions'
  },
]

export function SolutionsSection() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.from('.sol-card', {
        opacity: 0, y: 40, stagger: 0.12, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: '.sol-grid', start: 'top 85%', once: true },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="solutions" className="py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/50 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-1/3 w-[400px] h-[500px] bg-rose/3 blur-[120px] rounded-full pointer-events-none" />

      <div className="section-container">
        <div className="flex flex-col gap-5 mb-10 lg:mb-12 max-w-xl">
          <span className="chip chip-rose w-fit opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>Solutions</span>
          <h2 className="text-4xl lg:text-[3.25rem] font-black tracking-tight leading-tight">
            <TextReveal text="Upgrade Your Agency With" type="words" delay={0.2} />
            <br />
            <span className="text-rose-grad">
              <TextReveal text="Airborne Intelligence" type="words" delay={0.5} />
            </span>
          </h2>
          <div className="mt-2 opacity-0 animate-fade-up" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
            <p className="text-secondary text-base leading-relaxed">
              From patrol support to wildland firefighting, AeroHorse programs are tailored
              to deliver immediate, measurable results for your agency.
            </p>
          </div>
        </div>

        <div className="sol-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {solutions.map((sol) => {
            const Icon = sol.icon
            return (
              <motion.div
                key={sol.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="h-full"
              >
                <Link 
                  to={sol.link} 
                  className={`block h-full sol-card shimmer-card glass border border-border/50 rounded-2xl p-7 lg:p-8 relative overflow-hidden group cursor-interactive transition-all duration-300 ${sol.borderGlow}`}
                  data-cursor="View"
                >
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${sol.topBar} opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />

                  <div className="flex items-start justify-between mb-7">
                    <div className="w-11 h-11 glass rounded-xl flex items-center justify-center border border-border/60 group-hover:border-current/20 transition-colors duration-300 group-hover:-translate-y-1">
                      <Icon className={`w-5 h-5 ${sol.metricColor} group-hover:scale-110 transition-transform`} strokeWidth={1.5} />
                    </div>
                    <span className={sol.chip}>{sol.tag}</span>
                  </div>

                  <h3 className="text-xl font-bold text-primary mb-3 leading-snug">{sol.headline}</h3>
                  <p className="text-sm text-secondary leading-relaxed mb-7">{sol.body}</p>

                  <div className="flex gap-8 pt-5 border-t border-border/40 mb-6">
                    {sol.metrics.map((m) => (
                      <div key={m.label}>
                        <span className={`metric text-2xl font-black ${sol.metricColor}`}>{m.value}</span>
                        <p className="text-xs text-tertiary mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className={`flex items-center gap-2 text-xs text-tertiary group-hover:${sol.metricColor} transition-colors duration-200 mt-auto pt-2`}>
                    <span>See use cases</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
