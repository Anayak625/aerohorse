import { motion } from 'framer-motion'
import { ArrowRight, Check, Quote } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  accentStyles,
  solutionNavLinks,
  solutionProgramPath,
  type EnrichedSolutionVertical,
} from '../../data/solutionsContent'
import { SolutionProgramHero, SolutionProgramImpactStrip } from './SolutionProgramHero'
import { SolutionWorkflowTimeline } from './SolutionWorkflowTimeline'

const easeOut = [0.16, 1, 0.3, 1] as const

const heroGlow: Record<string, string> = {
  gold: 'rgba(37,99,235,0.12)',
  rose: 'rgba(91,143,212,0.14)',
  indigo: 'rgba(91,143,212,0.14)',
  sage: 'rgba(91,143,212,0.12)',
  live: 'rgba(5,150,105,0.1)',
  amber: 'rgba(37,99,235,0.1)',
}

const recBorder = {
  gold: 'border-gold/25 hover:border-gold/40',
  rose: 'border-rose/25 hover:border-rose/40',
  indigo: 'border-indigo/25 hover:border-indigo/40',
  sage: 'border-sage/25 hover:border-sage/40',
  live: 'border-live/25 hover:border-live/40',
  amber: 'border-gold/25 hover:border-gold/40',
}

interface SolutionProgramDetailProps {
  vertical: EnrichedSolutionVertical
}

export function SolutionProgramDetail({ vertical }: SolutionProgramDetailProps) {
  const styles = accentStyles[vertical.accent]
  const Icon = vertical.icon
  const related = solutionNavLinks.filter((l) => l.href !== solutionProgramPath(vertical.id))

  return (
    <>
      <SolutionProgramHero vertical={vertical} />
      <SolutionProgramImpactStrip vertical={vertical} />

      {/* Challenge + approach */}
      <section className="border-b border-border/40 bg-void py-20 lg:py-24">
        <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="glass rounded-2xl border border-border/50 p-8 lg:p-10"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-tertiary">The challenge</span>
              <p className="mt-4 text-base leading-relaxed text-secondary lg:text-lg">{vertical.challenge}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: easeOut }}
              className={`rounded-2xl border p-8 lg:p-10 ${styles.border} bg-ink/50`}
            >
              <span className={`font-mono text-xs uppercase tracking-widest ${styles.icon}`}>The AeroHorse approach</span>
              <p className="mt-4 text-base leading-relaxed text-secondary lg:text-lg">{vertical.approach}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <SolutionWorkflowTimeline steps={vertical.workflow} accent={vertical.accent} />

      {/* Capabilities */}
      <section className="border-b border-border/40 bg-void py-20 lg:py-28">
        <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="">
            <div className="mb-12 max-w-2xl">
              <h2 className="text-3xl font-black text-primary md:text-4xl">Mission capabilities</h2>
              <p className="mt-3 text-secondary">
                Built for real-world {vertical.title.toLowerCase()} operations — not lab demos.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {vertical.bullets.map((bullet, i) => (
                <motion.div
                  key={bullet}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.45, ease: easeOut }}
                  className="group flex gap-4 rounded-2xl border border-border/50 bg-ink/40 p-6 transition-colors hover:border-border hover:bg-panel/30"
                >
                  <Check className={`mt-0.5 h-5 w-5 shrink-0 ${styles.icon}`} strokeWidth={2.5} />
                  <span className="text-sm leading-relaxed text-secondary group-hover:text-primary transition-colors">
                    {bullet}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="border-b border-border/40 bg-ink py-20 lg:py-28">
        <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="">
            <h2 className="mb-12 text-center text-3xl font-black text-primary md:text-4xl">Operational outcomes</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {vertical.outcomes.map((outcome, i) => (
                <motion.div
                  key={outcome.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: easeOut }}
                  className={`glass rounded-2xl border p-8 ${styles.border}`}
                >
                  {outcome.metric && (
                    <p className={`metric mb-3 text-xl font-black ${styles.icon}`}>{outcome.metric}</p>
                  )}
                  <h3 className="text-lg font-bold text-primary">{outcome.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-secondary">{outcome.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="border-b border-border/40 bg-void py-20 lg:py-28">
        <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="">
            <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-black text-primary md:text-4xl">Recommended platforms</h2>
                <p className="mt-3 max-w-lg text-secondary">
                  Aircraft and programs configured for {vertical.title.toLowerCase()} missions.
                </p>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border glass ${styles.border}`}>
                <Icon className={`h-7 w-7 ${styles.icon}`} strokeWidth={1.5} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {vertical.platforms.map((platform, i) => (
                <motion.div
                  key={platform.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: easeOut }}
                >
                  <Link
                    to={platform.href}
                    className={`group flex h-full flex-col rounded-2xl border bg-ink/30 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg ${recBorder[platform.accent]}`}
                    data-cursor="View"
                  >
                    <span className={`text-xs font-mono uppercase tracking-widest ${accentStyles[platform.accent].icon}`}>
                      Platform
                    </span>
                    <h3 className={`mt-3 text-2xl font-black ${accentStyles[platform.accent].link}`}>
                      {platform.name}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-secondary">{platform.role}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-tertiary group-hover:text-primary transition-colors">
                      Learn more
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      {vertical.quote && (
        <section className="border-b border-border/40 bg-ink py-20 lg:py-24">
          <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
            <motion.blockquote
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: easeOut }}
              className="mx-auto max-w-3xl text-center"
            >
              <Quote className={`mx-auto mb-6 h-10 w-10 ${styles.icon} opacity-60`} strokeWidth={1.5} />
              <p className="text-xl font-medium leading-relaxed text-primary md:text-2xl">
                &ldquo;{vertical.quote.text}&rdquo;
              </p>
              <footer className="mt-6 font-mono text-xs uppercase tracking-widest text-tertiary">
                {vertical.quote.attribution}
              </footer>
            </motion.blockquote>
          </div>
        </section>
      )}

      {/* Related */}
      <section className="border-b border-border/40 bg-void py-16 lg:py-20">
        <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="">
            <h2 className="mb-8 text-2xl font-black text-primary">Other mission programs</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((link) => {
                const RelIcon = link.icon
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="group flex items-center gap-3 rounded-xl border border-border/50 bg-ink/40 px-4 py-4 transition-all hover:border-gold/30 hover:bg-panel/40"
                    data-cursor="View"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-deep">
                      <RelIcon className="h-4 w-4 text-gold" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-sm font-bold text-primary transition-colors group-hover:text-gold">
                        {link.label}
                      </span>
                      <span className="block truncate text-xs text-tertiary">{link.shortLabel}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-ink py-24 lg:py-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, ${heroGlow[vertical.accent]}, transparent 65%)`,
          }}
        />
        <div className="relative z-10 px-6 text-center">
          <h2 className="text-3xl font-black text-primary md:text-5xl">
            Deploy {vertical.title} with AeroHorse
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-secondary">
            Get a tailored briefing on aircraft, software, training, and rollout for your agency or organization.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/contact" className="btn-primary cursor-interactive px-8 py-4 text-lg" data-cursor="Contact">
              Request Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/guardian" className="btn-outline cursor-interactive" data-cursor="Explore">
              View products
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
