import { useState } from 'react'

interface DevicePerformance {
  isLowEnd: boolean
  dpr: [number, number]
  shadows: boolean
  antialias: boolean
  prefersReducedMotion: boolean
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
        dpr: [1, 2],
        shadows: true,
        antialias: true,
        prefersReducedMotion: false,
      }
    }
    const cores = navigator.hardwareConcurrency || 4
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const memory = (navigator as any).deviceMemory || 4
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const isLowEnd = (isMobile && cores <= 4) || cores < 4 || memory < 4

    if (isLowEnd) {
      return {
        isLowEnd: true,
        dpr: [1, 1],
        shadows: false,
        antialias: false,
        prefersReducedMotion,
      }
    }

    if (prefersReducedMotion) {
      return {
        isLowEnd: false,
        dpr: [1, 1],
        shadows: false,
        antialias: false,
        prefersReducedMotion: true,
      }
    }

    if (isMobile || isCoarsePointer) {
      const maxDpr = isCoarsePointer ? 1.2 : 1.35
      return {
        isLowEnd: false,
        dpr: clampDpr(maxDpr),
        shadows: true,
        antialias: false,
        prefersReducedMotion,
      }
    }

    return {
      isLowEnd: false,
      dpr: clampDpr(2),
      shadows: true,
      antialias: true,
      prefersReducedMotion,
    }
  })

  return performance
}
