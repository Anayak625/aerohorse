import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TextReveal } from '../ui/TextReveal'
import { solutionOverviewCards, solutionProgramPath } from '../../data/solutionsContent'

const easeOut = [0.16, 1, 0.3, 1] as const

export function SolutionsSection() {
  return (
    <section id="solutions" className="relative overflow-hidden py-16 lg:py-24">
      <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="mb-10 flex flex-col gap-5 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-5">
            <span
              className="chip chip-rose w-fit opacity-0 animate-fade-up"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              Solutions
            </span>
            <h2 className="text-4xl font-black leading-[1.08] tracking-tight lg:text-[3.25rem] w-full">
              <TextReveal text="Upgrade your agency with" type="words" delay={0.2} />
              <br />
              <span className="grad-rose">
                <TextReveal text="airborne intelligence" type="words" delay={0.5} />
              </span>
            </h2>
          </div>
          <div
            className="opacity-0 animate-fade-up lg:max-w-xs lg:text-right"
            style={{ animationDelay: '1s', animationFillMode: 'forwards' }}
          >
            <p className="text-base leading-relaxed text-secondary">
              Six mission programs — from DFR and law enforcement to healthcare and logistics.
            </p>
            <Link
              to="/solutions"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold hover:text-goldLight"
            >
              View all programs
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="sol-grid mx-auto grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {solutionOverviewCards.map((sol, i) => {
            const Icon = sol.icon
            return (
              <motion.div
                key={sol.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: easeOut }}
                className="h-full"
              >
                <Link
                  to={solutionProgramPath(sol.verticalId)}
                  className={`sol-card shimmer-card group relative flex h-full cursor-interactive flex-col overflow-hidden rounded-2xl border border-border/50 glass p-7 transition-all duration-300 lg:p-8 ${sol.borderGlow}`}
                  data-cursor="View"
                >
                  <div
                    className={`absolute left-0 right-0 top-0 h-0.5 ${sol.topBar} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />

                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 glass transition-transform duration-300 group-hover:-translate-y-0.5">
                      <Icon className={`h-5 w-5 ${sol.metricColor}`} strokeWidth={1.5} />
                    </div>
                    <span className={sol.chip}>{sol.tag}</span>
                  </div>

                  <h3 className="mb-3 text-xl font-bold leading-snug text-primary">{sol.headline}</h3>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-secondary">{sol.body}</p>

                  <div className="mb-6 flex gap-8 border-t border-border/40 pt-5">
                    {sol.metrics.map((m) => (
                      <div key={m.label}>
                        <span className={`metric text-2xl font-black ${sol.metricColor}`}>{m.value}</span>
                        <p className="mt-0.5 text-xs text-tertiary">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  <span
                    className={`flex items-center gap-2 pt-2 text-xs text-tertiary ${sol.metricColor} transition-colors`}
                  >
                    View program
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
