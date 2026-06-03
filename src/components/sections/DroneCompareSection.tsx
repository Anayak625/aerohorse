import { motion } from 'framer-motion'
import { compareRows, droneCatalog } from '../../data/dronesContent'

const easeOut = [0.16, 1, 0.3, 1] as const

const barScores: Record<string, Record<string, number>> = {
  flightTime: { guardian: 95, lemur: 68 },
  weight: { guardian: 55, lemur: 92 },
  maxSpeed: { guardian: 98, lemur: 45 },
  environment: { guardian: 90, lemur: 88 },
  thermal: { guardian: 95, lemur: 95 },
  audio: { guardian: 70, lemur: 98 },
}

export function DroneCompareSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-void py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(37,99,235,0.08),transparent_55%)]" />

      <div className="relative px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="chip chip-indigo">Fleet analytics</span>
            <h2 className="mt-4 text-3xl font-black text-primary md:text-5xl">
              Head-to-head platform matrix
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-secondary">
              Animated capability index — outdoor endurance vs indoor agility. Deploy one or both.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {droneCatalog.map((d, di) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: di * 0.12, duration: 0.55, ease: easeOut }}
                className={`glass overflow-hidden rounded-2xl border ${
                  d.accent === 'gold' ? 'border-gold/25' : 'border-rose/25'
                }`}
              >
                <div
                  className="relative h-32 bg-cover bg-center"
                  style={{ backgroundImage: `url('${d.image}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-void/95 via-void/30 to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <h3
                      className={`text-2xl font-black ${d.accent === 'gold' ? 'text-gold' : 'text-rose'}`}
                    >
                      {d.shortName}
                    </h3>
                    <p className="text-xs text-secondary">{d.category}</p>
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  {compareRows.map((row, i) => {
                    const score = barScores[row.key]?.[d.id] ?? 50
                    return (
                      <div key={row.key}>
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="text-tertiary">{row.label}</span>
                          <span className="font-mono font-bold text-primary">{d.compare[row.key]}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-deep">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${score}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + i * 0.06, duration: 0.8, ease: easeOut }}
                            className={`h-full rounded-full ${
                              d.accent === 'gold'
                                ? 'bg-gradient-to-r from-gold/80 to-goldLight'
                                : 'bg-gradient-to-r from-rose/80 to-indigo'
                            }`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="mt-10 overflow-hidden rounded-2xl border border-border/50 glass"
          >
            <div className="grid grid-cols-3 border-b border-border/50 bg-panel/40 text-center">
              <div className="p-4 text-xs font-mono uppercase tracking-widest text-tertiary">Metric</div>
              {droneCatalog.map((d) => (
                <div key={d.id} className="border-l border-border/40 p-4">
                  <span className={`text-lg font-black ${d.accent === 'gold' ? 'text-gold' : 'text-rose'}`}>
                    {d.shortName}
                  </span>
                </div>
              ))}
            </div>
            {compareRows.map((row, i) => (
              <div
                key={row.key}
                className={`grid grid-cols-3 ${i % 2 === 0 ? 'bg-ink/20' : ''}`}
              >
                <div className="flex items-center p-4 text-sm text-secondary">{row.label}</div>
                {droneCatalog.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-center border-l border-border/40 p-4 text-center text-sm font-bold text-primary"
                  >
                    {d.compare[row.key]}
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
