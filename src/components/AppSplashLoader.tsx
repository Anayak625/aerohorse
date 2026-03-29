import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { preloadWebGLModels } from '../constants/webglAssets'

const MIN_VISIBLE_MS = 450
const IDLE_SETTLE_MS = 550
const STALL_FALLBACK_MS = 18000

/**
 * Full-screen loader until fonts + window load, THREE.DefaultLoadingManager has finished its current
 * queue, and a short settle window passes (catches Environment / texture follow-up loads from the hero).
 * Locks body scroll while visible.
 */
export default function AppSplashLoader() {
  const { active, progress, loaded, total } = useProgress()
  const [pageReady, setPageReady] = useState(false)
  const [stallFallback, setStallFallback] = useState(false)
  const [settledIdle, setSettledIdle] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    preloadWebGLModels()
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      document.fonts.ready.catch(() => undefined),
      new Promise<void>((resolve) => {
        if (document.readyState === 'complete') resolve()
        else window.addEventListener('load', () => resolve(), { once: true })
      }),
    ]).then(() => {
      if (!cancelled) setPageReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => setStallFallback(true), STALL_FALLBACK_MS)
    return () => window.clearTimeout(t)
  }, [])

  const queueIdle =
    stallFallback ||
    (!active && ((total > 0 && loaded >= total) || progress >= 99.5))

  useEffect(() => {
    if (!pageReady || !queueIdle) {
      setSettledIdle(false)
      return
    }
    const t = window.setTimeout(() => setSettledIdle(true), IDLE_SETTLE_MS)
    return () => window.clearTimeout(t)
  }, [pageReady, queueIdle, active, loaded, total, progress, stallFallback])

  const allReady = pageReady && settledIdle

  useEffect(() => {
    if (!allReady) return
    const t = window.setTimeout(() => setDismissed(true), MIN_VISIBLE_MS)
    return () => window.clearTimeout(t)
  }, [allReady])

  useEffect(() => {
    if (!dismissed) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
    return undefined
  }, [dismissed])

  const show = !dismissed

  return (
    <div
      className={`fixed inset-0 z-[10050] flex flex-col items-center justify-center bg-gradient-to-b from-[#e8f0f7] via-[#e4edf5] to-[#dce8f0] transition-opacity duration-500 ease-out motion-reduce:transition-none ${
        show ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ visibility: show ? 'visible' : 'hidden' }}
      aria-busy={show}
      aria-hidden={!show}
      aria-label={show ? 'Loading site' : undefined}
    >
      <div className="h-1 w-48 max-w-[min(14rem,70vw)] overflow-hidden rounded-full bg-stone-200/90 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-500 transition-[width] duration-200 ease-out motion-reduce:transition-none"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="mt-5 px-4 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-500 sm:text-xs">
        Loading Aerohorse
      </p>
      <p className="mt-2 px-4 text-center text-[11px] text-stone-400 max-w-xs">
        3D assets and page resources
      </p>
    </div>
  )
}
