import { motion } from 'framer-motion'
import { ArrowRight, ClipboardList, Plug, Activity, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TextReveal } from '../ui/TextReveal'

const stages = [
  { icon: ClipboardList, step: '01', title: 'Planning', desc: 'Policy development, Part 107 / COA filings, and public education to launch with confidence.' },
  { icon: Plug, step: '02', title: 'Integration', desc: 'Hands-on training, drone operations setup, and staffing so your program runs day one.' },
  { icon: Activity, step: '03', title: 'Operation', desc: 'Maintenance, repairs, replacements, and responsive customer support around the clock.' },
  { icon: TrendingUp, step: '04', title: 'Expansion', desc: 'Hardware upgrades, software integrations, and the roadmap to scale across your jurisdiction.' },
]

export function SupportSection() {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[400px] bg-gold/[0.04] blur-[120px] rounded-full pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="chip chip-sage opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>Dedicated Support</span>
          <h2 className="text-4xl lg:text-[3.25rem] font-black tracking-tight leading-tight text-primary mt-5">
            <TextReveal text="Your Partner at Every Stage" type="words" delay={0.2} />
          </h2>
          <p className="text-secondary text-base leading-relaxed mt-5 opacity-0 animate-fade-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
            We don’t just ship hardware. We stand beside your agency through the entire lifecycle of your drone program.
          </p>
        </div>

        <div className="support-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {stages.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                className="support-card relative glass border border-border/50 rounded-2xl p-7 group hover:border-gold/20 transition-colors duration-300 cursor-interactive"
                data-cursor="View"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl bg-deep border border-border/60 flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                  </div>
                  <span className="font-mono text-2xl font-black text-border group-hover:text-gold/30 transition-colors duration-300">{s.step}</span>
                </div>
                <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-gold transition-colors duration-200">{s.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{s.desc}</p>
                {i < stages.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-3.5 w-4 h-4 text-border z-10" />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Final CTA */}
        <div className="glass-gold rounded-3xl p-8 lg:p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.12),transparent_60%)] pointer-events-none" />
          <div className="absolute -top-10 right-10 w-40 h-40 bg-gold/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-3xl lg:text-4xl font-black tracking-tight text-primary leading-tight">
                Starting or scaling a <span className="text-gold">drone program?</span>
              </h3>
              <p className="text-secondary text-base leading-relaxed mt-4">
                See how AeroHorse can help your agency get eyes on scene, de-escalate, and respond faster to every call for service.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 flex-shrink-0">
              <Link to="/contact" className="btn-primary group cursor-interactive" data-cursor="Book">
                Book a Program Review
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/solutions" className="btn-outline cursor-interactive" data-cursor="Explore">
                Explore Solutions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
