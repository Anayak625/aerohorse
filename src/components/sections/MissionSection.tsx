import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, Phone, MapPin, Star } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const partners = [
  'LAPD', 'SFPD', 'Miami PD', 'Denver Fire', 'Travis County', 'Phoenix PD',
  'Clark County SAR', 'NYPD ESU', 'Seattle FD', 'Dallas PD', 'Austin PD', 'Chicago FD',
]

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
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.from('.miss-left', {
        opacity: 0, x: -50, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.miss-left', start: 'top 80%', once: true },
      })
      gsap.from('.miss-right', {
        opacity: 0, x: 50, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.miss-right', start: 'top 80%', once: true },
      })
      gsap.from('.testimonial-card', {
        opacity: 0, y: 40, stagger: 0.15, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: '.testimonials', start: 'top 82%', once: true },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="mission" className="relative overflow-hidden">
      {/* Marquee */}
      <div className="border-y border-border/40 bg-ink/60 py-4 overflow-hidden">
        <div className="flex gap-0 animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...partners, ...partners].map((p, i) => (
            <span key={i} className="font-mono text-[11px] text-tertiary uppercase tracking-widest px-6">
              {p}
              <span className="ml-6 text-border">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 lg:py-28 border-b border-border/40">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="chip chip-gold">Trusted by Agencies</span>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mt-5 text-primary">
              What Commanders Say
            </h2>
          </div>
          <div className="testimonials grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="testimonial-card shimmer-card glass border border-border/50 rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-sm text-secondary leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-primary">{t.author}</span>
                  <span className="text-xs text-tertiary">{t.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission + Contact */}
      <div className="py-24 lg:py-36 relative">
        <div className="absolute inset-0 bg-dots opacity-25 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/4 blur-[100px] rounded-full pointer-events-none" />

        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left — Mission */}
            <div className="miss-left flex flex-col gap-8">
              <div className="space-y-5">
                <span className="chip chip-rose">Our Mission</span>
                <h2 className="text-4xl lg:text-[3.25rem] font-black tracking-tight leading-tight">
                  Technology in the
                  <br />
                  <span className="text-gold">Service of Life</span>
                </h2>
                <p className="text-secondary text-base leading-relaxed max-w-md">
                  AeroHorse was built on one belief: every person deserves the fastest, safest emergency response possible.
                  We build the tools that make that real — one deployment at a time.
                </p>
              </div>

              {/* Values */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'USA Manufactured', desc: 'Built & tested on US soil', color: 'border-gold/20' },
                  { label: 'NDAA Compliant', desc: 'Federal procurement ready', color: 'border-rose/20' },
                  { label: 'OTA Updates', desc: 'Always improving, free of charge', color: 'border-indigo/20' },
                  { label: 'Safeguard Program', desc: 'Unlimited repair & replacement', color: 'border-sage/20' },
                ].map((v) => (
                  <div key={v.label} className={`glass border ${v.color} rounded-xl p-4 hover:bg-panel/60 transition-colors duration-200`}>
                    <p className="text-sm font-semibold text-primary mb-1">{v.label}</p>
                    <p className="text-xs text-tertiary">{v.desc}</p>
                  </div>
                ))}
              </div>

              {/* Large number */}
              <div className="glass-gold rounded-2xl p-6 flex flex-col gap-1">
                <span className="number-huge text-gold">40+</span>
                <p className="text-sm text-secondary">agencies actively deploying AeroHorse technology across the USA</p>
              </div>

              <a href="#contact" className="btn-primary w-fit group">
                Learn Our Story
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Right — Contact form */}
            <div id="contact" className="miss-right">
              <div className="glass border border-border/50 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
                <div className="absolute -top-8 left-8 w-24 h-24 bg-gold/5 blur-2xl rounded-full" />

                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-2xl font-black text-primary mb-1.5">Request a Demo</h3>
                    <p className="text-sm text-secondary">See AeroHorse in action with a live flight tailored to your agency.</p>
                  </div>

                  <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-tertiary">First Name</label>
                        <input type="text" placeholder="First" className="field" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-tertiary">Last Name</label>
                        <input type="text" placeholder="Last" className="field" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-tertiary">Agency Email</label>
                      <input type="email" placeholder="you@department.gov" className="field" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-tertiary">Department / Agency</label>
                      <input type="text" placeholder="Los Angeles Police Department" className="field" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-tertiary">Message (optional)</label>
                      <textarea placeholder="Tell us about your program needs..." className="field resize-none" rows={3} />
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary justify-center py-3.5 text-sm font-semibold w-full"
                    >
                      Send Request
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </form>

                  <div className="divider" />

                  <div className="flex flex-col gap-3">
                    {[
                      { icon: Mail, text: 'contact@aerohorse.io' },
                      { icon: Phone, text: '+1 (800) 273-7626' },
                      { icon: MapPin, text: 'Seattle, WA · Made in USA' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3 text-sm text-secondary">
                        <Icon className="w-4 h-4 text-gold/50 flex-shrink-0" strokeWidth={1.5} />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
