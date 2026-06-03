import { motion } from 'framer-motion'
import type { SolutionAccent, SolutionWorkflowStep } from '../../data/solutionsContent'
import { accentStyles } from '../../data/solutionsContent'

const easeOut = [0.16, 1, 0.3, 1] as const

const ringBorder: Record<SolutionAccent, string> = {
  gold: 'border-gold',
  rose: 'border-rose',
  indigo: 'border-indigo',
  sage: 'border-sage',
  live: 'border-live',
  amber: 'border-gold',
}

interface SolutionWorkflowTimelineProps {
  title?: string
  steps: SolutionWorkflowStep[]
  accent: SolutionAccent
}

export function SolutionWorkflowTimeline({
  title = 'How it works',
  steps,
  accent,
}: SolutionWorkflowTimelineProps) {
  const styles = accentStyles[accent]
  const ring = ringBorder[accent]

  return (
    <section className="border-b border-border/40 bg-ink py-20 lg:py-28">
      <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="mb-14 text-center text-3xl font-black text-primary md:text-4xl"
          >
            {title}
          </motion.h2>

          <div className="relative space-y-12">
            <div
              className={`absolute bottom-4 left-7 top-4 w-px bg-gradient-to-b from-transparent via-border to-transparent md:left-1/2 md:-translate-x-1/2`}
              aria-hidden
            />

            {steps.map((step, i) => {
              const isLeft = i % 2 === 0
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: easeOut }}
                  className="relative grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-12"
                >
                  <div
                    className={`absolute left-0 z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 bg-void font-mono text-sm font-bold md:left-1/2 md:-translate-x-1/2 ${ring} ${styles.icon}`}
                  >
                    {step.step}
                  </div>

                  <div
                    className={`pl-20 md:pl-0 ${isLeft ? 'md:pr-16 md:text-right' : 'md:col-start-2 md:pl-16'} ${!isLeft ? 'md:row-start-1' : ''}`}
                  >
                    <h3 className="text-xl font-bold text-primary md:text-2xl">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-secondary md:text-base">
                      {step.description}
                    </p>
                  </div>

                  <div className={`hidden md:block ${isLeft ? '' : 'md:col-start-1 md:row-start-1'}`} />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
