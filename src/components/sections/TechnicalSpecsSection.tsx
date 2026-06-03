import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TextReveal } from '../ui/TextReveal'

export interface SpecHighlight {
  value: string
  unit?: string
  label: string
}

export interface SpecItem {
  label: string
  value: string
}

export interface SpecGroup {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  chip: string
  iconWrap: string
  iconColor: string
  border: string
  specs: SpecItem[]
}

const easeOut = [0.16, 1, 0.3, 1] as const

interface TechnicalSpecsSectionProps {
  productName: string
  description?: string
  highlights: SpecHighlight[]
  groups: SpecGroup[]
}

export function TechnicalSpecsSection({
  productName,
  description = 'Full performance and payload details for procurement and integration planning.',
  highlights,
  groups,
}: TechnicalSpecsSectionProps) {
  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-void py-20 lg:py-28">
      <div className="absolute inset-0 bg-dots opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(37,99,235,0.06),transparent_55%)] pointer-events-none" />

      <div className="relative z-10 px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="">
          <div className="mb-12 text-center lg:mb-16">
            <span
              className="chip chip-gold opacity-0 animate-fade-up"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              Specifications
            </span>
            <h2 className="mt-5 text-4xl font-black tracking-tight text-primary lg:text-[3.25rem] lg:leading-[1.08]">
              <TextReveal text="Technical" type="words" delay={0.15} />{' '}
              <span className="grad-gold">
                <TextReveal text="Specifications" type="words" delay={0.3} />
              </span>
            </h2>
            <p
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-secondary opacity-0 animate-fade-up"
              style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
            >
              {description}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: easeOut }}
            className="mb-10 grid grid-cols-2 gap-3 sm:gap-4 lg:mb-14 lg:grid-cols-4"
          >
            {highlights.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: easeOut }}
                className="glass rounded-xl border border-border/60 px-4 py-5 text-center transition-shadow duration-300 hover:border-gold/25 hover:shadow-soft"
              >
                <p className="metric text-2xl font-black text-primary sm:text-3xl">
                  {h.value}
                  {h.unit && (
                    <span className="ml-0.5 text-base font-semibold text-tertiary sm:text-lg">{h.unit}</span>
                  )}
                </p>
                <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-tertiary">{h.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            {groups.map((group, gi) => {
              const Icon = group.icon
              return (
                <motion.article
                  key={group.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.55, delay: gi * 0.1, ease: easeOut }}
                  className={`glass overflow-hidden rounded-2xl border ${group.border} transition-shadow duration-300 hover:shadow-soft-lg`}
                >
                  <div className="border-b border-border/50 bg-deep/40 px-6 py-5 sm:px-8">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${group.iconWrap}`}
                      >
                        <Icon className={`h-6 w-6 ${group.iconColor}`} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 text-left">
                        <span className={`chip ${group.chip} mb-2`}>{group.id}</span>
                        <h3 className="text-xl font-bold text-primary">{group.title}</h3>
                        <p className="mt-1 text-sm text-secondary">{group.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <ul className="divide-y divide-border/50 px-6 sm:px-8" role="list">
                    {group.specs.map((spec) => (
                      <li
                        key={spec.label}
                        className="group/spec grid grid-cols-1 gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-6"
                      >
                        <span className="text-sm text-secondary">{spec.label}</span>
                        <span className="font-mono text-sm font-medium leading-snug text-primary sm:text-right">
                          {spec.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: easeOut, delay: 0.15 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/50 bg-ink/50 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left lg:mt-12"
          >
            <div>
              <p className="text-sm font-semibold text-primary">Need the full data package?</p>
              <p className="mt-1 text-sm text-secondary">
                Our team can share detailed integration docs and compliance materials for {productName}.
              </p>
            </div>
            <Link to="/contact" className="btn-outline shrink-0 cursor-interactive" data-cursor="Contact">
              Request full specs
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

import { guardianSpecsData, lemurSpecsData } from '../../data/droneSpecsData'

export const guardianSpecs = guardianSpecsData
export const lemurSpecs = lemurSpecsData
