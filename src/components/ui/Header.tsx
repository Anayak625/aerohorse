import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wind, ChevronDown, Building2, Siren, Map, FlameKindling } from 'lucide-react';
import { cn } from '../../lib/utils';
import { stats } from '../../lib/site';

const solutionLinks = [
  { label: 'Law Enforcement', desc: 'Eyes on scene before officers arrive', to: '/solutions', icon: Building2 },
  { label: 'Drone as First Responder', desc: 'Autonomous 911 response at scale', to: '/dfr', icon: Siren },
  { label: 'Search & Rescue', desc: 'Find them faster, bring them home', to: '/solutions', icon: Map },
  { label: 'Firefighting', desc: 'Situational awareness from above', to: '/solutions', icon: FlameKindling },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      setActiveDropdown(null);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMobileOpen(false);
      setActiveDropdown(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled || mobileOpen || activeDropdown
          ? 'bg-ink/95 backdrop-blur-2xl border-b border-border/50 shadow-elevated'
          : 'bg-transparent'
      )}
    >
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-rose/10 border-b border-gold/15 py-2 px-4 text-center cursor-interactive" data-cursor="View">
        <Link to="/guardian" className="text-xs font-mono text-gold/80 tracking-wide hover:text-gold transition-colors">
          <span className="live-dot mr-2" />
          Guardian Series — Now Deploying Across {stats.agencies} US Agencies
          <span className="ml-3 text-secondary hidden sm:inline">· NDAA Compliant · Made in USA</span>
        </Link>
      </div>

      <div className="section-container relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group cursor-interactive" data-cursor="Home">
            <div className="w-8 h-8 rounded-xl glass-gold flex items-center justify-center transition-all duration-300 group-hover:shadow-gold">
              <Wind className="w-4 h-4 text-gold" strokeWidth={2} />
            </div>
            <span className="text-base font-bold tracking-tight text-primary">
              Aero<span className="text-gold">Horse</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Products Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('products')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                aria-expanded={activeDropdown === 'products'}
                className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors duration-200 rounded-lg flex items-center gap-1 cursor-interactive"
              >
                Products
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", activeDropdown === 'products' ? "rotate-180" : "")} />
              </button>
              
              <AnimatePresence>
                {activeDropdown === 'products' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[360px] glass bg-ink/95 border border-border/60 rounded-xl mt-2 p-3 shadow-elevated flex flex-col gap-1"
                  >
                    <span className="px-3 pt-2 pb-1 text-[10px] font-mono text-tertiary uppercase tracking-widest">Outdoor Operations</span>
                    <Link to="/guardian" className="group flex items-start gap-3 p-3 rounded-lg hover:bg-panel/50 transition-colors cursor-interactive">
                      <div className="w-9 h-9 rounded-md bg-deep border border-border/50 flex items-center justify-center flex-shrink-0">
                        <Wind className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="flex items-center text-sm font-bold text-primary group-hover:text-gold transition-colors">Guardian <span className="chip chip-gold ml-2 py-0 px-1.5 text-[9px]">New</span></span>
                        <span className="block text-xs text-secondary mt-0.5">Long-range drone as first responder</span>
                      </div>
                    </Link>
                    <span className="px-3 pt-3 pb-1 text-[10px] font-mono text-tertiary uppercase tracking-widest">Indoor Operations</span>
                    <Link to="/lemur" className="group flex items-start gap-3 p-3 rounded-lg hover:bg-panel/50 transition-colors cursor-interactive">
                      <div className="w-9 h-9 rounded-md bg-deep border border-border/50 flex items-center justify-center flex-shrink-0">
                        <Wind className="w-4 h-4 text-rose group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-primary group-hover:text-rose transition-colors">Lemur 2</span>
                        <span className="block text-xs text-secondary mt-0.5">Indoor tactical reconnaissance</span>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Solutions Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('solutions')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                aria-expanded={activeDropdown === 'solutions'}
                className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors duration-200 rounded-lg flex items-center gap-1 cursor-interactive"
              >
                Solutions
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", activeDropdown === 'solutions' ? "rotate-180" : "")} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'solutions' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[340px] glass bg-ink/95 border border-border/60 rounded-xl mt-2 p-3 shadow-elevated flex flex-col gap-1"
                  >
                    {solutionLinks.map(({ label, desc, to, icon: Icon }) => (
                      <Link key={label} to={to} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-panel/50 transition-colors cursor-interactive">
                        <div className="w-9 h-9 rounded-md bg-deep border border-border/50 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-primary group-hover:text-gold transition-colors">{label}</span>
                          <span className="block text-xs text-secondary mt-0.5">{desc}</span>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/dfr" className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors duration-200 rounded-lg cursor-interactive">
              DFR Program
            </Link>
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/contact" className="btn-primary text-sm cursor-interactive" data-cursor="Contact">Request Demo</Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg border border-border/60 text-secondary hover:text-primary hover:border-border transition-colors cursor-interactive"
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
              <Link to="/guardian" className="px-4 py-3 text-sm text-secondary hover:text-primary hover:bg-panel/60 rounded-lg transition-colors">Guardian</Link>
              <Link to="/lemur" className="px-4 py-3 text-sm text-secondary hover:text-primary hover:bg-panel/60 rounded-lg transition-colors">Lemur 2</Link>
              <Link to="/dfr" className="px-4 py-3 text-sm text-secondary hover:text-primary hover:bg-panel/60 rounded-lg transition-colors">DFR Program</Link>
              <Link to="/solutions" className="px-4 py-3 text-sm text-secondary hover:text-primary hover:bg-panel/60 rounded-lg transition-colors">Solutions</Link>
              
              <div className="pt-4 border-t border-border/40 flex flex-col gap-2">
                <Link to="/contact" className="btn-primary text-sm text-center justify-center">Request Demo</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
