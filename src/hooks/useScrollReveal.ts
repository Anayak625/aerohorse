import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Trigger a GSAP animation when an element enters the viewport */
export function useScrollReveal<T extends HTMLElement>(
  animationFn: (el: T, tl: gsap.core.Timeline) => void,
  deps: unknown[] = []
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    })
    animationFn(el, tl)
    return () => { tl.kill() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
