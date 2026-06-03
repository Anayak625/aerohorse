import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, Html, Grid, Line, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import type { DroneAccent, DroneHotspot, DroneModelType } from '../../data/dronesContent'
import type { DroneViewMode } from './droneViewerTypes'
import {
  AmbientDroneRings,
  GuardianProceduralMesh,
  LemurProceduralMesh,
} from './ProceduralDroneMeshes'
import { DroneParticles } from './DroneParticles'
import { DroneGltfModel } from './DroneGltfModel'

function DroneModel({
  modelType,
  droneId,
  modelUrl,
  viewMode,
  explode,
}: {
  modelType: DroneModelType
  droneId: string
  modelUrl?: string
  viewMode: DroneViewMode
  explode: number
}) {
  if (modelType === 'gltf' && modelUrl) {
    return <DroneGltfModel url={modelUrl} viewMode={viewMode} explode={explode} />
  }
  if (droneId === 'lemur') {
    return <LemurProceduralMesh explode={explode} viewMode={viewMode} />
  }
  return <GuardianProceduralMesh explode={explode} viewMode={viewMode} />
}

function HotspotMarker({
  hotspot,
  active,
  accent,
  onSelect,
}: {
  hotspot: DroneHotspot
  active: boolean
  accent: DroneAccent
  onSelect: () => void
}) {
  const mesh = useRef<THREE.Mesh>(null)
  const color = accent === 'gold' ? '#2563eb' : '#5b8fd4'

  useFrame((s) => {
    if (mesh.current) {
      const pulse = active ? 1.35 + Math.sin(s.clock.elapsedTime * 5) * 0.12 : 1
      mesh.current.scale.setScalar(pulse)
    }
  })

  const linePoints: [number, number, number][] = [hotspot.position, [0, 0, 0]]

  return (
    <group>
      {active && <Line points={linePoints} color={color} lineWidth={1} transparent opacity={0.55} />}
      <group position={hotspot.position}>
        <mesh ref={mesh} onClick={(e) => (e.stopPropagation(), onSelect())}>
          <sphereGeometry args={[active ? 0.07 : 0.05, 20, 20]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={active ? 3 : 1.2}
          />
        </mesh>
        {active && (
          <>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.09, 0.14, 32]} />
              <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
            <Html
              distanceFactor={12}
              position={[0, 0.22, 0]}
              center
              occlude
              style={{ pointerEvents: 'none' }}
            >
              <span className="whitespace-nowrap rounded-full border border-gold/50 bg-void px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-gold shadow-soft">
                {hotspot.label}
              </span>
            </Html>
          </>
        )}
      </group>
    </group>
  )
}

function MouseSpotlight() {
  const light = useRef<THREE.PointLight>(null)
  const { pointer } = useThree()

  useFrame(() => {
    if (light.current) {
      light.current.position.x = pointer.x * 3
      light.current.position.y = pointer.y * 2 + 1
      light.current.position.z = 2.5
    }
  })

  return <pointLight ref={light} intensity={1.4} color="#93c5fd" distance={8} />
}

interface SceneContentProps {
  modelType: DroneModelType
  droneId: string
  modelUrl?: string
  accent: DroneAccent
  hotspots: DroneHotspot[]
  activeHotspotId: string | null
  onHotspotSelect: (id: string) => void
  autoRotate: boolean
  viewMode: DroneViewMode
  explode: number
}

function SceneContent({
  modelType,
  droneId,
  modelUrl,
  accent,
  hotspots,
  activeHotspotId,
  onHotspotSelect,
  autoRotate,
  viewMode,
  explode,
}: SceneContentProps) {
  const thermalFog = viewMode === 'thermal'

  return (
    <>
      <color attach="background" args={['#f1f5f9']} />
      <fog attach="fog" args={['#f1f5f9', 6, 16]} />
      <ambientLight intensity={thermalFog ? 0.55 : 0.65} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} color={thermalFog ? '#fb923c' : '#ffffff'} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} color="#93c5fd" />
      <MouseSpotlight />
      <Environment preset="studio" />

      <Grid
        infiniteGrid
        fadeDistance={22}
        fadeStrength={1.2}
        cellSize={0.35}
        sectionSize={1.75}
        sectionColor="#93c5fd"
        cellColor="#dbe4ef"
        position={[0, -0.55, 0]}
      />

      <DroneParticles accent={accent} />
      <Sparkles count={40} scale={4} size={1.5} speed={0.25} opacity={0.2} color={accent === 'gold' ? '#3b82f6' : '#5b8fd4'} />

      {viewMode === 'standard' && <AmbientDroneRings accent={accent} />}

      <DroneModel
        modelType={modelType}
        droneId={droneId}
        modelUrl={modelUrl}
        viewMode={viewMode}
        explode={explode}
      />

      {hotspots.map((h) => (
        <HotspotMarker
          key={h.id}
          hotspot={h}
          active={activeHotspotId === h.id}
          accent={accent}
          onSelect={() => onHotspotSelect(h.id)}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={1.8}
        maxDistance={6}
        autoRotate={autoRotate}
        autoRotateSpeed={0.85}
        maxPolarAngle={Math.PI / 1.75}
        minPolarAngle={Math.PI / 5}
        dampingFactor={0.06}
        enableDamping
      />

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.4} intensity={viewMode === 'thermal' ? 0.5 : 0.25} />
        <Vignette eskil offset={0.1} darkness={0.25} />
      </EffectComposer>
    </>
  )
}

export interface AdvancedDroneSceneProps {
  modelType: DroneModelType
  droneId: string
  modelUrl?: string
  accent: DroneAccent
  hotspots: DroneHotspot[]
  activeHotspotId: string | null
  onHotspotSelect: (id: string) => void
  viewMode: DroneViewMode
  explode: boolean
  autoRotate?: boolean
  className?: string
  showHud?: boolean
}

export function AdvancedDroneScene({
  modelType,
  droneId,
  modelUrl,
  accent,
  hotspots,
  activeHotspotId,
  onHotspotSelect,
  viewMode,
  explode,
  autoRotate: autoRotateProp = true,
  className = '',
  showHud = true,
}: AdvancedDroneSceneProps) {
  const [autoRotate, setAutoRotate] = useState(autoRotateProp)
  const explodeAmount = explode ? 1 : 0

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      if (mq.matches) setAutoRotate(false)
      else setAutoRotate(autoRotateProp)
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [autoRotateProp])

  return (
    <div
      className={`drones-stage relative overflow-hidden ${className}`}
      onPointerDown={() => setAutoRotate(false)}
    >
      {showHud && (
        <>
          <div className="drones-scanline pointer-events-none absolute inset-0 z-20" aria-hidden />
          <div className="drones-corner drones-corner-tl pointer-events-none z-20" aria-hidden />
          <div className="drones-corner drones-corner-tr pointer-events-none z-20" aria-hidden />
          <div className="drones-corner drones-corner-bl pointer-events-none z-20" aria-hidden />
          <div className="drones-corner drones-corner-br pointer-events-none z-20" aria-hidden />
        </>
      )}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_50%_50%,transparent_50%,rgba(241,245,249,0.4)_100%)]" />

      <Canvas
        className="!h-full w-full touch-none"
        camera={{ position: [0, 0.45, 3.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <SceneContent
            modelType={modelType}
            droneId={droneId}
            modelUrl={modelUrl}
            accent={accent}
            hotspots={hotspots}
            activeHotspotId={activeHotspotId}
            onHotspotSelect={onHotspotSelect}
            autoRotate={autoRotate}
            viewMode={viewMode}
            explode={explodeAmount}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

