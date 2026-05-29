import { motion } from 'framer-motion'
import { ShieldCheck, HandHelping, PackageOpen } from 'lucide-react'
import { TextReveal } from '../ui/TextReveal'

const benefits = [
  {
    icon: ShieldCheck,
    chip: 'chip chip-gold',
    tag: 'Officer Safety',
    title: 'Increase Officer Safety',
    body: 'Get eyes and ears in dangerous situations without risking lives — and long before the first officer arrives on scene.',
    metricColor: 'text-gold',
    border: 'hover:border-gold/25 hover:shadow-gold',
    bar: 'from-gold/60 to-goldDim/10',
  },
  {
    icon: HandHelping,
    chip: 'chip chip-rose',
    tag: 'De-escalation',
    title: 'Reduce Use of Force',
    body: 'Create distance and slow the speed of operations with technology — turning split-second decisions into deliberate ones.',
    metricColor: 'text-rose',
    border: 'hover:border-rose/25 hover:shadow-rose',
    bar: 'from-rose/60 to-roseDim/10',
  },
  {
    icon: PackageOpen,
    chip: 'chip chip-indigo',
    tag: 'Payloads',
    title: 'Deliver Lifesaving Payloads',
    body: 'Make Narcan, AEDs, EpiPens, phones, and other critical equipment available anywhere in seconds — not minutes.',
    metricColor: 'text-indigo',
    border: 'hover:border-indigo/25 hover:shadow-indigo',
    bar: 'from-indigo/60 to-indigoDim/10',
  },
]

export function BenefitsSection() {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.04),transparent_70%)] pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="chip chip-gold opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>Why It Matters</span>
          <h2 className="text-4xl lg:text-[3.25rem] font-black tracking-tight leading-tight text-primary mt-5">
            <TextReveal text="Faster Response." type="words" delay={0.15} />
            <span className="grad-gold block"><TextReveal text="Better Outcomes." type="words" delay={0.35} /></span>
          </h2>
          <p className="text-secondary text-base leading-relaxed mt-5 opacity-0 animate-fade-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
            Experience the lifesaving benefits of airborne support across every public safety operation.
          </p>
        </div>

        <div className="benefit-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                className={`benefit-card shimmer-card glass border border-border/50 rounded-2xl p-8 relative overflow-hidden group cursor-interactive transition-all duration-300 ${b.border}`}
                data-cursor="Learn"
              >
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${b.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 glass rounded-xl flex items-center justify-center border border-border/60 group-hover:-translate-y-1 transition-transform duration-300">
                    <Icon className={`w-5 h-5 ${b.metricColor} group-hover:scale-110 transition-transform`} strokeWidth={1.5} />
                  </div>
                  <span className={b.chip}>{b.tag}</span>
                </div>

                <h3 className="text-xl font-bold text-primary mb-3 leading-snug">{b.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{b.body}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
