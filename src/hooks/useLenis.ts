import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 2.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.3,
      touchMultiplier: 1.2,
      lerp: 0.06,
    })
    lenisRef.current = lenis
    document.documentElement.classList.add('lenis')

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      document.documentElement.classList.remove('lenis')
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}
