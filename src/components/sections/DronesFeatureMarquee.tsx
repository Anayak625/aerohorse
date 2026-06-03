import { droneCatalog } from '../../data/dronesContent'

const items = droneCatalog.flatMap((d) =>
  d.features.map((f) => ({ text: f, accent: d.accent, name: d.shortName }))
)

const doubled = [...items, ...items]

export function DronesFeatureMarquee() {
  return (
    <section className="border-b border-border/40 bg-ink py-8 overflow-hidden">
      <div className="mb-4 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-tertiary">
        Platform capabilities
      </div>
      <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-4 px-2">
        {doubled.map((item, i) => (
          <div
            key={`${item.text}-${i}`}
            className={`flex shrink-0 items-center gap-3 rounded-full border px-5 py-2.5 ${
              item.accent === 'gold'
                ? 'border-gold/20 bg-goldGlow/50'
                : 'border-rose/20 bg-deep'
            }`}
          >
            <span className={`text-[10px] font-mono uppercase ${item.accent === 'gold' ? 'text-gold' : 'text-rose'}`}>
              {item.name}
            </span>
            <span className="text-sm font-medium text-secondary">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
