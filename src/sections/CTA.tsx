import { TextReveal, FadeIn } from '../components/TextReveal'

export default function CTA() {
  return (
    <section id="contact" className="relative py-32 md:py-48 lg:py-64 overflow-hidden bg-stone-50">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-teal-500/5 via-transparent to-transparent" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-teal-500/5 blur-3xl" />
      
      <div className="relative mx-auto max-w-5xl px-8 text-center md:px-12">
        <FadeIn>
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-teal-600">
            Get started
          </p>
        </FadeIn>
        
        <h2 className="text-5xl font-bold tracking-tight text-stone-800 md:text-7xl lg:text-8xl">
          <TextReveal delay={0.1} stagger={0.03}>
            Ready to ship with
          </TextReveal>
          <TextReveal className="gradient-text" delay={0.4} stagger={0.03}>
            Aerohorse?
          </TextReveal>
        </h2>
        
        <FadeIn delay={0.6} className="mt-8 mx-auto max-w-2xl">
          <p className="text-xl text-stone-500 leading-relaxed">
            Partner with us for last-mile delivery, or get in touch to bring smart pods to your city. 
            The future of logistics is here.
          </p>
        </FadeIn>
        
        <FadeIn delay={0.8} className="mt-14 flex flex-wrap justify-center gap-5">
          <a
            href="mailto:hello@aerohorse.com"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-teal-600 px-10 py-5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition-all duration-300 hover:bg-teal-700 hover:scale-105"
            data-cursor-hover
          >
            <span>Contact sales</span>
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="#journey"
            className="inline-flex items-center rounded-full border border-stone-300 bg-white px-10 py-5 text-sm font-semibold text-stone-700 transition-all duration-300 hover:border-stone-400 hover:shadow-md hover:scale-105"
            data-cursor-hover
          >
            Explore the journey
          </a>
        </FadeIn>
        
        {/* Trust indicators */}
        <FadeIn delay={1} className="mt-20 flex flex-wrap items-center justify-center gap-8 text-stone-400">
          <span className="text-sm">Trusted by forward-thinking companies</span>
          <div className="flex gap-8">
            {['TechCorp', 'LogiFlow', 'UrbanAir'].map((name) => (
              <span key={name} className="text-sm font-medium text-stone-500">{name}</span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
