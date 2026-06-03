import { Link } from 'react-router-dom'
import { TextReveal } from '../ui/TextReveal'
import type { EnrichedSolutionVertical, SolutionAccent } from '../../data/solutionsContent'
import { accentStyles } from '../../data/solutionsContent' // used in ImpactStrip

const heroRadial: Record<SolutionAccent, string> = {
  gold: 'rgba(37,99,235,0.1)',
  rose: 'rgba(91,143,212,0.12)',
  indigo: 'rgba(91,143,212,0.1)',
  sage: 'rgba(91,143,212,0.09)',
  live: 'rgba(5,150,105,0.1)',
  amber: 'rgba(37,99,235,0.08)',
}

const scrollLine: Record<SolutionAccent, string> = {
  gold: 'via-gold/35 to-gold/20',
  rose: 'via-rose/35 to-rose/20',
  indigo: 'via-indigo/35 to-indigo/20',
  sage: 'via-sage/35 to-sage/20',
  live: 'via-live/35 to-live/20',
  amber: 'via-gold/35 to-gold/20',
}

/** Short display title for large char reveal (Guardian-style) */
const heroDisplayTitle: Record<string, string> = {
  dfr: 'DFR',
  'search-rescue': 'SAR',
}

function titleSizeClass(text: string): string {
  const len = text.length
  if (len <= 8) {
    return 'text-[5rem] sm:text-[8rem] md:text-[10rem]'
  }
  if (len <= 14) {
    return 'text-[4rem] sm:text-[6.5rem] md:text-[8rem]'
  }
  if (len <= 20) {
    return 'text-[3.25rem] sm:text-[5rem] md:text-[7rem]'
  }
  return 'text-[2.75rem] sm:text-[4rem] md:text-[5.5rem]'
}

interface SolutionProgramHeroProps {
  vertical: EnrichedSolutionVertical
}

export function SolutionProgramHero({ vertical }: SolutionProgramHeroProps) {
  const displayTitle = heroDisplayTitle[vertical.id] ?? vertical.title
  const titleClass = titleSizeClass(displayTitle)
  const radial = heroRadial[vertical.accent]
  const line = scrollLine[vertical.accent]

  return (
    <section className="hero-fullscreen relative border-b border-border/40 bg-ink">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse at top center, ${radial}, transparent 58%)`,
        }}
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col px-6 pb-8 pt-[6.5rem] md:pt-28">
        <nav
          className="mb-6 flex shrink-0 items-center justify-center gap-2 text-sm text-tertiary"
          aria-label="Breadcrumb"
        >
          <Link to="/solutions" className="transition-colors hover:text-primary">
            Solutions
          </Link>
          <span aria-hidden>/</span>
          <span className="text-secondary">{vertical.title}</span>
        </nav>

        <div className="hero-fullscreen-content flex flex-1 flex-col items-center justify-center text-center">
          <div
            className={`chip ${vertical.chip} mb-6 max-w-xl opacity-0 translate-y-4 animate-fade-up`}
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
            {vertical.title}
          </div>

          <TextReveal
            text={displayTitle}
            type="chars"
            playOnMount
            className={`mb-6 block w-full font-black leading-none tracking-tighter text-primary ${titleClass}`}
            delay={0.3}
          />

          <TextReveal
            text={`${vertical.headline}. ${vertical.body}`}
            type="words"
            playOnMount
            className="mx-auto mb-10 block w-full max-w-2xl text-center text-lg leading-relaxed text-secondary md:text-xl"
            delay={0.9}
          />

          <div
            className="flex flex-wrap justify-center gap-4 opacity-0 animate-fade-up"
            style={{ animationDelay: '1.6s', animationFillMode: 'forwards' }}
          >
            <a href="#program" className="btn-primary cursor-interactive" data-cursor="Explore">
              Explore program
            </a>
            <Link to="/contact" className="btn-outline cursor-interactive" data-cursor="Contact">
              Request briefing
            </Link>
          </div>
        </div>

        <div
          className="pointer-events-none flex shrink-0 flex-col items-center gap-2 opacity-0 animate-fade-up"
          style={{ animationDelay: '2s', animationFillMode: 'forwards' }}
        >
          <div
            className={`h-12 w-px bg-gradient-to-b from-transparent ${line}`}
            aria-hidden
          />
          <span className="text-[10px] uppercase tracking-[0.2em] text-tertiary">Scroll to discover</span>
        </div>
      </div>
    </section>
  )
}

interface SolutionProgramImpactStripProps {
  vertical: EnrichedSolutionVertical
}

export function SolutionProgramImpactStrip({ vertical }: SolutionProgramImpactStripProps) {
  const styles = accentStyles[vertical.accent]

  return (
    <section
      id="program"
      className="border-b border-border/40 bg-void py-12 lg:py-14 scroll-mt-24"
    >
      <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {vertical.stats.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-xl border border-border/50 px-4 py-5 text-center md:px-5 md:py-6"
            >
              <p className={`metric text-2xl font-black md:text-3xl ${styles.icon}`}>
                {stat.value}
                {stat.unit && (
                  <span className="ml-0.5 text-base font-semibold text-tertiary md:text-lg">
                    {stat.unit}
                  </span>
                )}
              </p>
              <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-tertiary">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
