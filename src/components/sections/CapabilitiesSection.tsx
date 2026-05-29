import { motion } from 'framer-motion'
import { Hammer, Satellite, MessagesSquare, LayoutGrid } from 'lucide-react'
import { TextReveal } from '../ui/TextReveal'

const features = [
  {
    icon: Hammer,
    title: 'Glass Breaker',
    desc: 'A tungsten-carbide tip enables effective entry into structures during tactical operations.',
    accent: 'text-gold',
  },
  {
    icon: Satellite,
    title: 'Satellite Connectivity',
    desc: 'If you’re on earth, you’re connected. Integrated satellite links keep every unit online.',
    accent: 'text-rose',
  },
  {
    icon: MessagesSquare,
    title: 'Two-Way Comms',
    desc: 'AeroHorse drones are flying cell phones — speak and listen from a safe distance.',
    accent: 'text-indigo',
  },
  {
    icon: LayoutGrid,
    title: '2D Floor Plans',
    desc: 'Generate accurate floor plans mid-flight to brief teams before they make entry.',
    accent: 'text-sage',
  },
]

export function CapabilitiesSection() {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden border-y border-border/40 bg-ink/40">
      <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-indigo/[0.04] blur-[120px] rounded-full pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 lg:mb-14">
          <div className="space-y-5 max-w-xl">
            <span className="chip chip-indigo opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>Purpose Built</span>
            <h2 className="text-4xl lg:text-[3.25rem] font-black tracking-tight leading-tight text-primary">
              <TextReveal text="Engineered for the" type="words" delay={0.15} />
              <br />
              <span className="grad-indigo"><TextReveal text="Missions That Matter" type="words" delay={0.4} /></span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-secondary leading-relaxed lg:text-right opacity-0 animate-fade-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
            Our team brings 30+ years of public safety experience to every feature — built around how first responders actually work.
          </p>
        </div>

        <div className="cap-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/40 rounded-2xl overflow-hidden border border-border/40">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
                className="cap-card group relative bg-deep/60 hover:bg-panel/60 transition-colors duration-300 p-7 lg:p-8 cursor-interactive"
                data-cursor="Feature"
              >
                <span className="font-mono text-xs text-tertiary">0{i + 1}</span>
                <Icon className={`w-7 h-7 ${f.accent} my-5 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-300`} strokeWidth={1.5} />
                <h3 className="text-base font-bold text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{f.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
