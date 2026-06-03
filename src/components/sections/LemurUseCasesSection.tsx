import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Users, FlaskConical } from 'lucide-react'
import { TextReveal } from '../ui/TextReveal'

const useCases = [
  {
    id: 'barricades',
    title: 'Barricades',
    icon: Building2,
    headline: 'See inside before you breach',
    description:
      'Position Lemur at windows and doorways to map the space, identify subjects, and spot weapons — without putting an officer in the fatal funnel.',
    image:
      'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2008&auto=format&fit=crop',
    feedLabel: 'Barricade overwatch',
  },
  {
    id: 'hostage',
    title: 'Hostage rescue',
    icon: Users,
    headline: 'Intel that buys time to negotiate',
    description:
      'Maintain eyes and ears inside while negotiators work. Two-way audio lets teams communicate through the drone without exposing personnel.',
    image:
      'https://images.unsplash.com/photo-1589820293931-09327a2b3c0d?q=80&w=2070&auto=format&fit=crop',
    feedLabel: 'Crisis negotiation',
  },
  {
    id: 'hazmat',
    title: 'HazMat response',
    icon: FlaskConical,
    headline: 'Recon without crossing the hot zone',
    description:
      'Inspect containers, valves, and placards from a safe standoff. Thermal and low-light sensors reveal leaks and heat signatures crews cannot see from the ground.',
    image:
      'https://images.unsplash.com/photo-1576086213369-97a306d5de46?q=80&w=2080&auto=format&fit=crop',
    feedLabel: 'HazMat assessment',
  },
] as const

const PANEL_HEIGHT = 'min(420px, 52vh)'

export function LemurUseCasesSection() {
  const [active, setActive] = useState(0)
  const current = useCases[active]

  return (
    <section id="use-cases" className="relative overflow-hidden border-t border-border/40 bg-ink py-20 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(91,143,212,0.08),transparent_55%)] pointer-events-none" />

      <div className="relative z-10 px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="">
          <div className="mb-12 text-center lg:mb-16">
            <span
              className="chip chip-rose opacity-0 animate-fade-up"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              Mission profiles
            </span>
            <h2 className="mt-5 text-4xl font-black tracking-tight text-primary lg:text-[3.25rem] lg:leading-[1.08]">
              <TextReveal text="Built for the calls" type="words" delay={0.15} />
              <br />
              <span className="grad-rose">
                <TextReveal text="that cannot wait" type="words" delay={0.35} />
              </span>
            </h2>
          </div>

          <div
            className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
            style={{ ['--panel-h' as string]: PANEL_HEIGHT }}
          >
            {/* Tabs — compact, equal height, no duplicate body copy */}
            <div
              role="tablist"
              aria-label="Mission profiles"
              className="grid grid-rows-3 gap-3 lg:col-span-4 lg:h-[var(--panel-h)]"
            >
              {useCases.map((item, i) => {
                const Icon = item.icon
                const isActive = i === active
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`use-case-panel-${item.id}`}
                    id={`use-case-tab-${item.id}`}
                    onClick={() => setActive(i)}
                    className={`flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-300 ${
                      isActive
                        ? 'border-rose/40 bg-void shadow-soft ring-1 ring-rose/15'
                        : 'border-border/50 bg-void/50 hover:border-rose/20 hover:bg-void'
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                        isActive ? 'border-rose/30 bg-goldGlow text-rose' : 'border-border/60 bg-deep/80 text-tertiary'
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-tertiary">
                        0{i + 1}
                      </span>
                      <h3 className={`truncate text-base font-bold sm:text-lg ${isActive ? 'text-rose' : 'text-primary'}`}>
                        {item.title}
                      </h3>
                    </div>
                    <span
                      className={`hidden h-8 w-1 shrink-0 rounded-full sm:block ${isActive ? 'bg-rose' : 'bg-transparent'}`}
                      aria-hidden
                    />
                  </button>
                )
              })}
            </div>

            {/* Preview panel */}
            <div
              role="tabpanel"
              id={`use-case-panel-${current.id}`}
              aria-labelledby={`use-case-tab-${current.id}`}
              className="lg:col-span-8 lg:h-[var(--panel-h)]"
            >
              <div className="relative h-[var(--panel-h)] w-full overflow-hidden rounded-2xl border border-border/60 bg-void shadow-soft">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${current.image}')` }}
                    />
                    <div className="absolute inset-0 bg-slate-900/25 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-void via-void/75 to-void/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-void/90 via-void/35 to-transparent lg:max-w-[70%]" />
                  </motion.div>
                </AnimatePresence>

                <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8 lg:p-10">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="live-dot" />
                    <span className="font-mono text-xs uppercase tracking-widest text-secondary">
                      {current.feedLabel}
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="max-w-xl"
                    >
                      <h3 className="text-2xl font-black leading-tight text-primary sm:text-3xl lg:text-4xl">
                        {current.headline}
                      </h3>
                      <p className="mt-4 text-sm leading-relaxed text-secondary sm:text-base">
                        {current.description}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
