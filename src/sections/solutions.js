import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Solutions section: scroll-in animations for cards.
 */
export function initSolutions() {
  const section = document.getElementById('solutions');
  if (!section) return;

  const heading = section.querySelector('.section-heading');
  const lead = section.querySelector('.section-lead');
  const cards = section.querySelectorAll('.card');

  gsap.set([heading, lead, ...cards], { opacity: 0, y: 24 });

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
    .to(cards, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, '-=0.2');
}
