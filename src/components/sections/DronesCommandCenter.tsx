import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Expand, Eye, Maximize2, Minimize2, RotateCcw, Shrink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { droneCatalog } from '../../data/dronesContent'
import { AdvancedDroneScene } from '../drones/AdvancedDroneScene'
import { viewModeLabels, type DroneViewMode } from '../drones/droneViewerTypes'
import { cn } from '../../lib/utils'

const easeOut = [0.16, 1, 0.3, 1] as const

const accentBtn = {
  gold: 'border-gold/40 bg-goldGlow text-gold',
  rose: 'border-rose/40 bg-deep text-rose',
}

const accentText = { gold: 'text-gold', rose: 'text-rose' }

const viewModes: DroneViewMode[] = ['standard', 'wireframe', 'thermal', 'xray']

export function DronesCommandCenter() {
  const [activeId, setActiveId] = useState(droneCatalog[0].id)
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<DroneViewMode>('standard')
  const [explode, setExplode] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

  const drone = droneCatalog.find((d) => d.id === activeId) ?? droneCatalog[0]
  const activeHotspot = drone.hotspots.find((h) => h.id === activeHotspotId)

  const selectDrone = (id: string) => {
    setActiveId(id)
    setActiveHotspotId(null)
  }

  const toggleFullscreen = useCallback(async () => {
    const el = stageRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      await el.requestFullscreen().catch(() => {})
      setFullscreen(true)
    } else {
      await document.exitFullscreen().catch(() => {})
      setFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  return (
    <section id="explorer" className="scroll-mt-24 border-b border-border/40 bg-void py-20 lg:py-28">
      <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="chip chip-gold">Interactive 3D</span>
              <h2 className="mt-4 text-3xl font-black text-primary md:text-4xl">
                Explore each aircraft
              </h2>
              <p className="mt-3 max-w-xl text-secondary">
                Orbit the model, switch visualization modes, and tap hotspots for component details.
              </p>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            {droneCatalog.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => selectDrone(d.id)}
                className={cn(
                  'cursor-interactive rounded-xl border px-5 py-3 text-left transition-all duration-300',
                  activeId === d.id
                    ? accentBtn[d.accent]
                    : 'border-border/50 bg-ink/40 text-secondary hover:border-border hover:text-primary'
                )}
              >
                <span className="block text-sm font-bold">{d.name}</span>
                <span className="block text-xs opacity-80">{d.category}</span>
              </button>
            ))}
          </div>

          <div
            ref={stageRef}
            className={cn(
              'overflow-hidden rounded-2xl border border-border/50 glass shadow-soft-lg',
              fullscreen && 'rounded-none'
            )}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="relative lg:col-span-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${drone.id}-${viewMode}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="min-h-[380px] lg:min-h-[520px]"
                  >
                    <AdvancedDroneScene
                      modelType={drone.modelType}
                      droneId={drone.id}
                      modelUrl={drone.modelUrl}
                      accent={drone.accent}
                      hotspots={drone.hotspots}
                      activeHotspotId={activeHotspotId}
                      onHotspotSelect={setActiveHotspotId}
                      viewMode={viewMode}
                      explode={explode}
                      showHud={false}
                      className="min-h-[380px] rounded-none border-0 lg:min-h-[520px]"
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center gap-2">
                  <div className="flex flex-wrap gap-1 rounded-xl border border-border/50 bg-void/95 p-1 shadow-soft backdrop-blur-md">
                    {viewModes.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setViewMode(mode)}
                        className={cn(
                          'cursor-interactive rounded-lg px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-all',
                          viewMode === mode
                            ? 'bg-gold text-white'
                            : 'text-tertiary hover:text-primary'
                        )}
                      >
                        {viewModeLabels[mode]}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setExplode((e) => !e)}
                    className={cn(
                      'cursor-interactive flex items-center gap-2 rounded-xl border border-border/50 bg-void/95 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-tertiary shadow-soft backdrop-blur-md hover:text-primary',
                      explode && 'border-gold/40 text-gold'
                    )}
                  >
                    {explode ? <Shrink className="h-3.5 w-3.5" /> : <Expand className="h-3.5 w-3.5" />}
                    {explode ? 'Collapse' : 'Explode'}
                  </button>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="cursor-interactive flex items-center gap-2 rounded-xl border border-border/50 bg-void/95 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-tertiary shadow-soft backdrop-blur-md hover:text-primary"
                  >
                    {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    Fullscreen
                  </button>
                </div>

                <p className="absolute left-4 top-4 z-20 font-mono text-[10px] uppercase tracking-widest text-tertiary">
                  Drag to orbit · Click blue dots or components below
                </p>

                <div className="absolute bottom-[4.5rem] left-4 right-4 z-20 flex flex-wrap gap-2">
                  {drone.hotspots.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setActiveHotspotId(activeHotspotId === h.id ? null : h.id)}
                      className={cn(
                        'cursor-interactive max-w-full rounded-full border px-3 py-1.5 text-left text-[10px] font-mono uppercase tracking-wider shadow-soft backdrop-blur-md transition-all',
                        activeHotspotId === h.id
                          ? 'border-gold/50 bg-goldGlow text-gold'
                          : 'border-border/50 bg-void/95 text-secondary hover:border-gold/30 hover:text-primary'
                      )}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/50 bg-ink/50 p-6 lg:col-span-4 lg:border-l lg:border-t-0 lg:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={drone.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.35, ease: easeOut }}
                  >
                    <span className={`font-mono text-xs uppercase tracking-widest ${accentText[drone.accent]}`}>
                      {drone.tagline}
                    </span>
                    <h3 className="mt-2 text-2xl font-black text-primary">{drone.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-secondary">{drone.description}</p>

                    {activeHotspot && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-5 rounded-xl border border-gold/25 bg-goldGlow/50 p-4"
                      >
                        <p className="text-xs font-mono uppercase tracking-widest text-gold">Component</p>
                        <p className="mt-1 font-bold text-primary">{activeHotspot.label}</p>
                        <p className="mt-1 text-sm text-secondary">{activeHotspot.detail}</p>
                      </motion.div>
                    )}

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {drone.highlights.map((h) => (
                        <div
                          key={h.label}
                          className="rounded-lg border border-border/40 bg-void px-3 py-3 text-center"
                        >
                          <p className={`metric text-xl font-black ${accentText[drone.accent]}`}>
                            {h.value}
                            {h.unit && <span className="text-sm text-tertiary">{h.unit}</span>}
                          </p>
                          <p className="mt-1 text-[9px] font-mono uppercase tracking-wider text-tertiary">
                            {h.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <ul className="mt-6 space-y-2">
                      {drone.features.map((f) => (
                        <li key={f} className="flex gap-2 text-sm text-secondary">
                          <Check className={`mt-0.5 h-4 w-4 shrink-0 ${accentText[drone.accent]}`} strokeWidth={2.5} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => setActiveHotspotId(null)}
                      className="mt-4 flex items-center gap-2 text-xs text-tertiary hover:text-primary cursor-interactive"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Clear selection
                    </button>

                    <Link
                      to={drone.detailHref}
                      className="btn-primary mt-6 w-full justify-center cursor-interactive"
                      data-cursor="View"
                    >
                      <Eye className="h-4 w-4" />
                      {drone.name} product page
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
