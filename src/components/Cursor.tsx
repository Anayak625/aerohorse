import { useEffect, useRef, useState } from 'react'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const lastHover = useRef(false)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseDown = () => setIsClicking(true)
    const onMouseUp = () => setIsClicking(false)

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)

    let raf: number
    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.15
      pos.current.y += (target.current.y - pos.current.y) * 0.15

      // Re-check hover every frame so 3D hover (data-cursor-hover set from React state) updates cursor
      const el = document.elementFromPoint(target.current.x, target.current.y) as HTMLElement | null
      const hovering = !!el?.closest('a, button, [data-cursor-hover]')
      if (lastHover.current !== hovering) {
        lastHover.current = hovering
        setIsHovering(hovering)
      }

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px)`
      }
      if (followerRef.current) {
        followerRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`
      }
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ${
          isHovering ? 'scale-0' : isClicking ? 'scale-75' : 'scale-100'
        }`}
      >
        <div className="h-2 w-2 rounded-full bg-teal-500" />
      </div>
      <div
        ref={followerRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9998] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
          isHovering ? 'scale-150 opacity-100' : isClicking ? 'scale-90 opacity-60' : 'scale-100 opacity-40'
        }`}
      >
        <div
          className={`flex items-center justify-center rounded-full border transition-all duration-300 ${
            isHovering ? 'h-16 w-16 border-teal-500 bg-teal-500/10' : 'h-10 w-10 border-stone-400/50'
          }`}
        />
      </div>
    </>
  )
}
