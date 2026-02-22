import { TextReveal, FadeIn } from '../components/TextReveal'

const features = [
  { icon: '🛸', title: 'Autonomous Flight', desc: 'AI-powered navigation with real-time obstacle avoidance' },
  { icon: '📍', title: 'Geofenced Corridors', desc: 'Pre-approved flight paths for safe, predictable routes' },
  { icon: '🔒', title: 'Secure Pods', desc: 'Biometric access with climate control for every package' },
  { icon: '⚡', title: 'Live ETA', desc: 'Track from dispatch to door with minute-by-minute updates' },
]

export default function Technology() {
  return (
    <section className="relative py-20 sm:py-28 md:py-48 lg:py-64 overflow-hidden bg-white">
      <div className="mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="grid gap-10 sm:gap-14 md:gap-16 lg:grid-cols-2 lg:gap-24 lg:items-center">
          <div>
            <FadeIn>
              <p className="mb-4 sm:mb-6 text-xs font-medium uppercase tracking-[0.4em] text-teal-600">
                Technology
              </p>
            </FadeIn>
            <h2 className="text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl md:text-6xl lg:text-7xl">
              <TextReveal delay={0.1} stagger={0.04}>
                Autonomous drones.
              </TextReveal>
              <TextReveal className="text-stone-400" delay={0.3} stagger={0.04}>
                Smart pods.
              </TextReveal>
              <TextReveal className="text-stone-400" delay={0.5} stagger={0.04}>
                Real-time routing.
              </TextReveal>
            </h2>
            <FadeIn delay={0.7} className="mt-4 sm:mt-6 md:mt-8">
              <p className="text-base sm:text-lg md:text-xl text-stone-500 leading-relaxed">
                Our drones fly predefined corridors to pods. The system assigns the nearest rider and optimizes the final leg. Every step is monitored and secure.
              </p>
            </FadeIn>
          </div>
          
          <FadeIn delay={0.4} className="relative">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group relative rounded-xl sm:rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-6 transition-all duration-300 hover:border-stone-300 hover:bg-white hover:shadow-md"
                  data-cursor-hover
                >
                  <span className="text-3xl">{f.icon}</span>
                  <h3 className="mt-4 text-lg font-semibold text-stone-800">{f.title}</h3>
                  <p className="mt-2 text-sm text-stone-500">{f.desc}</p>
                </div>
              ))}
            </div>
            
            {/* Decorative glow */}
            <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-stone-500/10 blur-3xl" />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
