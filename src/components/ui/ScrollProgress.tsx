import { useEffect } from 'react'

export function ScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById('scroll-progress')
    if (!bar) return
    let raf = 0

    const update = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        const scrolled = window.scrollY
        const total = document.documentElement.scrollHeight - window.innerHeight
        const pct = total > 0 ? scrolled / total : 0
        bar.style.transform = `scaleX(${Math.min(1, Math.max(0, pct))})`
      })
    }

    window.addEventListener('scroll', update, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', update)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  return <div id="scroll-progress" />
}
