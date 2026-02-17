import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Technology section: scroll-in animations for list.
 */
export function initTechnology() {
  const section = document.getElementById('technology');
  if (!section) return;

  const badge = section.querySelector('.section-badge');
  const heading = section.querySelector('.section-heading');
  const lead = section.querySelector('.section-lead');
  const listItems = section.querySelectorAll('.tech-list li');

  gsap.set([badge, heading, lead, ...listItems].filter(Boolean), { opacity: 0, y: 16 });

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
    .to(listItems, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' }, '-=0.2');
}
