import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wind, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) setActiveDropdown(null);
    else setActiveDropdown(name);
  };

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
          Guardian Series — Now Deploying Across 40+ US Agencies
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
              <button className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors duration-200 rounded-lg flex items-center gap-1 cursor-interactive">
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
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] glass bg-ink/95 border border-border/60 rounded-xl mt-2 p-6 shadow-elevated grid grid-cols-2 gap-6"
                  >
                    <div>
                      <h4 className="text-xs font-mono text-tertiary uppercase tracking-widest mb-4">Outdoor Operations</h4>
                      <div className="flex flex-col gap-2">
                        <Link to="/guardian" className="group flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-panel/50 transition-colors cursor-interactive">
                          <div className="w-12 h-12 rounded-md bg-deep border border-border/50 flex items-center justify-center overflow-hidden">
                            <Wind className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-primary group-hover:text-gold transition-colors">Guardian <span className="chip chip-gold ml-2 py-0.5 px-2 text-[9px]">New</span></span>
                            <span className="block text-xs text-secondary mt-0.5">Long-range first responder</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono text-tertiary uppercase tracking-widest mb-4">Indoor Operations</h4>
                      <div className="flex flex-col gap-2">
                        <Link to="/lemur" className="group flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-panel/50 transition-colors cursor-interactive">
                          <div className="w-12 h-12 rounded-md bg-deep border border-border/50 flex items-center justify-center overflow-hidden">
                            <Wind className="w-5 h-5 text-rose group-hover:scale-110 transition-transform" />
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-primary group-hover:text-rose transition-colors">Lemur 2</span>
                            <span className="block text-xs text-secondary mt-0.5">Indoor tactical reconnaissance</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/dfr" className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors duration-200 rounded-lg cursor-interactive">
              Drone as First Responder
            </Link>
            
            <Link to="/solutions" className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors duration-200 rounded-lg cursor-interactive">
              Solutions
            </Link>
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/contact" className="btn-primary text-sm cursor-interactive" data-cursor="Contact">Request Demo</Link>
          </div>

          {/* Mobile toggle */}
          <button
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
