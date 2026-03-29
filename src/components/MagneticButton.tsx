import { type ReactNode, useRef, useState } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function MagneticButton({ children, className = '', onClick }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distX = e.clientX - centerX
    const distY = e.clientY - centerY

    const distance = Math.sqrt(distX * distX + distY * distY)

    // Only apply effect within 150px radius
    if (distance < 150) {
      const strength = 1 - distance / 150
      setOffset({
        x: distX * 0.2 * strength,
        y: distY * 0.2 * strength,
      })
    }
  }

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 })
  }

  return (
    <div
      ref={buttonRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: 'transform 0.2s ease-out',
      }}
    >
      {children}
    </div>
  )
}
