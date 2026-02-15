import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Technology section: scroll-in animations for list.
 */
export function initTechnology() {
  const section = document.getElementById('technology');
  if (!section) return;

  const heading = section.querySelector('.section-heading');
  const lead = section.querySelector('.section-lead');
  const listItems = section.querySelectorAll('.tech-list li');

  gsap.set([heading, lead, ...listItems], { opacity: 0, x: -16 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      end: 'top 20%',
      toggleActions: 'play none none reverse',
    },
  });

  tl.to(heading, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' })
    .to(lead, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to(listItems, { opacity: 1, x: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' }, '-=0.2');
}
