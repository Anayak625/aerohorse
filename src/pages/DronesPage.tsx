import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageTransition } from '../components/ui/PageTransition'
import { DronesCinematicHero } from '../components/sections/DronesCinematicHero'
import { DronesCommandCenter } from '../components/sections/DronesCommandCenter'
import { DronesFeatureMarquee } from '../components/sections/DronesFeatureMarquee'
import { DroneCompareSection } from '../components/sections/DroneCompareSection'
import { TechnicalSpecsSection } from '../components/sections/TechnicalSpecsSection'
import { droneCatalog } from '../data/dronesContent'

export function DronesPage() {
  const [specDroneId, setSpecDroneId] = useState(droneCatalog[0].id)
  const specDrone = droneCatalog.find((d) => d.id === specDroneId) ?? droneCatalog[0]

  return (
    <PageTransition>
      <DronesCinematicHero />
      <DronesFeatureMarquee />
      <DronesCommandCenter />
      <DroneCompareSection />

      <section className="border-b border-border/40 bg-void py-16">
        <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3">
            {droneCatalog.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSpecDroneId(d.id)}
                className={`cursor-interactive rounded-lg border px-5 py-2.5 text-sm font-bold transition-all ${
                  specDroneId === d.id
                    ? d.accent === 'gold'
                      ? 'border-gold/40 bg-goldGlow text-gold'
                      : 'border-rose/40 bg-deep text-rose'
                    : 'border-border/50 text-secondary hover:text-primary'
                }`}
              >
                {d.name} specs
              </button>
            ))}
          </div>
        </div>
      </section>

      <TechnicalSpecsSection
        key={specDrone.id}
        productName={specDrone.name}
        description={`Complete ${specDrone.name} specifications for procurement, integration, and field deployment.`}
        highlights={specDrone.highlights}
        groups={specDrone.groups}
      />

      <section className="border-b border-border/40 bg-ink py-20">
        <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            {droneCatalog.map((d) => (
              <Link
                key={d.id}
                to={d.detailHref}
                className={`group cursor-interactive overflow-hidden rounded-2xl border bg-void transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg ${
                  d.accent === 'gold' ? 'border-gold/20 hover:border-gold/35' : 'border-rose/20 hover:border-rose/35'
                }`}
                data-cursor="View"
              >
                <div
                  className="h-44 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${d.image}')` }}
                />
                <div className="p-5">
                  <h3 className={`text-xl font-black ${d.accent === 'gold' ? 'text-gold' : 'text-rose'}`}>{d.name}</h3>
                  <p className="mt-1 text-sm text-secondary">{d.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-tertiary group-hover:text-primary">
                    View product page
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.08),transparent_65%)]" />
        <div className="relative z-10 px-6 text-center">
          <h2 className="text-3xl font-black text-primary md:text-5xl">Ready to spec your fleet?</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-secondary">
            Our team will help you match Guardian, Lemur 2, or both to your mission profiles.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/contact" className="btn-primary cursor-interactive px-8 py-4 text-lg" data-cursor="Contact">
              Request Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/solutions" className="btn-outline cursor-interactive" data-cursor="Explore">
              View solutions
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
