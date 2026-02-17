import { useState, useEffect } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 50)
      setHidden(currentScrollY > 300 && currentScrollY > lastScrollY)
      setLastScrollY(currentScrollY)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastScrollY])

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-stone-200/50 shadow-sm' : 'bg-transparent'}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5 md:px-12">
        <a href="#" className="group flex items-center gap-2" data-cursor-hover>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-stone-800">Aerohorse</span>
        </a>
        
        <nav className="hidden md:flex items-center gap-10">
          <a
            href="#journey"
            className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
            data-cursor-hover
          >
            Journey
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
            data-cursor-hover
          >
            How it works
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
            data-cursor-hover
          >
            Contact
          </a>
        </nav>
        
        <a
          href="#contact"
          className="hidden md:inline-flex items-center rounded-full bg-stone-900/5 px-5 py-2.5 text-sm font-medium text-stone-700 ring-1 ring-stone-900/10 transition-all hover:bg-stone-900/10 hover:ring-stone-900/20"
          data-cursor-hover
        >
          Get in touch
        </a>
      </div>
    </header>
  )
}
