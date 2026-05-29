import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  text: string;
  className?: string;
  type?: 'chars' | 'words';
  delay?: number;
}

export function TextReveal({ text, className = '', type = 'chars', delay = 0 }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          once: true,
        }
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, [text, type, delay]);

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
        <span className="inline-block overflow-hidden mr-[0.25em]">
          <span className="split-word" style={{ opacity: 0, transform: 'translateY(100%)' }}>
            {word}
          </span>
        </span>
        {i < words.length - 1 ? ' ' : null}
      </React.Fragment>
    ));
  };

  return (
    <div ref={containerRef} className={className} style={{ perspective: '1000px' }}>
      {renderContent()}
    </div>
  );
}
