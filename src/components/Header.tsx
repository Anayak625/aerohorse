import { useState, useEffect, useRef } from 'react'
import { useLenisContext } from '../context/LenisContext'

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )
  useEffect(() => {
    const m = window.matchMedia(query)
    const handler = () => setMatches(m.matches)
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [query])
  return matches
}

// ─── Scroll behavior config ─────────────────────────────────────────────────
const SCROLL_CONFIG = {
  /** px/s: hero (top → journey start) — medium so hero is visible */
  speedHero: 450,
  /** px/s: journey section — slowest so scene + receipt are readable */
  speedJourney: 280,
  /** px/s: rest of page — fastest */
  speedRest: 900,
  minDuration: 0.6,
  maxDuration: 20,
  /** px from top when landing on a section (clears fixed header) */
  sectionOffset: 100,
  /** Easing: ease-out cubic — starts quick, lands soft (no jerk at end) */
  easing: (t: number) => 1 - Math.pow(1 - t, 3),
} as const

function getJourneyBounds(): { start: number; end: number } {
  const el = document.querySelector('#journey')
  if (!el) return { start: 0, end: 0 }
  const r = el.getBoundingClientRect()
  const y = window.scrollY
  return { start: r.top + y, end: r.bottom + y }
}

/**
 * Three-zone duration: hero (0 → journey start) | journey | rest (journey end → bottom).
 * Splits the scroll path into zones and sums duration per zone.
 */
function getDurationThreeZone(from: number, to: number): number {
  const { start: journeyStart, end: journeyEnd } = getJourneyBounds()
  const { speedHero, speedJourney, speedRest, minDuration, maxDuration } = SCROLL_CONFIG

  const a = Math.min(from, to)
  const b = Math.max(from, to)

  const lenHero = Math.max(0, Math.min(b, journeyStart) - Math.max(a, 0))
  const lenJourney = Math.max(0, Math.min(b, journeyEnd) - Math.max(a, journeyStart))
  const lenRest = Math.max(0, b - Math.max(a, journeyEnd))

  const duration =
    lenHero / speedHero + lenJourney / speedJourney + lenRest / speedRest
  return Math.min(maxDuration, Math.max(minDuration, duration))
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)
  const navRef = useRef<HTMLElement>(null)
  const lenisRef = useLenisContext()
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 50)
      setHidden(currentScrollY > 400 && currentScrollY > lastScrollY.current)
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    { label: 'Journey', href: '#journey' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Network', href: '#pod-network' },
    { label: 'Contact', href: '#contact' },
  ]

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!lenisRef?.current) return
    setExpanded(false)
    const current = window.scrollY
    const { sectionOffset, easing } = SCROLL_CONFIG

    if (href === '#') {
      e.preventDefault()
      lenisRef.current.scrollTo(0, {
        duration: getDurationThreeZone(current, 0),
        easing,
      })
      return
    }
    const target = document.querySelector(href) as HTMLElement | null
    if (target) {
      e.preventDefault()
      const targetTop = target.getBoundingClientRect().top + current
      lenisRef.current.scrollTo(href, {
        duration: getDurationThreeZone(current, targetTop),
        offset: sectionOffset,
        easing,
      })
    }
  }

  const expandNav = () => setExpanded(true)
  const collapseNav = () => setExpanded(false)

  return (
    <header
      ref={navRef}
      className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-out w-[calc(100%-2rem)] max-w-2xl md:w-auto ${
        hidden ? '-translate-y-[120%]' : scrolled ? 'top-3 md:top-4' : 'top-4 md:top-6'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <nav
        onMouseEnter={!isMobile ? expandNav : undefined}
        onMouseLeave={!isMobile ? collapseNav : undefined}
        className={`
          glass-panel relative flex items-center justify-between
          rounded-full
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${expanded 
            ? 'px-3 py-2 gap-1 md:gap-1' 
            : scrolled 
              ? 'px-4 py-2.5 gap-2' 
              : 'px-4 md:px-5 py-3 gap-2 md:gap-3'
          }
        `}
      >
        {/* Logo */}
        <a 
          href="#" 
          onClick={(e) => handleNavClick(e, '#')}
          className={`
            flex items-center gap-2 transition-all duration-500 ease-out
            ${expanded ? 'pr-2' : 'pr-0'}
          `}
          data-cursor-hover
        >
          <div className={`
            rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 
            flex items-center justify-center
            transition-all duration-500 ease-out
            shadow-[0_2px_8px_-2px_rgba(13,148,136,0.5)]
            ${expanded ? 'h-8 w-8' : scrolled ? 'h-8 w-8' : 'h-9 w-9'}
          `}>
            <span className={`font-bold text-white transition-all duration-500 ${expanded || scrolled ? 'text-sm' : 'text-base'}`}>
              A
            </span>
          </div>
          <span className={`
            font-semibold tracking-tight text-stone-800
            transition-all duration-500 ease-out overflow-hidden whitespace-nowrap
            ${expanded ? 'w-0 opacity-0' : scrolled ? 'w-[90px] opacity-100 text-base' : 'w-[100px] opacity-100 text-lg'}
          `}>
            Aerohorse
          </span>
        </a>

        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                 {/* Mobile menu button */}
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? 'Close menu' : 'Open menu'}
          onClick={() => setExpanded((e) => !e)}
          className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-full hover:bg-stone-100/80 active:bg-stone-200/80 transition-colors"
        >
          <span className={`w-5 h-0.5 bg-stone-600 rounded-full transition-transform duration-300 ${expanded ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`w-5 h-0.5 bg-stone-600 rounded-full transition-opacity duration-300 ${expanded ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-0.5 bg-stone-600 rounded-full transition-transform duration-300 ${expanded ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>

        {/* Divider - hide on mobile when collapsed */}
        <div className={`
          h-5 w-px bg-stone-300/50 transition-all duration-500 hidden md:block
          ${expanded ? 'opacity-100 mx-1' : 'opacity-0 w-0 mx-0'}
        `} />

        {/* Nav Items */}
        <div className={`
          flex items-center overflow-hidden
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${expanded ? 'w-auto max-w-[400px] gap-1 opacity-100' : 'w-0 max-w-0 gap-0 opacity-0'}
          max-md:absolute max-md:left-1/2 max-md:-translate-x-1/2 max-md:top-full max-md:mt-2 max-md:flex-col max-md:py-2 max-md:rounded-2xl max-md:glass-panel max-md:w-[calc(100vw-2rem)] max-md:max-w-[320px]
        `}
        style={{ display: expanded ? 'flex' : undefined }}
        >
          {navItems.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={`
                relative px-4 py-2 text-sm font-medium text-stone-600
                rounded-full transition-all duration-300
                hover:text-stone-900 hover:bg-stone-100/80
                whitespace-nowrap
              `}
              style={{ 
                transitionDelay: expanded ? `${i * 50}ms` : '0ms',
                transform: expanded ? 'translateX(0)' : 'translateX(-10px)',
                opacity: expanded ? 1 : 0,
              }}
              data-cursor-hover
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className={`
          h-5 w-px bg-stone-300/50 transition-all duration-500 hidden md:block
          ${expanded ? 'opacity-100 mx-1' : 'opacity-0 w-0 mx-0'}
        `} />

        {/* CTA Button */}
        <a
          href="#contact"
          onClick={(e) => handleNavClick(e, '#contact')}
          className={`
            relative flex items-center justify-center
            rounded-full font-medium text-white
            bg-gradient-to-r from-stone-800 to-stone-900
            shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
            transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
            hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
            hover:scale-105 active:scale-95
            overflow-hidden whitespace-nowrap
            ${expanded 
              ? 'px-5 py-2 text-sm' 
              : scrolled 
                ? 'w-9 h-9 p-0' 
                : 'w-10 h-10 p-0'
            }
          `}
          data-cursor-hover
        >
          <span className={`
            transition-all duration-500
            ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 absolute'}
          `}>
            Get in touch
          </span>
          <svg 
            className={`
              transition-all duration-500
              ${expanded ? 'opacity-0 w-0 h-0 absolute' : 'opacity-100 w-4 h-4'}
            `}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </a>
        </span>

        {/* Subtle glow effect on hover */}
        <div className={`
          absolute inset-0 rounded-full pointer-events-none
          bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-teal-500/0
          transition-opacity duration-500
          ${expanded ? 'opacity-100' : 'opacity-0'}
        `} />
      </nav>

    </header>
  )
}
