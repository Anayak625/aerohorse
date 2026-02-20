import { useEffect, useRef, useState } from 'react'

const DELIVERED_DURATION_MS = 700

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [delivered, setDelivered] = useState(false)
  const deliveredTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const state = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    hover: false,
    clicking: false,
    velocity: { x: 0, y: 0 },
    lastX: 0,
    lastY: 0,
  })

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const s = state.current
    let hoveredEl: Element | null = null
    let checkHoverThrottle = 0

    const onMouseMove = (e: MouseEvent) => {
      s.targetX = e.clientX
      s.targetY = e.clientY
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest?.('a, button, [data-cursor-hover]')
      if (target && target !== hoveredEl) {
        hoveredEl = target
        s.hover = true
        cursor.dataset.hover = 'true'
      }
    }

    const onMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null
      if (!related?.closest?.('a, button, [data-cursor-hover]')) {
        hoveredEl = null
        s.hover = false
        cursor.dataset.hover = 'false'
      }
    }

    const onMouseDown = () => {
      s.clicking = true
      cursor.dataset.clicking = 'true'
    }

    const onMouseUp = () => {
      if (s.hover) {
        if (deliveredTimeoutRef.current) clearTimeout(deliveredTimeoutRef.current)
        setDelivered(true)
        deliveredTimeoutRef.current = setTimeout(() => {
          setDelivered(false)
          deliveredTimeoutRef.current = null
        }, DELIVERED_DURATION_MS)
      }
      s.clicking = false
      cursor.dataset.clicking = 'false'
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseover', onMouseOver, { passive: true })
    document.addEventListener('mouseout', onMouseOut, { passive: true })
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)

    let raf: number
    const animate = () => {
      const lerp = 0.18
      s.x += (s.targetX - s.x) * lerp
      s.y += (s.targetY - s.y) * lerp

      s.velocity.x = s.x - s.lastX
      s.velocity.y = s.y - s.lastY
      s.lastX = s.x
      s.lastY = s.y

      const speed = Math.sqrt(s.velocity.x ** 2 + s.velocity.y ** 2)
      const stretch = Math.min(speed * 0.15, 0.6)
      const angle = Math.atan2(s.velocity.y, s.velocity.x) * (180 / Math.PI)

      cursor.style.setProperty('--x', `${s.x}px`)
      cursor.style.setProperty('--y', `${s.y}px`)
      cursor.style.setProperty('--stretch', `${1 + stretch}`)
      cursor.style.setProperty('--squish', `${1 - stretch * 0.3}`)
      cursor.style.setProperty('--angle', `${angle}deg`)

      checkHoverThrottle++
      if (checkHoverThrottle > 10) {
        checkHoverThrottle = 0
        const el = document.elementFromPoint(s.targetX, s.targetY)
        const isHover = !!el?.closest('a, button, [data-cursor-hover]')
        if (isHover !== s.hover) {
          s.hover = isHover
          cursor.dataset.hover = String(isHover)
        }
      }

      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      if (deliveredTimeoutRef.current) clearTimeout(deliveredTimeoutRef.current)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      data-hover="false"
      data-clicking="false"
      data-delivered={delivered ? 'true' : 'false'}
      className="cursor-container"
    >
      <div className="cursor-dot" />
      <div className="cursor-ring" />
      <div className="cursor-glow" />
      {/* Package icon: shown on hover over clickable elements */}
      <div className="cursor-package" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>
      {/* Delivered state: checkmark after click */}
      <div className="cursor-delivered" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
    </div>
  )
}
