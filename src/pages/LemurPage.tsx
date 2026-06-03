import { Link } from 'react-router-dom'
import { PageTransition } from '../components/ui/PageTransition'
import { TextReveal } from '../components/ui/TextReveal'
import { LemurUseCasesSection } from '../components/sections/LemurUseCasesSection'
import { LemurFeaturesSection } from '../components/sections/LemurFeaturesSection'
import { TechnicalSpecsSection, lemurSpecs } from '../components/sections/TechnicalSpecsSection'
import { ArrowRight } from 'lucide-react'

export function LemurPage() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="hero-fullscreen relative border-b border-border/40 bg-ink">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,rgba(91,143,212,0.1),transparent_55%)]" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col px-6 pb-8 pt-[6.5rem] md:pt-28">
          <div className="hero-fullscreen-content flex flex-1 flex-col items-center justify-center text-center">
            <div
              className="chip chip-rose mb-6 opacity-0 translate-y-4 animate-fade-up"
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              Tactical Indoor Operations
            </div>

            <TextReveal
              text="Lemur 2"
              type="chars"
              playOnMount
              className="mb-6 block w-full text-[5rem] font-black leading-none tracking-tighter text-primary sm:text-[8rem] md:text-[10rem]"
              delay={0.3}
            />

            <TextReveal
              text="Gain intel. Communicate. De-escalate. Purpose-built for SWAT and tactical teams to clear rooms and negotiate safely."
              type="words"
              playOnMount
              className="mx-auto mb-10 block w-full max-w-2xl text-center text-lg leading-relaxed text-secondary md:text-xl"
              delay={0.9}
            />

            <div
              className="flex flex-wrap justify-center gap-4 opacity-0 animate-fade-up"
              style={{ animationDelay: '1.6s', animationFillMode: 'forwards' }}
            >
              <a href="#use-cases" className="btn-primary cursor-interactive" data-cursor="Explore">
                Explore Lemur 2
              </a>
              <Link to="/contact" className="btn-outline cursor-interactive" data-cursor="Contact">
                Request Demo
              </Link>
            </div>
          </div>

          <div
            className="pointer-events-none flex shrink-0 flex-col items-center gap-2 opacity-0 animate-fade-up"
            style={{ animationDelay: '2s', animationFillMode: 'forwards' }}
          >
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-rose/35 to-rose/20" aria-hidden />
            <span className="text-[10px] uppercase tracking-[0.2em] text-tertiary">Scroll to discover</span>
          </div>
        </div>
      </section>

      <LemurUseCasesSection />
      <LemurFeaturesSection />

      <TechnicalSpecsSection
        productName="Lemur 2"
        description="Indoor tactical specs — platform dimensions, endurance, and onboard sensor systems."
        highlights={lemurSpecs.highlights}
        groups={lemurSpecs.groups}
      />

      <section className="relative flex items-center justify-center overflow-hidden border-t border-border/40 bg-ink py-28 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(91,143,212,0.08),transparent_65%)]" />
        <div className="relative z-10 px-6 text-center">
          <h2 className="mb-6 text-4xl font-black text-primary md:text-6xl">Ready for your next callout?</h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-secondary">
            See Lemur 2 in a live tactical demo and learn how it pairs with Guardian for full-scene coverage.
          </p>
          <Link
            to="/contact"
            className="btn-primary cursor-interactive px-8 py-4 text-lg"
            data-cursor="Contact"
          >
            Request Demo
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </PageTransition>
  )
}
