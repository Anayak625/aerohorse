import { useRef, useEffect, useState } from 'react'

export default function TransitionSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const top = rect.top
      const height = rect.height

      if (top < viewportHeight && top + height > 0) {
        const p = 1 - (top + height - viewportHeight) / (height + viewportHeight)
        setProgress(Math.max(0, Math.min(1, p)))
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const fadeInOut = progress < 0.5 
    ? progress * 2 
    : 1 - (progress - 0.5) * 2

  const textOpacity = Math.max(0, Math.min(1, fadeInOut))
  const bgOpacity = Math.min(1, progress * 2)

  return (
    <section
      ref={sectionRef}
      className="relative h-[100vh] w-full overflow-hidden"
    >
      {/* Gradient overlay for smooth blend */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-stone-50 via-white to-stone-50"
        style={{ opacity: bgOpacity }}
      />
      
      {/* Animated teal accent lines */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"
            style={{
              top: `${20 + i * 15}%`,
              left: '-10%',
              right: '-10%',
              transform: `translateX(${(progress - 0.5) * (i % 2 === 0 ? 100 : -100)}%)`,
              opacity: fadeInOut * 0.6,
              transition: 'transform 0.1s ease-out'
            }}
          />
        ))}
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const baseX = (i * 17) % 100
          const baseY = (i * 23) % 100
          const size = 2 + (i % 3) * 2
          const delay = i * 0.1
          return (
            <div
              key={i}
              className="absolute rounded-full bg-teal-500"
              style={{
                left: `${baseX}%`,
                top: `${baseY}%`,
                width: size,
                height: size,
                opacity: fadeInOut * (0.2 + (i % 5) * 0.1),
                transform: `translateY(${(progress - 0.5) * -200 + Math.sin(delay) * 50}px) scale(${0.5 + progress * 0.5})`,
                transition: 'transform 0.15s ease-out, opacity 0.2s ease-out'
              }}
            />
          )
        })}
      </div>

      {/* Centered transition content */}
      <div 
        className="sticky top-0 h-screen w-full flex items-center justify-center"
      >
        <div 
          className="text-center max-w-3xl px-8"
          style={{ 
            opacity: textOpacity,
            transform: `translateY(${(0.5 - progress) * 50}px) scale(${0.9 + fadeInOut * 0.1})`
          }}
        >
          <div 
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-4 py-2 backdrop-blur-sm"
            style={{ opacity: textOpacity }}
          >
            <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-wider text-teal-700">
              Interactive Experience
            </span>
          </div>
          
          <h2 
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-stone-800"
            style={{ opacity: textOpacity }}
          >
            Follow the
            <span className="block gradient-text">Journey</span>
          </h2>
          
          <p 
            className="mt-6 text-lg text-stone-500 max-w-xl mx-auto"
            style={{ opacity: textOpacity * 0.8 }}
          >
            Discover how your package travels from warehouse to doorstep in three seamless steps
          </p>

          {/* Scroll indicator */}
          <div 
            className="mt-12 flex flex-col items-center gap-3"
            style={{ opacity: textOpacity * 0.7 }}
          >
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-8 rounded-full bg-stone-200 overflow-hidden"
                >
                  <div 
                    className="h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: progress > 0.3 + i * 0.2 ? '100%' : '0%'
                    }}
                  />
                </div>
              ))}
            </div>
            <span className="text-xs uppercase tracking-widest text-stone-400">
              Scroll to continue
            </span>
          </div>
        </div>
      </div>

      {/* Bottom gradient blend into journey section */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-stone-50 to-transparent pointer-events-none"
        style={{ opacity: Math.max(0, (progress - 0.6) * 2.5) }}
      />
    </section>
  )
}
