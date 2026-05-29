import { motion } from 'framer-motion'
import { ArrowRight, Mail, Phone, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TextReveal } from '../ui/TextReveal'
import { partnerAgencies as partners, contact, stats } from '../../lib/site'

const testimonials = [
  {
    quote: "AeroHorse cut our response times by over 40%. It's the most impactful technology we've adopted in a decade.",
    author: 'Chief Martinez',
    role: 'Phoenix Police Department',
    stars: 5,
  },
  {
    quote: "Our DFR program has cleared hundreds of calls without dispatching a single unit. The ROI has been extraordinary.",
    author: 'Commander Williams',
    role: 'Travis County Sheriff',
    stars: 5,
  },
  {
    quote: "When seconds count, Guardian is already on scene. It has saved lives we couldn't have saved otherwise.",
    author: 'Deputy Chief Johnson',
    role: 'Seattle Fire Department',
    stars: 5,
  },
]

export function MissionSection() {
  return (
    <section id="mission" className="relative overflow-hidden">
      {/* Marquee */}
      <div className="border-y border-border/40 bg-ink/60 py-4 overflow-hidden cursor-interactive" data-cursor="Partners">
        <div className="flex gap-0 animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...partners, ...partners].map((p, i) => (
            <span key={i} className="font-mono text-[11px] text-tertiary uppercase tracking-widest px-6 hover:text-gold transition-colors duration-300">
              {p}
              <span className="ml-6 text-border">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 lg:py-20 border-b border-border/40">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="chip chip-gold opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>Trusted by Agencies</span>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mt-5 text-primary">
              <TextReveal text="What Commanders Say" type="words" delay={0.3} />
            </h2>
          </div>
          <div className="testimonials grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.12 }}
                className="testimonial-card shimmer-card glass border border-border/50 rounded-2xl p-7 relative overflow-hidden group cursor-interactive" data-cursor="Review"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent group-hover:via-gold/70 transition-colors duration-500" />
                <div className="flex gap-1 mb-5 group-hover:scale-105 transform origin-left transition-transform duration-300">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-sm text-secondary leading-relaxed mb-6 italic group-hover:text-primary transition-colors">"{t.quote}"</p>
                <div className="flex flex-col gap-0.5 mt-auto pt-2 border-t border-border/30">
                  <span className="text-sm font-bold text-primary">{t.author}</span>
                  <span className="text-xs text-tertiary">{t.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission + Contact */}
      <div className="py-16 lg:py-24 relative">
        <div className="absolute inset-0 bg-dots opacity-25 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/[0.04] blur-[100px] rounded-full pointer-events-none" />

        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left — Mission */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="miss-left flex flex-col gap-6"
            >
              <div className="space-y-5">
                <span className="chip chip-rose">Our Mission</span>
                <h2 className="text-4xl lg:text-[3.25rem] font-black tracking-tight leading-tight">
                  <TextReveal text="Technology in the" type="words" delay={0.1} />
                  <br />
                  <span className="grad-gold">
                    <TextReveal text="Service of Life" type="words" delay={0.4} />
                  </span>
                </h2>
                <div className="mt-2">
                  <p className="text-secondary text-base leading-relaxed max-w-md">
                    AeroHorse was built on one belief: every person deserves the fastest, safest emergency response possible.
                    We build the tools that make that real — one deployment at a time.
                  </p>
                </div>
              </div>

              {/* Values */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'USA Manufactured', desc: 'Built & tested on US soil', color: 'border-gold/20' },
                  { label: 'NDAA Compliant', desc: 'Federal procurement ready', color: 'border-rose/20' },
                  { label: 'OTA Updates', desc: 'Always improving, free of charge', color: 'border-indigo/20' },
                  { label: 'Safeguard Program', desc: 'Unlimited repair & replacement', color: 'border-sage/20' },
                ].map((v) => (
                  <div key={v.label} className={`glass border ${v.color} rounded-xl p-5 hover:bg-panel/60 transition-colors duration-200 cursor-interactive group`} data-cursor="Value">
                    <p className="text-sm font-bold text-primary mb-1.5 group-hover:text-gold transition-colors">{v.label}</p>
                    <p className="text-xs text-secondary/80">{v.desc}</p>
                  </div>
                ))}
              </div>

              {/* Large number */}
              <div className="glass-gold rounded-2xl p-8 flex flex-col gap-2 cursor-interactive group" data-cursor="Trust">
                <span className="number-huge text-gold group-hover:scale-105 origin-left transition-transform duration-500">{stats.agencies}</span>
                <p className="text-sm text-secondary">agencies actively deploying AeroHorse technology across {stats.states} states</p>
              </div>

              <Link to="/contact" className="btn-primary w-fit group cursor-interactive" data-cursor="Read">
                Learn Our Story
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

            {/* Right — Contact form */}
            <motion.div
              id="contact"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="miss-right"
            >
              <div className="glass border border-border/50 rounded-2xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent group-hover:via-gold/70 transition-colors duration-700" />
                <div className="absolute -top-8 left-8 w-24 h-24 bg-gold/5 blur-2xl rounded-full" />

                <div className="flex flex-col gap-6 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black text-primary mb-1.5">Request a Demo</h3>
                    <p className="text-sm text-secondary">See AeroHorse in action with a live flight tailored to your agency.</p>
                  </div>

                  <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-tertiary">First Name</label>
                        <input type="text" placeholder="First" className="field cursor-interactive" data-cursor="Type" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-tertiary">Last Name</label>
                        <input type="text" placeholder="Last" className="field cursor-interactive" data-cursor="Type" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-tertiary">Agency Email</label>
                      <input type="email" placeholder="you@department.gov" className="field cursor-interactive" data-cursor="Type" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-tertiary">Department / Agency</label>
                      <input type="text" placeholder="Los Angeles Police Department" className="field cursor-interactive" data-cursor="Type" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-tertiary">Message (optional)</label>
                      <textarea placeholder="Tell us about your program needs..." className="field resize-none cursor-interactive" data-cursor="Type" rows={3} />
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary justify-center py-3.5 text-sm font-bold w-full mt-2 cursor-interactive"
                      data-cursor="Send"
                    >
                      Send Request
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </motion.button>
                  </form>

                  <div className="divider" />

                  <div className="flex flex-col gap-3">
                    {[
                      { icon: Mail, text: contact.email },
                      { icon: Phone, text: contact.phone },
                      { icon: MapPin, text: contact.location },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3 text-sm text-secondary cursor-interactive w-fit hover:text-primary transition-colors">
                        <Icon className="w-4 h-4 text-gold/60 flex-shrink-0" strokeWidth={1.5} />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
