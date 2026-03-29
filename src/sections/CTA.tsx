import { TextReveal, FadeIn } from '../components/TextReveal'
import { MagneticButton } from '../components/MagneticButton'

export default function CTA() {
  return (
    <section id="contact" className="relative py-20 sm:py-28 md:py-48 lg:py-64 overflow-hidden bg-stone-50">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-teal-500/5 via-transparent to-transparent" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-teal-500/5 blur-3xl" />
      
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center md:px-12">
        <FadeIn>
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-teal-600">
            Let's talk
          </p>
        </FadeIn>
        
        <h2 className="text-4xl font-bold tracking-tight text-stone-800 sm:text-5xl md:text-7xl lg:text-8xl">
          <TextReveal delay={0.1} stagger={0.03}>
            Ready to ship smarter?
          </TextReveal>
          <TextReveal className="gradient-text" delay={0.4} stagger={0.03}>
            We're here.
          </TextReveal>
        </h2>
        
        <FadeIn delay={0.6} className="mt-4 sm:mt-6 md:mt-8 mx-auto max-w-2xl">
          <p className="text-base sm:text-lg md:text-xl text-stone-500 leading-relaxed">
            Partner with us for drone-to-pod delivery or explore bringing smart pods to your city. 
            Less congestion, lower emissions, faster drops.
          </p>
        </FadeIn>
        
        <FadeIn delay={0.8} className="mt-8 sm:mt-10 md:mt-14 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-5 items-stretch sm:items-center">
          <MagneticButton className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-teal-600 px-6 py-4 sm:px-10 sm:py-5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition-all duration-300 hover:bg-teal-700 min-h-[44px] cursor-pointer"
            onClick={() => window.location.href = 'mailto:hello@aerohorse.com'}
          >
            <span>Talk to sales</span>
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </MagneticButton>
          <a
            href="#journey"
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-4 sm:px-10 sm:py-5 text-sm font-semibold text-stone-700 transition-all duration-300 hover:border-stone-400 hover:shadow-md hover:scale-105 min-h-[44px]"
            data-cursor-hover
          >
            See the journey
          </a>
        </FadeIn>
        
        {/* Trust indicators */}
        <FadeIn delay={1} className="mt-12 sm:mt-16 md:mt-20 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8 text-stone-600">
          <span className="text-xs sm:text-sm">Trusted by brands that care about speed and sustainability</span>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
            {['TechCorp', 'LogiFlow', 'UrbanAir'].map((name) => (
              <span key={name} className="text-sm font-medium text-stone-500">{name}</span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
