import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      // Touch: sync with Lenis so scroll-linked WebGL stays smooth; finger follows 1:1, inertia uses syncTouchLerp.
      syncTouch: true,
      syncTouchLerp: 0.085,
      touchMultiplier: 1,
      lerp: 0.1,
    })
    lenisRef.current = lenis
    document.documentElement.classList.add('lenis')

    let rafId = 0
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId)
        rafId = 0
      } else {
        rafId = requestAnimationFrame(raf)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    rafId = requestAnimationFrame(raf)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      cancelAnimationFrame(rafId)
      lenis.destroy()
      document.documentElement.classList.remove('lenis')
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}
