import { useEffect, useState, useRef } from 'react'

const DEFAULT_THRESHOLD = 0.004

function hasMeaningfulChange(
  next: number | Record<string, number>,
  last: number | Record<string, number>,
  threshold: number
): boolean {
  if (typeof next === 'number' && typeof last === 'number') {
    return Math.abs(next - last) >= threshold
  }
  if (typeof next === 'object' && typeof last === 'object') {
    const keys = new Set([...Object.keys(next), ...Object.keys(last)])
    for (const k of keys) {
      const a = (next as Record<string, number>)[k] ?? 0
      const b = (last as Record<string, number>)[k] ?? 0
      if (Math.abs(a - b) >= threshold) return true
    }
  }
  return false
}

/**
 * Subscribes to scroll and updates state only when the computed value
 * changes by at least `threshold` (0–1). Uses rAF to batch updates.
 */
export function useThrottledScrollProgress<T extends number | Record<string, number>>(
  getProgress: () => T,
  threshold: number = DEFAULT_THRESHOLD,
  deps: React.DependencyList = []
): T {
  const [progress, setProgress] = useState<T>(() => getProgress())
  const lastRef = useRef<T>(progress)
  const rafRef = useRef<number>(0)
  const pendingRef = useRef(false)

  useEffect(() => {
    const update = () => {
      pendingRef.current = false
      const next = getProgress()
      if (hasMeaningfulChange(next, lastRef.current, threshold)) {
        lastRef.current = next
        setProgress(next)
      }
    }

    const onScroll = () => {
      if (pendingRef.current) return
      pendingRef.current = true
      rafRef.current = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [threshold, ...deps])

  return progress
}
