import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis, useLenis } from '../hooks/useLenis';

import { Header } from './ui/Header';
import { Footer } from './ui/Footer';
import { MagneticCursor } from './ui/MagneticCursor';
import { ScrollProgress } from './ui/ScrollProgress';

gsap.registerPlugin(ScrollTrigger);

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  // Initialize smooth scrolling once
  useLenis();

  // Recompute ScrollTrigger positions once async content (fonts, images, the
  // 3D canvas) has settled — otherwise reveal animations are pinned to stale
  // positions and never fire, leaving content stuck invisible.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();

    const timers = [
      window.setTimeout(refresh, 300),
      window.setTimeout(refresh, 1000),
      window.setTimeout(refresh, 2200),
    ];

    window.addEventListener('load', refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {});

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener('load', refresh);
    };
  }, []);

  // Scroll to top on route change, or to hash target when present
  useEffect(() => {
    const lenis = getLenis();
    const hash = location.hash;

    const scrollToHash = () => {
      if (!hash) return;
      const el = document.querySelector(hash) as HTMLElement | null;
      if (!el) return;
      if (lenis) {
        lenis.scrollTo(el, { offset: -112, duration: 0.8 });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (hash) {
      const timers = [
        window.setTimeout(scrollToHash, 80),
        window.setTimeout(scrollToHash, 500),
        window.setTimeout(() => ScrollTrigger.refresh(), 120),
        window.setTimeout(() => ScrollTrigger.refresh(), 800),
      ];
      return () => timers.forEach(window.clearTimeout);
    }

    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }

    const timers = [
      window.setTimeout(() => ScrollTrigger.refresh(), 120),
      window.setTimeout(() => ScrollTrigger.refresh(), 700),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [location.pathname, location.hash]);

  return (
    <>
      <MagneticCursor />
      <ScrollProgress />
      <Header />
      <main className="relative w-full overflow-x-clip min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
