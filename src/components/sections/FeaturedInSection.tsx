import { pressOutlets } from '../../lib/site'

export function FeaturedInSection() {
  return (
    <section className="py-10 lg:py-12 border-y border-border/40 bg-ink/50 relative overflow-hidden">
      <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16 ">
        <p className="text-center text-[11px] font-mono uppercase tracking-[0.25em] text-tertiary mb-7">
          As featured in
        </p>
        <div
          className="relative overflow-hidden"
          style={{ maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}
        >
          <div className="flex items-center gap-12 lg:gap-16 animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
            {[...pressOutlets, ...pressOutlets].map((name, i) => (
              <span
                key={i}
                className="font-mono text-sm lg:text-base font-semibold tracking-wide text-tertiary/70 hover:text-secondary transition-colors duration-300 select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
