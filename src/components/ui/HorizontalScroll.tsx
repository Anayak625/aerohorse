import { useRef, useEffect, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
}

export function HorizontalScroll({ children, className = '' }: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) return;
    
    // We want the total scroll distance to match the width of the track minus viewport width
    const panels = gsap.utils.toArray<HTMLElement>('.horizontal-scroll-panel', trackRef.current);
    
    if (panels.length < 2) return; // Need at least 2 panels to scroll

    const ctx = gsap.context(() => {
      // Create the horizontal scroll tween
      const tween = gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1, // Smooth scrubbing
          snap: {
            snapTo: 1 / (panels.length - 1),
            duration: { min: 0.2, max: 0.6 },
            delay: 0.1,
            ease: 'power1.inOut'
          },
          end: () => `+=${trackRef.current?.offsetWidth || 0}`
        }
      });
      
      // We can also trigger animations within each panel as they come into view
      panels.forEach((panel) => {
        // Find elements to animate inside panel
        const animElements = panel.querySelectorAll('.panel-anim');
        if (animElements.length > 0) {
          gsap.from(animElements, {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween, // Link to the horizontal scroll tween
              start: 'left center',
            }
          });
        }
      });
      
    }, containerRef);
    
    return () => ctx.revert();
  }, [children]);

  return (
    <section ref={containerRef} className={`horizontal-scroll-section ${className}`}>
      <div ref={trackRef} className="horizontal-scroll-track">
        {children}
      </div>
    </section>
  );
}
