/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useMemo, useState, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles, useGLTF, RoundedBox, useTexture } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const GRID_SIZE = 25

export type HoverTarget = 'drone' | 'pod' | null

// --- Data City: one unified city where buildings encode weather + delivery data ---
type WeatherType = 'sunny' | 'rain' | 'snow' | 'cloudy' | 'fog'
interface BuildingData {
  gridX: number
  gridZ: number
  districtId: number
  weather: WeatherType
  deliveryActivity: number // 0–1, drives height + glow
  temperature: number     // 0–1, warm–cool for tint
}

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

const DRONE_GLTF_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/drone/scene.gltf'
const DRONE_TARGET_SIZE = 3
useGLTF.preload(DRONE_GLTF_URL)

export default function Scene3D({
  mouse = { normalizedX: 0, normalizedY: 0 },
  scrollProgress = 0,
  onHoverChange,
  onDroneClick,
  focusDroneUntil = 0,
}: SceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const targetCamPos = useRef(new THREE.Vector3(0, 5, 12))
  const focusTarget = useRef(new THREE.Vector3(0, 4.8, 1))
  const cameraDroneBlend = useRef(0)

  // Reuse vectors to avoid per-frame allocations
  const normalTargetPos = useRef(new THREE.Vector3())
  const normalLookAt = useRef(new THREE.Vector3())
  const droneCamPos = useRef(new THREE.Vector3())
  const droneLookAt = useRef(new THREE.Vector3())
  const blendedLookAt = useRef(new THREE.Vector3())
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
    cameraDroneBlend.current += (targetBlend - cameraDroneBlend.current) * 0.06
    const blend = cameraDroneBlend.current

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

    // Drone-follow view target
    droneCamPos.current.copy(focusTarget.current).add(followOffset)
    droneLookAt.current.set(
      focusTarget.current.x,
      focusTarget.current.y - 0.3,
      focusTarget.current.z
    )

    // Blend between normal and drone camera for smooth transition
    targetCamPos.current.copy(normalTargetPos.current).lerp(droneCamPos.current, blend)
    cam.position.lerp(targetCamPos.current, 0.08)
    blendedLookAt.current.lerpVectors(normalLookAt.current, droneLookAt.current, blend)
    cam.lookAt(blendedLookAt.current)

    if (groupRef.current) {
      const scale = 1 - scrollProgress * 0.15
      groupRef.current.scale.setScalar(scale)
    }
  })

  return (
    <>
      <color attach="background" args={['#fafaf9']} />
      <fog attach="fog" args={['#fafaf9', 15, 50]} />

      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 15, 8]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 8, 4]} color="#0d9488" intensity={2} distance={25} />
      <pointLight position={[-8, 5, -4]} color="#64748b" intensity={1} distance={20} />
      <pointLight position={[8, 4, 2]} color="#78716c" intensity={0.8} distance={18} />

      <group ref={groupRef}>
        <Sparkles count={45} scale={35} size={2} speed={0.3} opacity={0.3} color="#0d9488" />
        <Sparkles count={25} scale={30} size={2.5} speed={0.2} opacity={0.2} color="#a8a29e" />

        <GroundPlane />
        <DataCity scrollProgress={scrollProgress} />
        <Suspense fallback={null}>
          <DroneAnimated
            scrollProgress={scrollProgress}
            onHoverChange={onHoverChange}
            onDroneClick={onDroneClick}
            focusTargetRef={focusTarget}
          />
        </Suspense>
        <Pods onHoverChange={onHoverChange} />
        <Suspense fallback={<TruckPlaceholder />}>
          <DeliveryCar scrollProgress={scrollProgress} />
        </Suspense>
        <DroppingParcel scrollProgress={scrollProgress} />
      </group>

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.9} intensity={0.5} mipmapBlur />
      </EffectComposer>
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

    // Spin propellers - rotate around local Z axis (due to model orientation)
    // Delta is the time since last frame, use it for frame-rate independent animation
    wingsRef.current.forEach((wing, i) => {
      // Alternate direction for adjacent propellers (realistic counter-rotation)
      const direction = i % 2 === 0 ? 1 : -1
      wing.rotation.z += 25 * direction * delta // fast spinning
    })

    // Drone in front of camera so it's visible; baseOffset centers the model at this position
    // Entrance: fly in from below and in front (toward the viewer)
    const entranceOffsetY = (1 - entrance) * -6 // starts 6 units below
    const entranceOffsetZ = (1 - entrance) * 8 // starts 8 units in front (toward camera)
    
    const pos = new THREE.Vector3(0, 5.3, 1)
    pos.x += baseOffset.x
    pos.y += baseOffset.y + entranceOffsetY
    pos.z += baseOffset.z + entranceOffsetZ
    pos.y += Math.sin(currentTime * 3) * 0.03 * entrance // Subtle hover bob (fade in with entrance)

    ref.current.position.copy(pos)

    if (focusTargetRef) focusTargetRef.current.copy(ref.current.position)

    // Scale includes entrance animation (starts at 0.3, grows to full size)
    const entranceScale = 0.3 + entrance * 0.7
    const targetScale = modelScale * entranceScale * (hovered ? 1.12 : 1)
    const s = ref.current.scale.x + (targetScale - ref.current.scale.x) * 0.12
    ref.current.scale.setScalar(s)

    ref.current.lookAt(0, 4, 5)
    const rollDemand = Math.sin(currentTime * 0.3) * 0.05
    const pitchDemand = 0.12
    ref.current.rotation.z = rollDemand * 0.8
    ref.current.rotation.x = pitchDemand * 0.5

    // Fade in drone materials
    droneMaterials.current.forEach((mat) => {
      mat.opacity = entrance
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

// Pod base radius ~0.8, diameter ~1.6. Truck placed one diameter to the left of pod.
const POD_RADIUS = 0.8
const POD_DIAMETER = POD_RADIUS * 2

// Same parcel as drone's payload: drops from drone position (15% scroll) to pod top (60% scroll)
// Then travels from pod toward truck (60-65% scroll) for one pod diameter distance
const DRONE_SCALE = 3 // match DroneAnimated baseScale so parcel is same size
const DROP_START_SCROLL = 0.15
const DROP_END_SCROLL = 0.6
const TRAVEL_START_SCROLL = 0.6
const TRAVEL_END_SCROLL = 0.65
// Pod ring top y=0.18; parcel height 0.1*DRONE_SCALE → center at 0.18 + 0.1*DRONE_SCALE/2
const POD_TOP_Y = 0.18 + (0.1 * DRONE_SCALE) / 2
// Drone at (0, 5.3, 1), scale 3, package local (0, -0.17, -0.02) → world start
const DROP_START = { x: 0, y: 5.3 + DRONE_SCALE * (-0.17), z: 1 + DRONE_SCALE * (-0.02) }
const DROP_END = { x: 0, y: POD_TOP_Y, z: 0 }
// Travel destination: one pod diameter in truck direction (negative X)
const TRAVEL_END = { x: -POD_DIAMETER, y: POD_TOP_Y, z: 0 }

const LOGO_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/aerohorse-logo.png'

function DroppingParcel({ scrollProgress }: { scrollProgress: number }) {
  const visible = scrollProgress >= DROP_START_SCROLL && scrollProgress < TRAVEL_END_SCROLL
  const logoTexture = useTexture(LOGO_URL)

  // Phase 1: Drop from drone to pod (15% - 60%)
  const dropT = visible
    ? Math.min(1, (scrollProgress - DROP_START_SCROLL) / (DROP_END_SCROLL - DROP_START_SCROLL))
    : 0
  const dropTEased = dropT * dropT

  // Phase 2: Travel from pod toward truck (60% - 65%)
  const travelT = scrollProgress >= TRAVEL_START_SCROLL
    ? Math.min(1, (scrollProgress - TRAVEL_START_SCROLL) / (TRAVEL_END_SCROLL - TRAVEL_START_SCROLL))
    : 0
  const travelTEased = travelT * travelT * (3 - 2 * travelT) // smoothstep for smooth motion

  let x: number, y: number, z: number

  if (scrollProgress < TRAVEL_START_SCROLL) {
    // Phase 1: Dropping to pod
    x = DROP_START.x + (DROP_END.x - DROP_START.x) * dropTEased
    y = DROP_START.y + (DROP_END.y - DROP_START.y) * dropTEased
    z = DROP_START.z + (DROP_END.z - DROP_START.z) * dropTEased
  } else {
    // Phase 2: Traveling from pod toward truck
    x = DROP_END.x + (TRAVEL_END.x - DROP_END.x) * travelTEased
    y = DROP_END.y + (TRAVEL_END.y - DROP_END.y) * travelTEased
    z = DROP_END.z + (TRAVEL_END.z - DROP_END.z) * travelTEased
  }

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

const TRUCK_POSITION_X = -POD_DIAMETER - 0.3  // one pod diameter to the left of pod center
const TRUCK_TARGET_SIZE = 1.4

// Truck animation: starts at 72% scroll, completes by 100%
const TRUCK_START_SCROLL = 0.70
const TRUCK_END_SCROLL = 1.0

const TRUCK_GLTF_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/truck/scene.gltf'
useGLTF.preload(TRUCK_GLTF_URL)

// Calculate truck position and rotation along simple L-shaped path
// Original truck orientation: Math.PI (back faces +X, toward pod)
function getTruckPathPosition(t: number): { x: number; z: number; rotation: number } {
  const startX = TRUCK_POSITION_X
  const startZ = 0

  // t=0: truck is stationary, original orientation (Math.PI)
  if (t <= 0) {
    return { x: startX, z: startZ, rotation: Math.PI }
  }

  // 70-72% scroll: -X direction (0% - 16.7% of path t)
  // 72-82% scroll: turn + +Z direction (16.7% - 100% of path t)
  // So phase1 ends at t = (72-70)/(82-70) = 2/12 = 0.167
  const phase1End = 0.167
  const straightDistance = POD_DIAMETER

  if (t <= phase1End) {
    // Phase 1: Straight line in -X direction (70-72% scroll)
    const phase1T = t / phase1End
    const x = startX - straightDistance * phase1T
    return { x, z: startZ, rotation: Math.PI }
  }

  const turnStartX = startX - straightDistance

  // Quick smooth turn (16.7% - 25% of path t)
  const phase2End = 0.25
  const turnRadius = 2

  if (t <= phase2End) {
    // Smooth arc turn: 90 degrees to the right (toward +Z, scroll direction)
    const phase2T = (t - phase1End) / (phase2End - phase1End)
    const angle = phase2T * (Math.PI / 2) // 0 to PI/2 (quarter circle)
    const x = turnStartX - turnRadius * Math.sin(angle)
    const z = startZ + turnRadius * (1 - Math.cos(angle))
    // Rotate from PI (facing -X) to PI + PI/2 = 3PI/2 or -PI/2 (facing +Z)
    const rotation = Math.PI + angle
    return { x, z, rotation }
  }

  // Phase 3: Straight line in +Z direction (75-85% scroll)
  const turnEndX = turnStartX - turnRadius
  const turnEndZ = startZ + turnRadius
  const straightLength = 15

  const phase3T = (t - phase2End) / (1 - phase2End)
  const x = turnEndX
  const z = turnEndZ + straightLength * phase3T
  // Facing +Z direction: rotation = 3PI/2 or -PI/2
  const rotation = Math.PI * 1.5
  return { x, z, rotation }
}

function TruckPlaceholder() {
  return (
    <group position={[TRUCK_POSITION_X, 0.3, 0]} rotation={[0, Math.PI, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.25, 0.2]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function DeliveryCar({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const { scene } = useGLTF(TRUCK_GLTF_URL)
  const groupRef = useRef<THREE.Group>(null)

  const { clonedScene, scale, baseOffset } = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true
          ; (child as THREE.Mesh).receiveShadow = true
      }
    })
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const s = TRUCK_TARGET_SIZE / maxDim

    return {
      clonedScene: clone,
      scale: s,
      baseOffset: {
        x: -center.x * s,
        y: -box.min.y * s,
        z: center.z * s,
      },
    }
  }, [scene])

  // Calculate animated position based on scroll
  const truckT = scrollProgress >= TRUCK_START_SCROLL
    ? Math.min(1, (scrollProgress - TRUCK_START_SCROLL) / (TRUCK_END_SCROLL - TRUCK_START_SCROLL))
    : 0

  const pathPos = getTruckPathPosition(truckT)

  // Apply easing for smoother motion
  const easedT = truckT * truckT * (3 - 2 * truckT)
  const animatedPathPos = getTruckPathPosition(easedT)

  const posX = animatedPathPos.x + baseOffset.x
  const posY = baseOffset.y
  const posZ = animatedPathPos.z + baseOffset.z
  const rotationY = animatedPathPos.rotation

  return (
    <group
      ref={groupRef}
      position={[posX, posY, posZ]}
      scale={[scale, scale, scale]}
      rotation={[0, rotationY, 0]}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

function Pods({ onHoverChange }: { onHoverChange?: (t: HoverTarget) => void }) {
  return (
    <Pod position={[0, 0, 0]} delay={0} onHoverChange={onHoverChange} />
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
  const ringRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + delay) * 0.04
    }
    const pulse = hovered ? 0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.15 : 0.85
    if (ringRef.current?.material) {
      ; (ringRef.current.material as THREE.MeshBasicMaterial).opacity = pulse
    }
    if (glowRef.current?.material) {
      ; (glowRef.current.material as THREE.MeshBasicMaterial).opacity = hovered ? 1 : 0.9
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
      {/* Hit area */}
      <mesh position={[0, 0.4, 0]} visible={false}>
        <cylinderGeometry args={[1, 1, 1.2, 8]} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 0.15, 6]} />
        <meshStandardMaterial color="#57534e" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Dome */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0d9488" transparent opacity={hovered ? 0.4 : 0.25} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Ring */}
      <mesh ref={ringRef} position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.68, 32]} />
        <meshBasicMaterial color="#0d9488" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef} position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#14b8a6" transparent opacity={0.9} />
      </mesh>

      <pointLight position={[0, 0.4, 0]} color="#0d9488" intensity={hovered ? 2.2 : 1.5} distance={3} />
    </group>
  )
}

// One unified city: layout is a single grid of building slots; each building encodes weather + delivery data
const CITY_RING_INNER = 6
const CITY_RING_OUTER = 22
const CITY_STEP = 3
const SEED = 42
function seeded(i: number) {
  const x = Math.sin(SEED + i * 9999) * 10000
  return x - Math.floor(x)
}

function buildCityLayout(): BuildingData[] {
  const out: BuildingData[] = []
  let idx = 0
  for (let x = -GRID_SIZE; x <= GRID_SIZE; x += CITY_STEP) {
    for (let z = -GRID_SIZE; z <= GRID_SIZE; z += CITY_STEP) {
      const dist = Math.sqrt(x * x + z * z)
      if (dist < CITY_RING_INNER || dist > CITY_RING_OUTER) continue
      if (seeded(idx) > 0.32) {
        const districtId = Math.floor((Math.atan2(z, x) + Math.PI) / (Math.PI / 2)) % 4
        out.push({
          gridX: x,
          gridZ: z,
          districtId,
          weather: 'sunny',
          deliveryActivity: 0.3 + seeded(idx + 1) * 0.65,
          temperature: 0.4 + seeded(idx + 2) * 0.4,
        })
      }
      idx++
    }
  }
  return out
}

const WEATHER_CYCLE: WeatherType[] = ['sunny', 'cloudy', 'rain', 'fog', 'snow', 'cloudy', 'sunny']
function getWeatherForScroll(scrollProgress: number, districtId: number): WeatherType {
  const phase = (scrollProgress * 1.2 + districtId * 0.15) % 1
  const index = Math.floor(phase * (WEATHER_CYCLE.length - 1))
  return WEATHER_CYCLE[Math.min(index, WEATHER_CYCLE.length - 1)]
}

function DataCity({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const layout = useMemo(() => buildCityLayout(), [])

  const gridGeom = useMemo(() => {
    const step = 2.5
    const points: number[] = []
    const idx: number[] = []
    let i = 0
    for (let x = -GRID_SIZE; x <= GRID_SIZE; x += step) {
      points.push(x, 0.02, -GRID_SIZE, x, 0.02, GRID_SIZE)
      idx.push(i, i + 1)
      i += 2
      points.push(-GRID_SIZE, 0.02, x, GRID_SIZE, 0.02, x)
      idx.push(i, i + 1)
      i += 2
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3))
    g.setIndex(new THREE.BufferAttribute(new Uint16Array(idx), 1))
    return g
  }, [])

  return (
    <group>
      <lineSegments geometry={gridGeom}>
        <lineBasicMaterial color="#0d9488" transparent opacity={0.15} />
      </lineSegments>
      {layout.map((b, i) => {
        const weather = getWeatherForScroll(scrollProgress, b.districtId)
        // Static activity/height — no up-down growth animation
        const activity = b.deliveryActivity
        const height = 0.5 + activity * 3.2
        const wx = 0.85 + seeded(i + 10) * 0.6
        const wz = 0.85 + seeded(i + 11) * 0.6
        const px = b.gridX + (seeded(i + 20) - 0.5) * 1.2
        const pz = b.gridZ + (seeded(i + 21) - 0.5) * 1.2
        const pos: [number, number, number] = [px, height / 2, pz]
        const color = weatherToColor(weather, b.temperature)
        const emissive = activity > 0.7 ? '#0d9488' : '#000000'
        const emissiveIntensity = activity > 0.7 ? 0.1 : 0
        const showDataStrip = activity > 0.55
        return (
          <group key={i} position={pos}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[wx, height, wz]} />
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={emissiveIntensity}
                metalness={0.25}
                roughness={0.82}
              />
            </mesh>
            {showDataStrip && (
              <mesh position={[0, height * 0.15, wz / 2 + 0.01]} rotation={[0, 0, 0]}>
                <planeGeometry args={[wx * 0.7, height * 0.12]} />
                <meshBasicMaterial color="#0d9488" transparent opacity={0.5} />
              </mesh>
            )}
            <WeatherOnRoof weather={weather} height={height} index={i} />
          </group>
        )
      })}
      <WeatherParticles scrollProgress={scrollProgress} />
    </group>
  )
}

function weatherToColor(weather: WeatherType, temp: number): string {
  switch (weather) {
    case 'sunny':
      return temp > 0.5 ? '#f5e6d3' : '#e8e4df'
    case 'rain':
      return '#b8c5d4'
    case 'snow':
      return '#e2e8ef'
    case 'fog':
      return '#c9c6c1'
    case 'cloudy':
      return '#d4d1cc'
    default:
      return '#d6d3d1'
  }
}

function WeatherOnRoof({ weather, height, index }: { weather: WeatherType; height: number; index: number }) {
  const y = height / 2 + 0.02
  if (weather === 'sunny') {
    return (
      <group position={[0, y, 0]}>
        <mesh>
          <circleGeometry args={[0.12, 16]} />
          <meshBasicMaterial color="#fcd34d" />
        </mesh>
      </group>
    )
  }
  if (weather === 'cloudy') {
    return (
      <group position={[0, y, 0]} scale={[0.2, 0.08, 0.15]}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      </group>
    )
  }
  if (weather === 'rain') {
    return (
      <group position={[0, y, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.08, 0, 0]}>
            <boxGeometry args={[0.02, 0.06, 0.02]} />
            <meshBasicMaterial color="#64748b" transparent opacity={0.8} />
          </mesh>
        ))}
      </group>
    )
  }
  if (weather === 'snow') {
    return (
      <group position={[0, y, 0]}>
        <mesh>
          <boxGeometry args={[0.15, 0.04, 0.15]} />
          <meshBasicMaterial color="#f1f5f9" />
        </mesh>
      </group>
    )
  }
  if (weather === 'fog') {
    return (
      <group position={[0, y + 0.03, 0]}>
        <mesh>
          <planeGeometry args={[0.2, 0.1]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.4} />
        </mesh>
      </group>
    )
  }
  return null
}

function WeatherParticles({ scrollProgress }: { scrollProgress: number }) {
  const count = 120
  const meshRef = useRef<THREE.Points>(null)
  const weather = getWeatherForScroll(scrollProgress, 0)
  const isRain = weather === 'rain'
  const isSnow = weather === 'snow'

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = Math.random() * 35
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  useFrame(() => {
    if (!meshRef.current || (!isRain && !isSnow)) return
    const pos = geom.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= (isSnow ? 0.08 : 0.25) * 0.016
      if (pos[i * 3 + 1] < -2) pos[i * 3 + 1] += 37
    }
    geom.attributes.position.needsUpdate = true
  })

  if (!isRain && !isSnow) return null
  return (
    <points ref={meshRef} geometry={geom}>
      <pointsMaterial
        size={isSnow ? 0.15 : 0.06}
        color={isSnow ? '#f1f5f9' : '#94a3b8'}
        transparent
        opacity={isSnow ? 0.6 : 0.5}
        sizeAttenuation
      />
    </points>
  )
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#f5f5f4" metalness={0.1} roughness={0.95} />
    </mesh>
  )
}
