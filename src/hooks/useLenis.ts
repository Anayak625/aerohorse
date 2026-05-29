import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let lenisInstance: Lenis | null = null

export function useLenis() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    lenisInstance?.destroy()

    lenisInstance = new Lenis({
      lerp: 0.11,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.15,
    })

    lenisInstance.on('scroll', ScrollTrigger.update)

    const tickerCallback = (time: number) => {
      lenisInstance?.raf(time * 1000)
    }

    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(500, 33)
    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(tickerCallback)
      lenisInstance?.destroy()
      lenisInstance = null
    }
  }, [])

  return lenisInstance
}

export function getLenis() {
  return lenisInstance
}
