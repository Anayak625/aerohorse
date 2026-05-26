import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '../hooks/useLenis';

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
    window.scrollTo(0, 0);
    // Give DOM a moment to update then refresh ScrollTrigger
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
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
