import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Benefits section: scroll-in animations for stats.
 */
export function initBenefits() {
  const section = document.getElementById('benefits');
  if (!section) return;

  const heading = section.querySelector('.section-heading');
  const lead = section.querySelector('.section-lead');
  const items = section.querySelectorAll('.benefit-item');

  gsap.set([heading, lead, ...items], { opacity: 0, y: 20 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      end: 'top 20%',
      toggleActions: 'play none none reverse',
    },
  });

  tl.to(heading, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    .to(lead, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to(items, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }, '-=0.2');
}
