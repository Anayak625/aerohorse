import { useRef, useEffect, useState, type ReactNode } from 'react'

interface TextRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: number
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
}

export function TextReveal({ children, className = '', delay = 0, stagger = 0.03, as: Tag = 'div' }: TextRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const text = typeof children === 'string' ? children : ''
  const words = text.split(' ')

  if (typeof children !== 'string') {
    return (
      <Tag
        ref={ref as any}
        className={`${className} transition-all duration-700 ${
          inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
        style={{ transitionDelay: `${delay}s` }}
      >
        {children}
      </Tag>
    )
  }

  return (
    <Tag ref={ref as any} className={className}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden">
          <span
            className={`inline-block transition-transform duration-500 ${
              inView ? 'translate-y-0' : 'translate-y-full'
            }`}
            style={{ transitionDelay: `${delay + wi * stagger}s` }}
          >
            {word}
          </span>
          {wi < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </Tag>
  )
}

export function LineReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="overflow-hidden">
      <div
        className={`${className} transition-all duration-700 ease-out ${
          inView ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{ transitionDelay: `${delay}s` }}
      >
        {children}
      </div>
    </div>
  )
}

export function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-1000 ease-out ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}
