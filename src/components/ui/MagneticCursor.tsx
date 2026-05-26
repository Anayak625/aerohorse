import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We only want the custom cursor on desktop
    const isTouch = matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouch) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;
    
    // Track mouse
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    window.addEventListener('mousemove', onMouseMove);

    // Animation loop for smooth trailing
    const ticker = gsap.ticker.add(() => {
      // Dot follows closely
      dotX += (mouseX - dotX) * 0.4;
      dotY += (mouseY - dotY) * 0.4;
      
      // Ring trails behind
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.left = `${dotX}px`;
        dotRef.current.style.top = `${dotY}px`;
      }
      
      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`;
        ringRef.current.style.top = `${ringY}px`;
      }

      if (textRef.current) {
        textRef.current.style.left = `${dotX}px`;
        textRef.current.style.top = `${dotY}px`;
      }
    });

    // Hover interactions
    const addHoverStates = () => {
      const interactiveElements = document.querySelectorAll('a, button, .cursor-interactive');
      
      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          document.body.classList.add('cursor-hover');
          // If it's a specific product card or something, we can add text
          const cursorText = el.getAttribute('data-cursor');
          if (cursorText && textRef.current) {
            textRef.current.innerText = cursorText;
          } else if (textRef.current) {
             textRef.current.innerText = '';
          }
        });
        
        el.addEventListener('mouseleave', () => {
          document.body.classList.remove('cursor-hover');
          if (textRef.current) textRef.current.innerText = '';
        });
      });
    };

    addHoverStates();

    // Re-bind hover states when DOM changes (simple MutationObserver)
    const observer = new MutationObserver(addHoverStates);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      gsap.ticker.remove(ticker);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={textRef} className="cursor-text" />
    </>
  );
}
