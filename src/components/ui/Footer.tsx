import React from 'react'
import { Wind, Globe, GitFork, Link2 } from 'lucide-react'

const links = {
  Products: ['Guardian', 'Guardian Station', 'Responder', 'Lemur 2', 'BRINC Ball', 'LiveOps'],
  Solutions: ['Law Enforcement', 'Drone as First Responder', 'Search & Rescue', 'Firefighting'],
  Company: ['About Us', 'Careers', 'Press', 'Values & Ethics', 'Announcements'],
  Resources: ['The Archive', 'DFR Playbook', 'Grant Program', 'BRINC Beyond'],
}

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-ink relative overflow-hidden">
      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

      <div className="section-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-14">
          {/* Brand col */}
          <div className="col-span-2 flex flex-col gap-5">
            <a href="#" className="flex items-center gap-2.5 w-fit group">
              <div className="w-8 h-8 rounded-xl glass-gold flex items-center justify-center transition-all duration-300 group-hover:shadow-gold">
                <Wind className="w-4 h-4 text-gold" strokeWidth={2} />
              </div>
              <span className="text-base font-bold text-primary">
                Aero<span className="text-gold">Horse</span>
              </span>
            </a>
            <p className="text-sm text-secondary leading-relaxed max-w-[210px]">
              Technology in the service of life. Autonomous drones built for public safety.
            </p>
            <div className="flex items-center gap-2.5">
              {[Globe, GitFork, Link2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg glass border border-border/50 flex items-center justify-center text-tertiary hover:text-gold hover:border-gold/25 transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat} className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold text-tertiary uppercase tracking-widest">{cat}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-secondary hover:text-primary transition-colors duration-150">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider mb-8" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-tertiary font-mono">
            © {new Date().getFullYear()} AeroHorse Inc. · NDAA Compliant · USA Made · All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy', 'Terms', 'Security'].map((l) => (
              <a key={l} href="#" className="text-xs text-tertiary hover:text-secondary transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
