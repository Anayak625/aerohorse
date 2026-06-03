import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageTransition } from '../components/ui/PageTransition'
import { TextReveal } from '../components/ui/TextReveal'
import { SolutionsOverviewGrid } from '../components/sections/SolutionsOverviewGrid'
import { stats } from '../lib/site'

const quickStats = [
  { value: '6', label: 'Mission programs' },
  { value: stats.agencies, label: 'Agencies deployed' },
  { value: stats.fasterResponse, label: 'Faster response' },
  { value: stats.coverage, label: 'Program uptime' },
]

export function SolutionsPage() {
  return (
    <PageTransition>
      <section className="hero-fullscreen relative border-b border-border/40 bg-ink">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.08),transparent_65%)]" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col px-6 pb-8 pt-[6.5rem] md:pt-28">
          <div className="hero-fullscreen-content flex flex-1 flex-col items-center justify-center text-center">
            <div
              className="chip chip-indigo mb-6 opacity-0 animate-fade-up"
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              Mission programs overview
            </div>

            <TextReveal
              text="Solutions"
              type="chars"
              playOnMount
              className="mb-6 block w-full text-[4rem] font-black leading-none tracking-tighter text-primary sm:text-[6rem] md:text-[7.5rem]"
              delay={0.3}
            />

            <TextReveal
              text="Six tailored programs — each with its own page covering use cases, recommended aircraft, and how to deploy with AeroHorse."
              type="words"
              playOnMount
              className="mx-auto mb-10 block w-full max-w-2xl text-center text-lg leading-relaxed text-secondary md:text-xl"
              delay={0.9}
            />

            <div
              className="flex flex-wrap justify-center gap-4 opacity-0 animate-fade-up"
              style={{ animationDelay: '1.6s', animationFillMode: 'forwards' }}
            >
              <a href="#programs" className="btn-primary cursor-interactive" data-cursor="Explore">
                Browse programs
              </a>
              <Link to="/contact" className="btn-outline cursor-interactive" data-cursor="Contact">
                Talk to our team
              </Link>
            </div>
          </div>

          <div
            className="pointer-events-none flex shrink-0 flex-col items-center gap-2 opacity-0 animate-fade-up"
            style={{ animationDelay: '2s', animationFillMode: 'forwards' }}
          >
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-indigo/35 to-indigo/20" aria-hidden />
            <span className="text-[10px] uppercase tracking-[0.2em] text-tertiary">Scroll to discover</span>
          </div>
        </div>
      </section>

      <section className="border-b border-border/40 bg-void py-12">
        <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {quickStats.map((stat, i) => (
              <div
                key={stat.label}
                className="glass rounded-xl border border-border/50 px-4 py-5 text-center opacity-0 animate-fade-up"
                style={{ animationDelay: `${0.1 + i * 0.08}s`, animationFillMode: 'forwards' }}
              >
                <p className="metric text-2xl font-black text-primary lg:text-3xl">{stat.value}</p>
                <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-tertiary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SolutionsOverviewGrid />

      <section className="relative overflow-hidden border-t border-border/40 bg-ink py-28 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.06),transparent_70%)]" />
        <div className="relative z-10 px-6 text-center">
          <h2 className="mb-6 text-4xl font-black text-primary md:text-6xl">Not sure where to start?</h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-secondary">
            Our team will help you choose the right program — DFR, tactical indoor, SAR, fire, healthcare, or
            logistics — and the right mix of Guardian and Lemur 2.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/contact" className="btn-primary cursor-interactive px-8 py-4 text-lg" data-cursor="Contact">
              Request Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/guardian" className="btn-outline cursor-interactive" data-cursor="Explore">
              View products
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
