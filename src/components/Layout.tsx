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

  // Scroll to top on route change
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }

    const refresh = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => window.clearTimeout(refresh);
  }, [location.pathname]);

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
