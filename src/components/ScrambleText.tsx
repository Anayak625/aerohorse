import { useEffect, useRef, useState } from 'react'

interface ScrambleTextProps {
  text: string
  delay?: number
  speed?: number
  className?: string
}

const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

export function ScrambleText({ text, delay = 0, speed = 40, className = '' }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationStarted = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animationStarted.current) {
          animationStarted.current = true

          setTimeout(() => {
            const chars = text.split('')
            let revealedCount = 0

            const scramble = setInterval(() => {
              // Create display with revealed chars + scrambled rest
              const current = chars.map((char, i) => {
                if (i < revealedCount) return char
                return CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)]
              }).join('')

              setDisplayText(current)
              revealedCount++

              if (revealedCount > chars.length) {
                clearInterval(scramble)
                setDisplayText(text)
              }
            }, speed)
          }, delay)

          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [text, delay, speed])

  return (
    <span ref={containerRef} className={className}>
      {displayText}
    </span>
  )
}
