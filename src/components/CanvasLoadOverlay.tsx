import { useProgress } from '@react-three/drei'

type CanvasLoadOverlayProps = {
  /** z-index above WebGL, below hero copy overlays (Hero uses z-[5]+ for scrim/text). */
  className?: string
}

/**
 * Tracks THREE.DefaultLoadingManager (GLTF, textures, etc.) for R3F scenes.
 * Sits in a `relative` wrapper around `<Canvas />`; pointer-events none so scroll/pointer still reach the page.
 */
export function CanvasLoadOverlay({ className = 'z-[4]' }: CanvasLoadOverlayProps) {
  const { active, progress } = useProgress()
  const loading = active || progress < 100

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#e8f0f7] via-[#e4edf5] to-[#dce8f0] transition-opacity duration-[480ms] ease-out motion-reduce:transition-none ${className}`}
      style={{ opacity: loading ? 1 : 0, visibility: loading ? 'visible' : 'hidden' }}
      aria-busy={loading}
      aria-hidden={!loading}
      aria-label={loading ? 'Loading 3D scene' : undefined}
    >
      <div className="h-1 w-44 max-w-[min(12rem,55vw)] overflow-hidden rounded-full bg-stone-200/90 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-500 transition-[width] duration-200 ease-out motion-reduce:transition-none"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="mt-4 px-4 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-500 sm:text-xs">
        Loading scene
      </p>
    </div>
  )
}
