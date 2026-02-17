import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Solutions section: scroll-in animations for cards.
 */
export function initSolutions() {
  const section = document.getElementById('solutions');
  if (!section) return;

  const badge = section.querySelector('.section-badge');
  const heading = section.querySelector('.section-heading');
  const lead = section.querySelector('.section-lead');
  const cards = section.querySelectorAll('.card');

  gsap.set([badge, heading, lead, ...cards].filter(Boolean), { opacity: 0, y: 20 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 82%',
      end: 'top 25%',
      toggleActions: 'play none none reverse',
    },
  });

  if (badge) tl.to(badge, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
  tl.to(heading, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, badge ? '-=0.2' : 0)
    .to(lead, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to(cards, { opacity: 1, y: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out' }, '-=0.2');
}
