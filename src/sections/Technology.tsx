import { TextReveal, FadeIn } from '../components/TextReveal'
import { ScrambleText } from '../components/ScrambleText'

const features = [
  { icon: '🛸', title: 'Autonomous flight', desc: 'AI navigation and real-time obstacle avoidance so every run is safe and on time' },
  { icon: '📍', title: 'Approved flight paths', desc: 'Geofenced corridors—no surprises, just predictable routes' },
  { icon: '🔒', title: 'Secure, climate-controlled pods', desc: 'Your package stays safe and at the right temperature until pickup' },
  { icon: '⚡', title: 'Live tracking & ETA', desc: 'From dispatch to the pod, minute-by-minute updates so you know exactly when to collect' },
]

export default function Technology() {
  return (
    <section className="relative py-20 sm:py-28 md:py-48 lg:py-64 overflow-hidden bg-white">
      <div className="mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="grid gap-10 sm:gap-14 md:gap-16 lg:grid-cols-2 lg:gap-24 lg:items-center">
          <div>
            <FadeIn>
              <p className="mb-4 sm:mb-6 text-xs font-medium uppercase tracking-[0.4em] text-teal-600">
                How we do it
              </p>
            </FadeIn>
            <h2 className="text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl md:text-6xl lg:text-7xl">
              <div>
                <ScrambleText text="Drones that fly. Pods that wait." delay={200} speed={35} />
              </div>
              <TextReveal className="text-stone-600" delay={0.3} stagger={0.04}>
                You pick up when you’re ready.
              </TextReveal>
            </h2>
            <FadeIn delay={0.7} className="mt-4 sm:mt-6 md:mt-8">
              <p className="text-base sm:text-lg md:text-xl text-stone-500 leading-relaxed">
                Drones follow safe corridors to pods. Our system routes each package to the nearest locker and keeps it secure until you arrive. Live tracking and alerts at every step.
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
