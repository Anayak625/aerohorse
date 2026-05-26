import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let lenisInstance: Lenis | null = null

export function useLenis() {
  const rafRef = useRef<number>(0)

  useEffect(() => {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenisInstance.on('scroll', ScrollTrigger.update)

    const tickerCallback = (time: number) => {
      lenisInstance?.raf(time * 1000)
    }

    // Add Lenis's requestAnimationFrame to GSAP's ticker
    gsap.ticker.add(tickerCallback)
    
    // Prevent GSAP's lag smoothing from messing with Lenis's smooth scrolling
    gsap.ticker.lagSmoothing(0)

    return () => {
      // Cleanup GSAP ticker
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
