import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Wind } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { label: 'Products', href: '#products' },
  { label: 'Technology', href: '#technology' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Mission', href: '#mission' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-ink/80 backdrop-blur-2xl border-b border-border/50 shadow-elevated'
          : 'bg-transparent'
      )}
    >
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-rose/10 border-b border-gold/15 py-2 px-4 text-center">
        <p className="text-xs font-mono text-gold/80 tracking-wide">
          <span className="live-dot mr-2" />
          Guardian Series — Now Deploying Across 40+ US Agencies
          <span className="ml-3 text-secondary hidden sm:inline">· NDAA Compliant · Made in USA</span>
        </p>
      </div>

      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl glass-gold flex items-center justify-center transition-all duration-300 group-hover:shadow-gold">
              <Wind className="w-4 h-4 text-gold" strokeWidth={2} />
            </div>
            <span className="text-base font-bold tracking-tight text-primary">
              Aero<span className="text-gold">Horse</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors duration-200 rounded-lg hover:bg-panel/60 relative group"
              >
                {item.label}
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-px w-0 bg-gold group-hover:w-3 transition-all duration-300 rounded-full" />
              </a>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="btn-outline text-sm">Login</a>
            <a href="#contact" className="btn-primary text-sm">Request Demo</a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg border border-border/60 text-secondary hover:text-primary hover:border-border transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden glass border-t border-border/40"
          >
            <div className="section-container py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm text-secondary hover:text-primary hover:bg-panel/60 rounded-lg transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 border-t border-border/40 flex flex-col gap-2">
                <a href="#contact" className="btn-primary text-sm text-center justify-center">Request Demo</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
