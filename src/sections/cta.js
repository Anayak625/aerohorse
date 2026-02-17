import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * CTA section: scroll-in animation and optional button hover.
 */
export function initCta() {
  const section = document.getElementById('cta');
  if (!section) return;

  const heading = section.querySelector('.section-heading, .cta-heading');
  const lead = section.querySelector('.section-lead, .cta-lead');
  const buttons = section.querySelector('.cta-buttons');

  gsap.set([heading, lead, buttons].filter(Boolean), { opacity: 0, y: 24 });

  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 85%',
      end: 'top 30%',
      toggleActions: 'play none none reverse',
    },
  })
    .to(heading, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    .to(lead, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to(buttons, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2');
}
