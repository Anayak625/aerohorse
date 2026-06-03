import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  text: string;
  className?: string;
  type?: 'chars' | 'words';
  delay?: number;
  /** Use on above-the-fold heroes so copy animates on load, not on scroll */
  playOnMount?: boolean;
}

export function TextReveal({ text, className = '', type = 'chars', delay = 0, playOnMount = false }: TextRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const elements = containerRef.current.querySelectorAll(type === 'chars' ? '.split-char' : '.split-word');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(elements, { opacity: 1, y: 0, rotateX: 0 });
      return;
    }
    
    const ctx = gsap.context(() => {
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: type === 'chars' ? 0.02 : 0.05,
        ease: 'power3.out',
        delay: delay,
        ...(playOnMount
          ? {}
          : {
              scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
                once: true,
              },
            }),
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, [text, type, delay, playOnMount]);

  // Split logic
  const renderContent = () => {
    if (type === 'chars') {
      return text.split('').map((char, i) => (
        <span key={i} className={`split-char ${char === ' ' ? 'w-2' : ''}`}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    }
    
    const words = text.split(' ');

    return words.map((word, i) => (
      <React.Fragment key={`${word}-${i}`}>
        <span className="inline-block overflow-hidden align-bottom mr-[0.25em] leading-none">
          <span className="split-word inline-block" style={{ opacity: 0, transform: 'translateY(100%)' }}>
            {word}
          </span>
        </span>
        {i < words.length - 1 ? '\u00A0' : null}
      </React.Fragment>
    ));
  };

  const isBlock = className.includes('text-center') || className.includes('w-full');

  return (
    <span
      ref={containerRef}
      data-text-reveal
      className={className}
      style={{ perspective: '1000px', display: isBlock ? 'block' : 'inline' }}
    >
      {renderContent()}
    </span>
  );
}
