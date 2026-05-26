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
    
    // Select elements based on type
    const elements = containerRef.current.querySelectorAll(type === 'chars' ? '.split-char' : '.split-word');
    
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
        }
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, [type, delay]);

  // Split logic
  const renderContent = () => {
    if (type === 'chars') {
      return text.split('').map((char, i) => (
        <span key={i} className={`split-char ${char === ' ' ? 'w-2' : ''}`}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    }
    
    return text.split(' ').map((word, i) => (
      <span key={i} className="inline-block overflow-hidden mr-2">
        <span className="split-word" style={{ opacity: 0, transform: 'translateY(100%)' }}>
          {word}
        </span>
      </span>
    ));
  };

  return (
    <div ref={containerRef} className={className} style={{ perspective: '1000px' }}>
      {renderContent()}
    </div>
  );
}
