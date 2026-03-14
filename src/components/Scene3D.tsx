/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useMemo, useState, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles, useGLTF, RoundedBox, useTexture } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useDevicePerformance } from '../hooks/useDevicePerformance'

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

const DRONE_GLTF_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/drone/scene.gltf'
const DRONE_TARGET_SIZE = 3
useGLTF.preload(DRONE_GLTF_URL)

const CROWD_GLTF_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/crowd-circle.gltf'
useGLTF.preload(CROWD_GLTF_URL)

const CITY_GLTF_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/city/scene.gltf'
useGLTF.preload(CITY_GLTF_URL)

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
  })

  return (
    <>
      <color attach="background" args={['#7f786f']} />
      <fog attach="fog" args={['#7f786f', 15, 50]} />

      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#e8f4f8', '#44403c', 0.5]} />
      <directionalLight position={[8, 15, 8]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 8, 4]} color="#0d9488" intensity={2} distance={25} />

      <group ref={groupRef}>
        {!performance.isLowEnd && (
          <Sparkles count={25} scale={35} size={2} speed={0.3} opacity={0.3} color="#0d9488" />
        )}

        <GroundPlane />
        <Suspense fallback={null}>
          <CityModel />
        </Suspense>
        <Suspense fallback={null}>
          <DroneAnimated
            scrollProgress={scrollProgress}
            onHoverChange={onHoverChange}
            onDroneClick={onDroneClick}
            focusTargetRef={focusTarget}
          />
        </Suspense>
        <Pods onHoverChange={onHoverChange} />
        <DroppingParcel scrollProgress={scrollProgress} />
        <TrafficRings isLowEnd={performance.isLowEnd} />
        {!performance.isLowEnd && <DistantAirTraffic />}
      </group>

      {!performance.isLowEnd && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.9} intensity={0.5} mipmapBlur />
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

// Pod base radius ~0.8, also used to size the in‑pod crowd circle
const POD_RADIUS = 0.8

// Same parcel as drone's payload: drops from drone position (15% scroll) to pod top (60% scroll)
const DRONE_SCALE = 3 // match DroneAnimated baseScale so parcel is same size
const DROP_START_SCROLL = 0.15
const DROP_END_SCROLL = 0.6
// Pod ring top y=0.18 + 0.4 lift; parcel height 0.1*DRONE_SCALE → center at lifted pod ring top + half parcel height
const POD_LIFT = 0.4
const POD_TOP_Y = POD_LIFT + 0.18 + (0.1 * DRONE_SCALE) / 2
// Drone at (0, 5.3, 1), scale 3, package local (0, -0.17, -0.02) → world start
const DROP_START = { x: 0, y: 5.3 + DRONE_SCALE * (-0.17), z: 1 + DRONE_SCALE * (-0.02) }
const DROP_END = { x: 0, y: POD_TOP_Y, z: 0 }

const LOGO_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/aerohorse-logo.png'

function DroppingParcel({ scrollProgress }: { scrollProgress: number }) {
  const visible = scrollProgress >= DROP_START_SCROLL && scrollProgress <= DROP_END_SCROLL
  const logoTexture = useTexture(LOGO_URL)

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

      {/* Crowd circle inside pod */}
      <CrowdCircleInPod />

      <pointLight position={[0, 0.4, 0]} color="#0d9488" intensity={hovered ? 2.2 : 1.5} distance={3} />
    </group>
  )
}

function CrowdCircleInPod() {
  const { scene } = useGLTF(CROWD_GLTF_URL)

  const { clonedScene, scale, offset } = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        ; (child as THREE.Mesh).castShadow = false
          ; (child as THREE.Mesh).receiveShadow = false
      }
    })

    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const targetDiameter = POD_RADIUS * 5
    const s = targetDiameter / maxDim

    return {
      clonedScene: clone,
      scale: s,
      offset: {
        x: -center.x * s,
        y: -center.y * s,
        z: -center.z * s,
      },
    }
  }, [scene])

  const crowdY = 0.55

  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const pulse = 1 + Math.sin(t * 1.6) * 0.04
    groupRef.current.scale.set(pulse, 1, pulse)
    groupRef.current.rotation.y = Math.sin(t * 0.7) * 0.25
  })

  return (
    <group ref={groupRef} position={[0 + offset.x, crowdY + offset.y, 0 + offset.z]}>
      <primitive object={clonedScene} scale={scale} />
    </group>
  )
}

// ─── City GLTF Model ───────────────────────────────────────────────────────
// Uses the GLTF scene directly (no clone) — safe because this is the only consumer.
// Shadows disabled: the model uses KHR_materials_unlit and shadows on a ~11M vertex
// city mesh are prohibitively expensive.

// Shift the auto-centred city so its open plaza square sits at the pod's world position (0,0).
// Tweak X / Z if the plaza drifts; positive X = right, positive Z = toward viewer.
const CITY_PLAZA_OFFSET = { x: 2, z: -4 }

function CityModel() {
  const { scene } = useGLTF(CITY_GLTF_URL)

  // Compute scale + floor-alignment once; never re-run (scene ref is stable).
  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const TARGET_SIZE = 44
    const s = TARGET_SIZE / maxDim
    return {
      scale: s,
      // Center XZ, floor to Y=0, then apply plaza nudge
      offset: [
        -center.x * s + CITY_PLAZA_OFFSET.x,
        -box.min.y * s,
        -center.z * s + CITY_PLAZA_OFFSET.z,
      ] as [number, number, number],
    }
  }, [scene])

  return (
    <group position={offset}>
      <primitive object={scene} scale={scale} />
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

function GroundPlane() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshBasicMaterial color="#7f786f" />
      </mesh>
      {/* Outer fade ring to blend with background fog */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[25, 60, 48]} />
        <meshBasicMaterial color="#7f786f" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}
