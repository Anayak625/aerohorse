import { Link } from 'react-router-dom'
import { TextReveal } from '../ui/TextReveal'
import { droneCatalog } from '../../data/dronesContent'

export function DronesCinematicHero() {
  return (
    <section className="hero-fullscreen relative border-b border-border/40 bg-ink">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.08),transparent_65%)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col px-6 pb-8 pt-[6.5rem] md:pt-28">
        <div className="hero-fullscreen-content flex flex-1 flex-col items-center justify-center text-center">
          <div
            className="chip chip-gold mb-6 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
            Aircraft catalog
          </div>

          <TextReveal
            text="Drones"
            type="chars"
            playOnMount
            className="mb-6 block w-full text-[4rem] font-black leading-none tracking-tighter text-primary sm:text-[6rem] md:text-[7.5rem]"
            delay={0.3}
          />

          <TextReveal
            text={`Explore ${droneCatalog.map((d) => d.name).join(' and ')} in interactive 3D — inspect components, compare specs, and open full product pages.`}
            type="words"
            playOnMount
            className="mx-auto mb-10 block w-full max-w-2xl text-center text-lg leading-relaxed text-secondary md:text-xl"
            delay={0.9}
          />

          <div
            className="flex flex-wrap justify-center gap-4 opacity-0 animate-fade-up"
            style={{ animationDelay: '1.6s', animationFillMode: 'forwards' }}
          >
            <a href="#explorer" className="btn-primary cursor-interactive" data-cursor="Explore">
              Explore in 3D
            </a>
            <Link to="/contact" className="btn-outline cursor-interactive" data-cursor="Contact">
              Request specs
            </Link>
          </div>
        </div>

        <div
          className="pointer-events-none flex shrink-0 flex-col items-center gap-2 opacity-0 animate-fade-up"
          style={{ animationDelay: '2s', animationFillMode: 'forwards' }}
        >
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-gold/35 to-gold/20" aria-hidden />
          <span className="text-[10px] uppercase tracking-[0.2em] text-tertiary">Scroll to discover</span>
        </div>
      </div>
    </section>
  )
}
