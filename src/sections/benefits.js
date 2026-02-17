import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Benefits section: scroll-in animations for stats.
 */
export function initBenefits() {
  const section = document.getElementById('benefits');
  if (!section) return;

  const badge = section.querySelector('.section-badge');
  const heading = section.querySelector('.section-heading');
  const lead = section.querySelector('.section-lead');
  const items = section.querySelectorAll('.benefit-item');

  gsap.set([badge, heading, lead, ...items].filter(Boolean), { opacity: 0, y: 20 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      end: 'top 20%',
      toggleActions: 'play none none reverse',
    },
  });

  if (badge) tl.to(badge, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
  tl.to(heading, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, badge ? '-=0.2' : 0)
    .to(lead, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to(items, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }, '-=0.2');
}
