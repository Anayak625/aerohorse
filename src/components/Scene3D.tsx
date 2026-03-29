/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useMemo, useState, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles, useGLTF, RoundedBox, useTexture, ContactShadows, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useDevicePerformance } from '../hooks/useDevicePerformance'
import { DRONE_GLTF_URL, AEROHORSE_LOGO_URL } from '../constants/webglAssets'
import { HeroCityModel, CitySkyGradient, CityGroundPlane, CITY_FOG_COLOR } from './HeroCity'
import { PodGLTFModel, getHeroParcelLandWorldY } from './PodModel'

export type HoverTarget = 'drone' | 'pod' | null



interface SceneProps {
  mouse?: { normalizedX: number; normalizedY: number }
  scrollProgress?: number
  onHoverChange?: (target: HoverTarget) => void
  onDroneClick?: (clockSeconds: number) => void
  focusDroneUntil?: number
}

// Smooth step for 0→1 over [a,b]; smoothstep(a,b,x)
function smoothStep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// Scroll thresholds: drone camera view from 20% until 65%
const DRONE_VIEW_SCROLL_START = 0.2
const DRONE_VIEW_SCROLL_END = 0.65
const DRONE_VIEW_BLEND_IN = 0.03   // 17%→20% smooth ramp in
const DRONE_VIEW_BLEND_OUT = 0.03  // 62%→65% smooth ramp out

const DRONE_TARGET_SIZE = 3

export default function Scene3D({
  mouse = { normalizedX: 0, normalizedY: 0 },
  scrollProgress = 0,
  onHoverChange,
  onDroneClick,
  focusDroneUntil = 0,
}: SceneProps) {
  const performance = useDevicePerformance()
  const groupRef = useRef<THREE.Group>(null)
  const targetCamPos = useRef(new THREE.Vector3(0, 5, 12))
  const focusTarget = useRef(new THREE.Vector3(0, 4.8, 1))
  const cameraDroneBlend = useRef(0)
  const vignetteEffectRef = useRef<any>(null)

  // Reuse vectors to avoid per-frame allocations
  const normalTargetPos = useRef(new THREE.Vector3())
  const normalLookAt = useRef(new THREE.Vector3())
  const droneCamPos = useRef(new THREE.Vector3())
  const droneLookAt = useRef(new THREE.Vector3())
  const parcelPos = useRef(new THREE.Vector3())
  const parcelCamPos = useRef(new THREE.Vector3())
  const parcelLookAt = useRef(new THREE.Vector3())
  const blendedLookAt = useRef(new THREE.Vector3())
  const lookTarget = useRef(new THREE.Vector3())
  const followOffset = useMemo(() => new THREE.Vector3(0, 3, 6), [])

  useFrame((state) => {
    const cam = state.camera
    const t = state.clock.elapsedTime
    const focusActiveClick = t < focusDroneUntil

    // Scroll-based drone view: active from 20% to 60% (while box travels to pod), smooth blend at edges
    const scrollDroneBlend =
      smoothStep(DRONE_VIEW_SCROLL_START - DRONE_VIEW_BLEND_IN, DRONE_VIEW_SCROLL_START, scrollProgress) *
      (1 - smoothStep(DRONE_VIEW_SCROLL_END - DRONE_VIEW_BLEND_OUT, DRONE_VIEW_SCROLL_END, scrollProgress))
    const targetBlend = focusActiveClick ? 1 : scrollDroneBlend
    cameraDroneBlend.current += (targetBlend - cameraDroneBlend.current) * 0.05
    const blendRaw = cameraDroneBlend.current
    const blend = blendRaw * blendRaw * (3 - 2 * blendRaw)

    const mouseStrength = blend > 0.5 ? 0.08 : 0.4 * (1 - scrollProgress * 0.7)
    const baseZ = 12 + scrollProgress * 8
    const baseY = 5 + scrollProgress * 4

    // Normal view target (reuse refs)
    normalTargetPos.current.set(
      mouse.normalizedX * 3.5 * mouseStrength,
      baseY + mouse.normalizedY * 2 * mouseStrength,
      baseZ + mouse.normalizedX * 0.5 * mouseStrength
    )
    const lookY = 2 - scrollProgress * 2
    const lookZ = scrollProgress * 5
    normalLookAt.current.set(mouse.normalizedX * 0.8, lookY, lookZ)

    // Drone-follow view target (base), later blended toward parcel follow-cam during drop
    droneCamPos.current.copy(focusTarget.current).add(followOffset)
    droneLookAt.current.set(
      focusTarget.current.x,
      focusTarget.current.y - 0.3,
      focusTarget.current.z
    )

    // When the parcel is mid‑air, blend the drone camera toward a tighter follow‑cam on the parcel itself.
    const isDropping =
      scrollProgress >= DROP_START_SCROLL && scrollProgress <= DROP_END_SCROLL
    let followParcelBlend = 0
    if (isDropping) {
      const midWindow = 0.08
      const inBlendIn = smoothStep(
        DROP_START_SCROLL,
        DROP_START_SCROLL + midWindow,
        scrollProgress
      )
      const inBlendOut =
        1 -
        smoothStep(
          DROP_END_SCROLL - midWindow,
          DROP_END_SCROLL,
          scrollProgress
        )
      followParcelBlend = inBlendIn * inBlendOut
    }

    if (followParcelBlend > 0) {
      const dropSpan = DROP_END_SCROLL - DROP_START_SCROLL
      const rawDropT = Math.min(
        1,
        Math.max(0, (scrollProgress - DROP_START_SCROLL) / dropSpan)
      )
      const dropTEased = rawDropT * rawDropT

      parcelPos.current.set(
        DROP_START.x + (DROP_END.x - DROP_START.x) * dropTEased,
        DROP_START.y + (DROP_END.y - DROP_START.y) * dropTEased,
        DROP_START.z + (DROP_END.z - DROP_START.z) * dropTEased
      )

      parcelCamPos.current.set(
        parcelPos.current.x + 0.4,
        parcelPos.current.y + 1.4,
        parcelPos.current.z + 3.2
      )
      parcelLookAt.current.set(
        parcelPos.current.x,
        parcelPos.current.y - 0.08,
        parcelPos.current.z
      )

      droneCamPos.current.lerp(parcelCamPos.current, followParcelBlend)
      droneLookAt.current.lerp(parcelLookAt.current, followParcelBlend)
    }

    // Blend between normal and drone/parcel camera for smooth transition (no extra shake)
    targetCamPos.current.copy(normalTargetPos.current).lerp(droneCamPos.current, blend)
    cam.position.lerp(targetCamPos.current, 0.05)

    // Extra smoothing on the look-at target so pans feel more buttery
    lookTarget.current.lerpVectors(normalLookAt.current, droneLookAt.current, blend)
    blendedLookAt.current.lerp(lookTarget.current, 0.08)
    cam.lookAt(blendedLookAt.current)

    if (groupRef.current) {
      const scale = 1 - scrollProgress * 0.15
      groupRef.current.scale.setScalar(scale)
    }

    const v = vignetteEffectRef.current
    if (v) {
      const edge = blend * blend * (3 - 2 * blend)
      v.darkness = 0.5 + edge * 0.26
      v.offset = 0.1 + edge * 0.12
    }
  })

  return (
    <>
      <CitySkyGradient />
      <color attach="background" args={['#e2e9f3']} />
      <fog attach="fog" args={[CITY_FOG_COLOR, 16, 78]} />

      <ambientLight intensity={0.52} />
      <hemisphereLight args={['#d2e8f5', '#8f8278', 0.72]} />
      <directionalLight
        position={[10, 18, 12]}
        intensity={1.22}
        color="#fff6eb"
        castShadow={performance.shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={55}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.00008}
        shadow-normalBias={0.04}
        shadow-radius={4}
      />
      <directionalLight position={[-14, 9, -8]} intensity={0.42} color="#b8d4e8" />
      <directionalLight position={[6, 14, -10]} intensity={0.18} color="#fde8c8" />
      <pointLight position={[0, 8, 4]} color="#14b8a6" intensity={1.85} distance={32} decay={2} />
      <pointLight position={[-6, 3, 8]} color="#fcd34d" intensity={0.42} distance={22} decay={2} />

      {!performance.isLowEnd && (
        <Environment preset="dawn" environmentIntensity={0.38} background={false} />
      )}

      <group ref={groupRef}>
        {!performance.isLowEnd && (
          <Sparkles count={40} scale={40} size={1.4} speed={0.2} opacity={0.28} color="#5eead4" />
        )}

        <CityGroundPlane />
        <Suspense fallback={null}>
          <HeroCityModel useLitMaterials={!performance.isLowEnd} />
        </Suspense>
        <Suspense fallback={null}>
          <DroneAnimated
            scrollProgress={scrollProgress}
            onHoverChange={onHoverChange}
            onDroneClick={onDroneClick}
            focusTargetRef={focusTarget}
          />
        </Suspense>
        {!performance.isLowEnd && <DroneTrail focusTargetRef={focusTarget} />}
        <Pods onHoverChange={onHoverChange} />
        <DroppingParcel scrollProgress={scrollProgress} />
        <TrafficRings isLowEnd={performance.isLowEnd} />
        {!performance.isLowEnd && <DistantAirTraffic />}
      </group>

      {!performance.isLowEnd && (
        <ContactShadows
          position={[0, -0.06, 0]}
          opacity={0.18}
          scale={46}
          blur={5.5}
          far={24}
          color="#3d3835"
        />
      )}

      {!performance.isLowEnd && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.52} luminanceSmoothing={0.9} intensity={0.36} mipmapBlur />
          <Vignette ref={vignetteEffectRef} eskil={false} offset={0.12} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  )
}

function DroneAnimated({
  scrollProgress = 0,
  onHoverChange,
  onDroneClick,
  focusTargetRef,
}: {
  scrollProgress?: number
  onHoverChange?: (t: HoverTarget) => void
  onDroneClick?: (clockSeconds: number) => void
  focusTargetRef?: React.MutableRefObject<THREE.Vector3>
}) {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const { clock } = useThree()
  const { scene } = useGLTF(DRONE_GLTF_URL)

  // Entrance animation state
  const entranceProgress = useRef(0)
  const entranceDelay = 0.4 // seconds delay before animation starts (matches text delay)
  const entranceDuration = 1.2 // seconds for full animation

  // Refs for the 4 propellers
  const wingsRef = useRef<THREE.Object3D[]>([])

  // Store references to all drone materials for opacity animation
  const droneMaterials = useRef<THREE.Material[]>([])

  const { clonedScene, scale: modelScale, baseOffset } = useMemo(() => {
    const clone = scene.clone()
    wingsRef.current = []
    droneMaterials.current = []

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true
          ; (child as THREE.Mesh).receiveShadow = true
        // Make materials transparent for fade-in animation
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          materials.forEach((mat) => {
            mat.transparent = true
            mat.opacity = 0 // Start invisible
            droneMaterials.current.push(mat)
          })
        }
      }
      // Identify wing parent nodes (Wing1, Wing2, Wing3, Wing4) - not the mesh children
      if (/^Wing\d$/.test(child.name)) {
        wingsRef.current.push(child)
      }
    })

    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const s = DRONE_TARGET_SIZE / maxDim
    return {
      clonedScene: clone,
      scale: s,
      baseOffset: {
        x: -center.x * s,
        y: -center.y * s,
        z: -center.z * s,
      },
    }
  }, [scene])


  useFrame((state, delta) => {
    if (!ref.current) return
    const currentTime = state.clock.elapsedTime

    // Entrance animation: delay then smooth ease-out over duration
    if (entranceProgress.current < 1) {
      const timeSinceStart = currentTime
      if (timeSinceStart > entranceDelay) {
        const t = Math.min(1, (timeSinceStart - entranceDelay) / entranceDuration)
        // Ease-out cubic for smooth deceleration
        entranceProgress.current = 1 - Math.pow(1 - t, 3)
      }
    }
    const entrance = entranceProgress.current

    // After the parcel has reached the pod in the hero scene (around 60–65% scroll),
    // have this same drone peel away toward the viewer and downwards,
    // exiting through the bottom of the frame instead of drifting up‑right.
    const DEPART_START = 0.6
    const DEPART_END = 0.9
    const departTRaw =
      scrollProgress <= DEPART_START
        ? 0
        : scrollProgress >= DEPART_END
          ? 1
          : (scrollProgress - DEPART_START) / (DEPART_END - DEPART_START)
    const departT = departTRaw * departTRaw * (3 - 2 * departTRaw)

    // Spin propellers - rotate around local Z axis (due to model orientation)
    // Delta is the time since last frame, use it for frame-rate independent animation
    wingsRef.current.forEach((wing, i) => {
      // Alternate direction for adjacent propellers (realistic counter-rotation)
      const direction = i % 2 === 0 ? 1 : -1
      wing.rotation.z += 25 * direction * delta // fast spinning
    })

    // Drone in front of camera so it's visible; baseOffset centers the model at this position.
    // Entrance: fly in from below and in front (toward the viewer).
    const entranceOffsetY = (1 - entrance) * -6 // starts 6 units below
    const entranceOffsetZ = (1 - entrance) * 8 // starts 8 units in front (toward camera)

    // Departure offsets
    const departOffsetX = 20 * departT
    const departOffsetY = 2 * departT
    const departOffsetZ = -2 * departT

    // Subtle turbulence
    const turbulenceStrength = (1 - departT) * entrance
    const swayX =
      (Math.sin(currentTime * 1.9) * 0.12 +
        Math.sin(currentTime * 0.47 + 1.3) * 0.08) *
      turbulenceStrength
    const swayZ =
      (Math.sin(currentTime * 1.3 + 0.7) * 0.1 +
        Math.cos(currentTime * 0.63 + 2.1) * 0.06) *
      turbulenceStrength
    const bobY =
      Math.sin(currentTime * 3) * 0.03 * entrance +
      Math.sin(currentTime * 1.1 + 0.4) * 0.02 * turbulenceStrength

    // Set position directly — avoids per-frame Vector3 allocation
    ref.current.position.set(
      baseOffset.x + departOffsetX + swayX,
      5.3 + baseOffset.y + entranceOffsetY + departOffsetY + bobY,
      1 + baseOffset.z + entranceOffsetZ + departOffsetZ + swayZ
    )
    if (focusTargetRef) focusTargetRef.current.copy(ref.current.position)


    // Scale includes entrance animation (starts at 0.3, grows to full size)
    const entranceScale = 0.3 + entrance * 0.7
    // Slightly adjust scale as it departs; keep it roughly stable so motion reads as toward‑camera
    const departScale = 1 - 0.03 * departT
    const targetScale = modelScale * entranceScale * departScale * (hovered ? 1.12 : 1)
    const s = ref.current.scale.x + (targetScale - ref.current.scale.x) * 0.12
    ref.current.scale.setScalar(s)

    ref.current.lookAt(0, 4, 5)
    const rollDemand =
      Math.sin(currentTime * 0.3) * 0.05 +
      Math.sin(currentTime * 2.1) * 0.03 * (1 - departT) +
      departT * 0.18
    const pitchDemand =
      0.12 + Math.cos(currentTime * 1.7) * 0.04 * (1 - departT) + departT * 0.06
    ref.current.rotation.z = rollDemand * 0.8
    ref.current.rotation.x = pitchDemand * 0.5

    // Keep the drone fully opaque while it moves down through the frame,
    // and only let it disappear once it is fully off‑screen at the very end.
    const opacity = entrance
    droneMaterials.current.forEach((mat) => {
      mat.opacity = opacity
    })
  })

  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.15}>
      <group
        ref={ref}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          onHoverChange?.('drone')
        }}
        onPointerOut={() => {
          setHovered(false)
          onHoverChange?.(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          onDroneClick?.(clock.getElapsedTime())
        }}
      >
        <mesh position={[0, 0, 0]} visible={false}>
          <boxGeometry args={[2.5, 1.5, 2.5]} />
        </mesh>
        <primitive object={clonedScene} />
      </group>
    </Float>
  )
}

// Same parcel as drone's payload: drops from drone position (15% scroll) to pod top (60% scroll)
const DRONE_SCALE = 3 // match DroneAnimated baseScale so parcel is same size
const DROP_START_SCROLL = 0.15
const DROP_END_SCROLL = 0.6
const POD_LIFT = 0.4
const POD_TOP_Y = getHeroParcelLandWorldY(POD_LIFT, DRONE_SCALE)
// Drone at (0, 5.3, 1), scale 3, package local (0, -0.17, -0.02) → world start
const DROP_START = { x: 0, y: 5.3 + DRONE_SCALE * (-0.17), z: 1 + DRONE_SCALE * (-0.02) }
const DROP_END = { x: 0, y: POD_TOP_Y, z: 0 }

function DroppingParcel({ scrollProgress }: { scrollProgress: number }) {
  const visible = scrollProgress >= DROP_START_SCROLL && scrollProgress <= DROP_END_SCROLL
  const logoTexture = useTexture(AEROHORSE_LOGO_URL)

  // Single phase: Drop from drone to pod (15% - 60%)
  const dropT = visible
    ? Math.min(1, (scrollProgress - DROP_START_SCROLL) / (DROP_END_SCROLL - DROP_START_SCROLL))
    : 0
  const dropTEased = dropT * dropT

  let x: number, y: number, z: number

  // Directly interpolate from drone start to pod top
  x = DROP_START.x + (DROP_END.x - DROP_START.x) * dropTEased
  y = DROP_START.y + (DROP_END.y - DROP_START.y) * dropTEased
  z = DROP_START.z + (DROP_END.z - DROP_START.z) * dropTEased

  if (!visible) return null

  const boxWidth = 0.14
  const boxHeight = 0.1
  const boxDepth = 0.16
  const logoSize = 0.06

  return (
    <group position={[x, y, z]} scale={DRONE_SCALE}>
      {/* Main parcel with rounded edges */}
      <RoundedBox
        args={[boxWidth, boxHeight, boxDepth]}
        radius={0.015}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#f97316" />
      </RoundedBox>

      {/* Logo on front side (+Z) */}
      <mesh position={[0, 0, boxDepth / 2 + 0.001]}>
        <planeGeometry args={[logoSize, logoSize]} />
        <meshBasicMaterial map={logoTexture} transparent />
      </mesh>

      {/* Logo on back side (-Z) */}
      <mesh position={[0, 0, -boxDepth / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[logoSize, logoSize]} />
        <meshBasicMaterial map={logoTexture} transparent />
      </mesh>

      {/* Logo on right side (+X) */}
      <mesh position={[boxWidth / 2 + 0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[logoSize, logoSize]} />
        <meshBasicMaterial map={logoTexture} transparent />
      </mesh>

      {/* Logo on left side (-X) */}
      <mesh position={[-boxWidth / 2 - 0.001, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[logoSize, logoSize]} />
        <meshBasicMaterial map={logoTexture} transparent />
      </mesh>

      {/* Tape strips */}
      <mesh position={[0, boxHeight / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.02, boxDepth * 0.8]} />
        <meshBasicMaterial color="#d97706" />
      </mesh>

      {/* Strings */}
      {[[-0.03, 0], [0.03, 0], [0, -0.03], [0, 0.03]].map((offset, idx) => (
        <mesh key={idx} position={[offset[0], 0.06, offset[1]]}>
          <cylinderGeometry args={[0.001, 0.001, 0.06, 4]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      ))}
    </group>
  )
}

// (Truck model and path have been removed from the hero scene;
// delivery is now expressed purely via the drone + parcel + pod.)

function Pods({ onHoverChange }: { onHoverChange?: (t: HoverTarget) => void }) {
  return (
    <Pod position={[0, POD_LIFT, 0]} delay={0} onHoverChange={onHoverChange} />
  )
}

function Pod({
  position,
  delay,
  onHoverChange,
}: {
  position: [number, number, number]
  delay: number
  onHoverChange?: (t: HoverTarget) => void
}) {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + delay) * 0.04
    }
  })

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        onHoverChange?.('pod')
      }}
      onPointerOut={() => {
        setHovered(false)
        onHoverChange?.(null)
      }}
    >
      <mesh position={[0, 0.32, 0]} visible={false}>
        <cylinderGeometry args={[0.85, 0.92, 1.15, 12]} />
      </mesh>
      <PodGLTFModel hovered={hovered} />
      <pointLight position={[0, 0.52, 0]} color="#0d9488" intensity={hovered ? 2.2 : 1.5} distance={4} />
    </group>
  )
}

// Seeded random for traffic effects
const SEED = 42
function seeded(i: number) {
  const x = Math.sin(SEED + i * 9999) * 10000
  return x - Math.floor(x)
}







function TrafficRings({ isLowEnd }: { isLowEnd: boolean }) {
  const rings = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const instancesPerRing = isLowEnd ? 8 : 16
  const radii = useMemo(() => isLowEnd ? [12] : [9, 14, 19], [isLowEnd])
  const total = radii.length * instancesPerRing
  const frameRef = useRef(0)

  useFrame((state) => {
    if (!rings.current) return
    // Throttle: update every 2 frames
    frameRef.current++
    if (frameRef.current % 2 !== 0) return
    const t = state.clock.elapsedTime
    let i = 0
    for (let r = 0; r < radii.length; r++) {
      const radius = radii[r]
      const dir = r % 2 === 0 ? 1 : -1
      for (let j = 0; j < instancesPerRing; j++) {
        const phase = (j / instancesPerRing) * Math.PI * 2
        const angle = phase + t * 0.28 * dir
        dummy.position.set(Math.cos(angle) * radius, 0.16, Math.sin(angle) * radius)
        dummy.scale.setScalar(0.22)
        dummy.rotation.y = angle
        dummy.updateMatrix()
        rings.current.setMatrixAt(i++, dummy.matrix)
      }
    }
    rings.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={rings} args={[undefined, undefined, total]}>
      <sphereGeometry args={[0.06, 6, 6]} />
      <meshBasicMaterial color="#f97316" transparent opacity={0.7} />
    </instancedMesh>
  )
}

function DistantAirTraffic() {
  const swarm = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const radii = useMemo(() => [16, 22, 28], [])
  const instancesPerRing = 12
  const total = radii.length * instancesPerRing
  const frameRef = useRef(0)

  useFrame((state) => {
    if (!swarm.current) return
    // Throttle: update every 3 frames
    frameRef.current++
    if (frameRef.current % 3 !== 0) return
    const t = state.clock.elapsedTime
    let i = 0
    for (let r = 0; r < radii.length; r++) {
      const radius = radii[r]
      const height = 4 + r * 1.8
      for (let j = 0; j < instancesPerRing; j++) {
        const phase = (j / instancesPerRing) * Math.PI * 2
        const angle = phase + t * 0.12
        dummy.position.set(
          Math.cos(angle) * radius,
          height + Math.sin(t * 0.9 + phase) * 0.35,
          Math.sin(angle) * radius
        )
        dummy.scale.setScalar(0.16 + (j / instancesPerRing) * 0.06)
        dummy.updateMatrix()
        swarm.current.setMatrixAt(i++, dummy.matrix)
      }
    }
    swarm.current.instanceMatrix.needsUpdate = true
      ; (swarm.current.material as THREE.MeshBasicMaterial).opacity =
        0.25 + Math.sin(state.clock.elapsedTime * 1.4) * 0.15
  })

  return (
    <instancedMesh ref={swarm} args={[undefined, undefined, total]}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshBasicMaterial color="#e5e7eb" transparent opacity={0.3} />
    </instancedMesh>
  )
}

function DroneTrail({ focusTargetRef }: { focusTargetRef: React.MutableRefObject<THREE.Vector3> }) {
  const trailRef = useRef<THREE.InstancedMesh>(null)
  const positionsRef = useRef<THREE.Vector3[]>([])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const trailColor = useMemo(() => new THREE.Color(0x0d9488), [])
  const trailLength = 30

  useFrame(() => {
    if (!trailRef.current) return

    const currentPos = focusTargetRef.current
    positionsRef.current.unshift(currentPos.clone())
    if (positionsRef.current.length > trailLength) {
      positionsRef.current.pop()
    }

    for (let i = 0; i < trailLength; i++) {
      const pos = positionsRef.current[i]
      if (pos) {
        dummy.position.copy(pos)
        const opacity = 1 - i / trailLength
        dummy.scale.setScalar(0.1 + (1 - i / trailLength) * 0.05)
        dummy.updateMatrix()
        trailRef.current.setMatrixAt(i, dummy.matrix)
        if (trailRef.current.instanceColor) {
          trailRef.current.instanceColor.setXYZ(i, trailColor.r, trailColor.g, trailColor.b)
        }
      }
    }
    trailRef.current.instanceMatrix.needsUpdate = true
    if (trailRef.current.instanceColor) {
      trailRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={trailRef} args={[undefined, undefined, trailLength]}>
      <sphereGeometry args={[0.05, 4, 4]} />
      <meshBasicMaterial color="#0d9488" transparent opacity={0.6} />
    </instancedMesh>
  )
}

