import { motion } from 'framer-motion'
import { Shield, Volume2, Radio, Video } from 'lucide-react'
import { TextReveal } from '../ui/TextReveal'

const easeOut = [0.16, 1, 0.3, 1] as const

const features = [
  {
    icon: Shield,
    title: 'Glass breaker',
    body: 'Tungsten carbide tip at 30,000 RPM shatters tempered glass for rapid, controlled entry points.',
    accent: 'text-rose',
    border: 'hover:border-rose/25',
    iconWrap: 'border-rose/25 bg-deep',
  },
  {
    icon: Volume2,
    title: '2-way audio',
    body: 'Integrated speaker and mic let negotiators talk through the drone — from a safe distance.',
    accent: 'text-gold',
    border: 'hover:border-gold/25',
    iconWrap: 'border-gold/20 bg-goldGlow',
  },
  {
    icon: Radio,
    title: 'Mesh networking',
    body: 'Deploy multiple Lemur nodes to push signal through concrete, steel, and below-grade structures.',
    accent: 'text-indigo',
    border: 'hover:border-indigo/25',
    iconWrap: 'border-indigo/25 bg-deep',
  },
  {
    icon: Video,
    title: 'No-light vision',
    body: 'IR illuminators plus thermal imaging for zero-light rooms, smoke, and obscured environments.',
    accent: 'text-sage',
    border: 'hover:border-sage/25',
    iconWrap: 'border-sage/25 bg-deep',
  },
]

export function LemurFeaturesSection() {
  return (
    <section id="capabilities" className="relative overflow-hidden border-t border-border/40 bg-void py-20 lg:py-28">
      <div className="absolute inset-0 bg-dots opacity-15 pointer-events-none" />

      <div className="relative z-10 px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="">
          <div className="mb-12 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl space-y-5">
              <span
                className="chip chip-rose opacity-0 animate-fade-up"
                style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
              >
                Tactical payload
              </span>
              <h2 className="text-4xl font-black tracking-tight text-primary lg:text-[3.25rem] lg:leading-[1.08]">
                <TextReveal text="Every tool" type="words" delay={0.15} />
                <br />
                <span className="grad-rose">
                  <TextReveal text="the room demands" type="words" delay={0.35} />
                </span>
              </h2>
            </div>
            <p
              className="max-w-sm text-sm leading-relaxed text-secondary opacity-0 animate-fade-up lg:text-right"
              style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
            >
              Lemur 2 is purpose-built for SWAT and tactical teams — rugged, quiet, and ready for the most confined spaces.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.article
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: easeOut }}
                  className={`glass rounded-2xl border border-border/50 p-7 lg:p-8 transition-colors duration-300 ${f.border} cursor-interactive`}
                  data-cursor="Feature"
                >
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${f.iconWrap}`}
                  >
                    <Icon className={`h-6 w-6 ${f.accent}`} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-primary">{f.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-secondary">{f.body}</p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
