import { useState } from 'react'

export interface DevicePerformance {
  /** Skip heavy 3D (postprocessing, env, sparkles, lit city materials). */
  isLowEnd: boolean
  /** Narrow viewport phone layout — used for scroll/Lenis tuning. */
  isMobile: boolean
  dpr: [number, number]
  antialias: boolean
  prefersReducedMotion: boolean
  glPowerPreference: 'default' | 'high-performance'
}

function clampDpr(max: number): [number, number] {
  const device = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const hi = Math.min(max, Math.max(1, device))
  return [1, hi]
}

export function useDevicePerformance(): DevicePerformance {
  const [performance] = useState<DevicePerformance>(() => {
    if (typeof window === 'undefined') {
      return {
        isLowEnd: false,
        isMobile: false,
        dpr: [1, 2],
        antialias: true,
        prefersReducedMotion: false,
        glPowerPreference: 'high-performance',
      }
    }
    const cores = navigator.hardwareConcurrency || 4
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const memory = (navigator as any).deviceMemory || 4
    const isMobileViewport = window.matchMedia('(max-width: 768px)').matches
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Phones + small tablets used primarily with touch: use the same lite path as weak hardware.
    const portableTouch =
      isMobileViewport || (isCoarsePointer && window.innerWidth <= 1024)
    const weakHardware = cores < 4 || memory < 4
    const useLiteGraphics = portableTouch || weakHardware

    if (prefersReducedMotion) {
      return {
        isLowEnd: true,
        isMobile: isMobileViewport,
        dpr: [1, 1],
        antialias: false,
        prefersReducedMotion: true,
        glPowerPreference: 'default',
      }
    }

    if (useLiteGraphics) {
      return {
        isLowEnd: true,
        isMobile: isMobileViewport,
        dpr: [1, 1],
        antialias: false,
        prefersReducedMotion,
        glPowerPreference: 'default',
      }
    }

    return {
      isLowEnd: false,
      isMobile: false,
      dpr: clampDpr(2),
      antialias: true,
      prefersReducedMotion,
      glPowerPreference: 'high-performance',
    }
  })

  return performance
}
