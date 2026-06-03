import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!supportsFinePointer || prefersReducedMotion) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;
    let currentTarget: HTMLElement | null = null;
    let hasMoved = false;

    const interactiveSelector = [
      'a',
      'button',
      'label',
      'summary',
      'input',
      'textarea',
      'select',
      '[role="button"]',
      '[role="tab"]',
      '[role="link"]',
      '.cursor-interactive',
      '[data-cursor]',
    ].join(',');

    document.documentElement.classList.add('custom-cursor-active');

    const setCursorTarget = (target: HTMLElement | null) => {
      if (target === currentTarget) return;
      currentTarget = target;

      if (!target || target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true') {
        document.body.classList.remove('cursor-hover');
        if (textRef.current) {
          textRef.current.textContent = '';
          textRef.current.style.opacity = '0';
        }
        return;
      }

      const label = target.getAttribute('data-cursor')?.trim();
      if (label) {
        document.body.classList.add('cursor-hover');
        if (textRef.current) {
          textRef.current.textContent = label;
          textRef.current.style.opacity = '1';
        }
      } else {
        document.body.classList.remove('cursor-hover');
        if (textRef.current) {
          textRef.current.textContent = '';
          textRef.current.style.opacity = '0';
        }
      }
    };

    const resolveTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      return target.closest<HTMLElement>(interactiveSelector);
    };

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      hasMoved = true;
      setCursorTarget(resolveTarget(e.target));
    };

    const onPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        setCursorTarget(null);
        hasMoved = false;
      }
    };

    const onBlur = () => {
      setCursorTarget(null);
      hasMoved = false;
    };
    
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerout', onPointerOut, { passive: true });
    window.addEventListener('blur', onBlur);

    const ticker = () => {
      dotX += (mouseX - dotX) * 0.4;
      dotY += (mouseY - dotY) * 0.4;
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
        dotRef.current.style.opacity = hasMoved ? '1' : '0';
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        ringRef.current.style.opacity = hasMoved && !currentTarget ? '1' : '0';
      }

      if (textRef.current) {
        textRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }
    };

    gsap.ticker.add(ticker);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('blur', onBlur);
      gsap.ticker.remove(ticker);
      document.body.classList.remove('cursor-hover');
      document.documentElement.classList.remove('custom-cursor-active');
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
