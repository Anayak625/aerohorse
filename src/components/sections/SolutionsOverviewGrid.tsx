import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TextReveal } from '../ui/TextReveal'
import { solutionOverviewCards, solutionProgramPath } from '../../data/solutionsContent'

const easeOut = [0.16, 1, 0.3, 1] as const

export function SolutionsOverviewGrid() {
  return (
    <section id="programs" className="relative border-t border-border/40 bg-void py-20 lg:py-28">
      <div className="absolute inset-0 bg-dots opacity-15 pointer-events-none" />

      <div className="relative z-10 px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="">
          <div className="mb-12 text-center lg:mb-14">
            <h2 className="text-3xl font-black tracking-tight text-primary lg:text-4xl">
              <TextReveal text="Six programs." type="words" delay={0.1} />{' '}
              <span className="grad-indigo">
                <TextReveal text="One platform." type="words" delay={0.25} />
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-secondary">
              Open a program page for full use cases, recommended aircraft, and deployment guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {solutionOverviewCards.map((sol, i) => {
              const Icon = sol.icon
              return (
                <motion.div
                  key={sol.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.55, delay: i * 0.06, ease: easeOut }}
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

                    <span className={`flex items-center gap-2 text-xs text-tertiary ${sol.metricColor} transition-colors`}>
                      Open program page
                      <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
