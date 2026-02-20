import { useEffect, useRef } from 'react'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
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
      className="cursor-container"
    >
      <div className="cursor-dot" />
      <div className="cursor-ring" />
      <div className="cursor-glow" />
    </div>
  )
}
