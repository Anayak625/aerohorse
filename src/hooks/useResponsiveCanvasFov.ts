import { useState, useEffect } from 'react'

/**
 * Wider FOV on narrow viewports so the same framing stays readable on phones and small tablets.
 */
export function useResponsiveCanvasFov(baseFov: number): number {
  const [fov, setFov] = useState(baseFov)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const shortest = Math.min(w, h)
      let bump = 0
      if (shortest < 360) bump = 16
      else if (shortest < 420) bump = 12
      else if (shortest < 520) bump = 8
      else if (w < 768) bump = 5
      setFov(baseFov + bump)
    }
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [baseFov])

  return fov
}
