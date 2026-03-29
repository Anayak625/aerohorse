/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useEffect, useMemo, useState, Suspense } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing'
import { OrbitControls, useGLTF, Html, RoundedBox, useTexture, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useDevicePerformance } from '../hooks/useDevicePerformance'
import { DRONE_GLTF_URL, AEROHORSE_LOGO_URL } from '../constants/webglAssets'
import { HeroCityModel, CitySkyGradient, CityGroundPlane, CITY_FOG_COLOR } from './HeroCity'
import { PodGLTFModel, getJourneyParcelLandWorldY } from './PodModel'

/** Same framing as Scene3D at scroll 0: camera (0, 3.4, 12.5), lookAt (0, 1.2, 0). */
const HERO_FRAMING_TARGET = new THREE.Vector3(0, 1.2, 0)
const HERO_CAM_OFFSET = new THREE.Vector3(0, 2.2, 12.5)
const HERO_FRAMING_SPHERICAL = new THREE.Spherical().setFromVector3(HERO_CAM_OFFSET)
const HERO_CAMERA_DISTANCE = HERO_FRAMING_SPHERICAL.radius
const HERO_CAMERA_POLAR = HERO_FRAMING_SPHERICAL.phi

const MOBILE_BREAKPOINT = 768
function useIsSmallDevice() {
  const [isSmall, setSmall] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  )
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    const handler = () => setSmall(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return isSmall
}

const TRUCK_TARGET_SIZE = 1.2
const JOURNEY_TRUCK_START = 0.05 // start coming in right away so it feels continuous from previous section
const JOURNEY_TRUCK_END = 0.65
const TRUCK_START_X = -22 // approach across the shared hero city toward the plaza
const TRUCK_END_X = 0 // same pod anchor as landing hero (plaza origin)
const PARCEL_BACK_OFFSET = 0
/** Pod group Y to match Scene3D `POD_LIFT` */
const JOURNEY_POD_LIFT = 0.4
// Parcel stays on truck; at end it goes up then down like a projectile
const DROP_START = 0.65      // when truck reaches end, parcel is "thrown"
const DROP_FALL_END = 0.80   // projectile lands on ground
// Parcel rest height (world): on top of GLTF pod at plaza
const PARCEL_REST_Y = getJourneyParcelLandWorldY(JOURNEY_POD_LIFT)
const PARCEL_ARC_HEIGHT = 1.3 // peak height of projectile arc (up then down)
/** Delta from drone Z to parcel rest Z (keeps drop landing on plaza when drone flies at z ≈ 1 + baseOffset.z). */
const DEFAULT_PARCEL_Z_LANDING_DELTA = 1.8

const CAMERA_DISTANCE_MAX = 20

// Cinematic view when parcel lands: zoom into parcel, lower angle
const CINEMATIC_START = 0.78   // start blending to cinematic as parcel lands
const CINEMATIC_END = 0.88    // full cinematic by here
const CINEMATIC_DISTANCE = 5.5
const CINEMATIC_POLAR = Math.PI / 2.4  // slightly lower angle for dramatic hero shot

function journeyCinematicSmooth(scrollProgress: number) {
  const t = Math.max(0, Math.min(1, scrollProgress))
  const cinematicBlend =
    t < CINEMATIC_START ? 0 : t >= CINEMATIC_END ? 1 : (t - CINEMATIC_START) / (CINEMATIC_END - CINEMATIC_START)
  return cinematicBlend * cinematicBlend * (3 - 2 * cinematicBlend)
}

function JourneyPostProcessing({
  scrollProgress,
  controlsRef,
}: {
  scrollProgress: number
  controlsRef: React.RefObject<any>
}) {
  const vignetteRef = useRef<any>(null)
  const dofRef = useRef<any>(null)
  const focusVec = useMemo(() => new THREE.Vector3(0, 1.2, 0), [])

  useFrame(() => {
    const t = scrollProgress
    const cine = journeyCinematicSmooth(t)
    const inArc = t >= DROP_START && t < DROP_FALL_END ? (t - DROP_START) / (DROP_FALL_END - DROP_START) : 0
    const arcBoost = Math.sin(inArc * Math.PI) * 0.18

    const ctrl = controlsRef.current
    if (ctrl && dofRef.current?.target) {
      dofRef.current.target.copy(ctrl.target)
    }

    if (vignetteRef.current) {
      vignetteRef.current.darkness = 0.34 + cine * 0.44 + arcBoost * 0.1
      vignetteRef.current.offset = 0.07 + cine * 0.16 + arcBoost * 0.035
    }

    if (dofRef.current) {
      dofRef.current.bokehScale = cine * 3.2 + arcBoost * 1.4
      dofRef.current.focusRange = 2.4 - cine * 1.1
    }
  })

  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.48} luminanceSmoothing={0.9} intensity={0.36} mipmapBlur />
      <DepthOfField
        ref={dofRef}
        focusDistance={0}
        focalLength={0.022}
        focusRange={2.2}
        bokehScale={0}
        target={focusVec}
        height={480}
      />
      <Vignette ref={vignetteRef} eskil={false} offset={0.09} darkness={0.36} />
    </EffectComposer>
  )
}

function ScrollZoom({
  scrollProgress,
  controlsRef,
  landingTarget,
}: {
  scrollProgress: number
  controlsRef: React.RefObject<any>
  landingTarget: THREE.Vector3
}) {
  const { camera } = useThree()
  const defaultTarget = useMemo(() => HERO_FRAMING_TARGET.clone(), [])
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0))
  const sphericalRef = useRef(new THREE.Spherical())
  const vec = useMemo(() => new THREE.Vector3(), [])
  const camRel = useRef(new THREE.Vector3())

  useFrame(() => {
    const controls = controlsRef.current
    if (!controls) return
    const t = Math.max(0, Math.min(1, scrollProgress))

    // Blend into cinematic view when parcel has landed
    const cinematicBlend =
      t < CINEMATIC_START ? 0 : t >= CINEMATIC_END ? 1 : (t - CINEMATIC_START) / (CINEMATIC_END - CINEMATIC_START)
    const smoothBlend = cinematicBlend * cinematicBlend * (3 - 2 * cinematicBlend)

    currentTarget.current.copy(defaultTarget).lerp(landingTarget, smoothBlend)
    const target = currentTarget.current
    const distance =
      HERO_CAMERA_DISTANCE +
      t * (CAMERA_DISTANCE_MAX - HERO_CAMERA_DISTANCE) * (1 - smoothBlend) +
      CINEMATIC_DISTANCE * smoothBlend
    const polarAngle = HERO_CAMERA_POLAR - (HERO_CAMERA_POLAR - CINEMATIC_POLAR) * smoothBlend

    controls.target.copy(target)
    const spherical = sphericalRef.current
    camRel.current.copy(camera.position).sub(controls.target)
    spherical.setFromVector3(camRel.current)
    spherical.radius = distance
    spherical.phi = Math.max(Math.PI / 6, Math.min(Math.PI / 2.2, polarAngle))
    camera.position.copy(controls.target).add(vec.setFromSpherical(spherical))
    camera.lookAt(controls.target)
    controls.update()
    // Re-apply cinematic position after update so it's not overwritten by orbit state
    if (smoothBlend > 0.01) {
      controls.target.copy(target)
      camera.position.copy(controls.target).add(vec.setFromSpherical(spherical))
      camera.lookAt(controls.target)
    }
  })
  return null
}

export default function JourneyScene({ scrollProgress = 0 }: { scrollProgress: number }) {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  const isSmallDevice = useIsSmallDevice()
  const performance = useDevicePerformance()

  const landingTarget = useMemo(
    () => new THREE.Vector3(TRUCK_END_X - PARCEL_BACK_OFFSET, PARCEL_REST_Y + 0.12, 0),
    []
  )

  useEffect(() => {
    camera.position.set(0, 3.4, 12.5)
    if (controlsRef.current) {
      controlsRef.current.update()
    }
  }, [camera])

  return (
    <>
      <ScrollZoom scrollProgress={scrollProgress} controlsRef={controlsRef} landingTarget={landingTarget} />
      <CitySkyGradient />
      <color attach="background" args={['#e2e9f3']} />
      <fog attach="fog" args={[CITY_FOG_COLOR, 16, 78]} />

      <ambientLight intensity={0.52} />
      <hemisphereLight args={['#d2e8f5', '#8f8278', 0.72]} />
      <directionalLight position={[10, 18, 12]} intensity={1.22} color="#fff6eb" />
      <directionalLight position={[-14, 9, -8]} intensity={0.42} color="#b8d4e8" />
      <directionalLight position={[6, 14, -10]} intensity={0.18} color="#fde8c8" />
      <pointLight position={[0, 8, 4]} color="#14b8a6" intensity={1.85} distance={32} decay={2} />
      <pointLight position={[-6, 3, 8]} color="#fcd34d" intensity={0.42} distance={22} decay={2} />

      {!performance.isLowEnd && (
        <Environment preset="dawn" environmentIntensity={0.38} background={false} />
      )}

      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        enableRotate={!isSmallDevice}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={8}
        maxDistance={CAMERA_DISTANCE_MAX + 4}
      />

      <CityGroundPlane />
      <Suspense fallback={null}>
        <HeroCityModel useLitMaterials={!performance.isLowEnd} />
      </Suspense>

      <JourneyDrone scrollProgress={scrollProgress} />

      {!performance.isLowEnd && (
        <JourneyPostProcessing scrollProgress={scrollProgress} controlsRef={controlsRef} />
      )}
    </>
  )
}

function JourneyDrone({ scrollProgress }: { scrollProgress: number }) {
  const { scene } = useGLTF(DRONE_GLTF_URL)

  const { clonedScene, scale, baseOffset, wingNodes } = useMemo(() => {
    const clone = scene.clone()
    const wings: THREE.Object3D[] = []

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = false
          ; (child as THREE.Mesh).receiveShadow = false
      }
      if (/^Wing\d$/.test(child.name)) {
        wings.push(child)
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
      baseOffset: { x: -center.x * s, y: -center.y * s, z: -center.z * s },
      wingNodes: wings,
    }
  }, [scene])

  const t = scrollProgress <= JOURNEY_TRUCK_START
    ? 0
    : scrollProgress >= JOURNEY_TRUCK_END
      ? 1
      : (scrollProgress - JOURNEY_TRUCK_START) / (JOURNEY_TRUCK_END - JOURNEY_TRUCK_START)
  const easedT = t * t * (3 - 2 * t)
  const truckX = TRUCK_START_X + easedT * (TRUCK_END_X - TRUCK_START_X)
  const posX = truckX + baseOffset.x
  const FLIGHT_Y = 2.5
  const posY = FLIGHT_Y
  const posZ = 1 + baseOffset.z
  const parcelZLandingDelta = -posZ

  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const currentTime = state.clock.elapsedTime

    wingNodes.forEach((wing, i) => {
      const direction = i % 2 === 0 ? 1 : -1
      wing.rotation.z += 25 * direction * delta
    })

    // Add slight hover/bob and pitch/roll based on movement
    const bobY = Math.sin(currentTime * 3) * 0.05
    const isMoving = t > 0 && t < 1
    const pitchDemand = isMoving ? 0.15 : 0.05 + Math.cos(currentTime * 1.7) * 0.02
    const rollDemand = Math.sin(currentTime * 0.5) * 0.02

    groupRef.current.position.set(posX, posY + bobY, posZ)
    groupRef.current.rotation.set(pitchDemand, 0, rollDemand)
  })

  return (
    <>
      {scrollProgress >= JOURNEY_TRUCK_START && (
        <group
          ref={groupRef}
          position={[posX, posY, posZ]}
          scale={[scale, scale, scale]}
          rotation={[0, 0, 0]}
        >
          <primitive object={clonedScene} />
        </group>
      )}
      <DeliveryPod
        scrollProgress={scrollProgress}
        x={TRUCK_END_X - PARCEL_BACK_OFFSET}
        z={0}
        liftY={JOURNEY_POD_LIFT}
      />
      <Parcel
        scrollProgress={scrollProgress}
        truckX={posX}
        truckY={posY}
        truckZ={posZ}
        droneScale={scale}
        zLandingDelta={parcelZLandingDelta}
      />
    </>
  )
}

function DeliveryPod({
  scrollProgress,
  x,
  z,
  liftY = 0,
}: {
  scrollProgress: number
  x: number
  z: number
  liftY?: number
}) {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const isActivated = scrollProgress >= DROP_START
  const modelHovered = hovered || isActivated

  return (
    <group
      ref={ref}
      position={[x, liftY, z]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.32, 0]} visible={false}>
        <cylinderGeometry args={[0.85, 0.92, 1.15, 12]} />
      </mesh>
      <PodGLTFModel hovered={modelHovered} />
      <pointLight position={[0, 0.52, 0]} color="#0d9488" intensity={modelHovered ? 2.8 : 1.2} distance={4} />
    </group>
  )
}

function Parcel({
  scrollProgress,
  truckX,
  truckY,
  truckZ,
  droneScale = 1,
  zLandingDelta = DEFAULT_PARCEL_Z_LANDING_DELTA,
}: {
  scrollProgress: number
  truckX: number
  truckY: number
  truckZ: number
  droneScale?: number
  /** World Z delta from drone path to parcel rest (default pulls toward camera). */
  zLandingDelta?: number
}) {
  const logoTexture = useTexture(AEROHORSE_LOGO_URL)
  const bobRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!bobRef.current) return
    if (scrollProgress < DROP_START) {
      // Bob along with the drone while attached
      bobRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.05
    } else {
      bobRef.current.position.y = 0
    }
  })

  const t = scrollProgress <= JOURNEY_TRUCK_START
    ? 0
    : scrollProgress >= JOURNEY_TRUCK_END
      ? 1
      : (scrollProgress - JOURNEY_TRUCK_START) / (JOURNEY_TRUCK_END - JOURNEY_TRUCK_START)

  // Offset to match DroneAnimated payload position (from Scene3D)
  const onTruckY = truckY + droneScale * -0.17
  // Keep the parcel directly under the drone center, don't offset backwards
  const attachedX = truckX
  const endX = TRUCK_END_X - PARCEL_BACK_OFFSET

  let x: number, y: number, z: number
  let rotationX = 0, rotationZ = 0
  let bounceY = 0
  let scale = 1

  const isDroppingPhase = scrollProgress >= DROP_START && scrollProgress < DROP_FALL_END
  const landed = scrollProgress >= DROP_FALL_END

  if (scrollProgress < DROP_START) {
    // Stay on drone
    x = attachedX
    y = onTruckY
    z = truckZ
  } else if (scrollProgress < DROP_FALL_END) {
    // Projectile: up then down (parabolic arc), and move to front of view
    const fallT = (scrollProgress - DROP_START) / (DROP_FALL_END - DROP_START)
    const fallEased = fallT * fallT * (3 - 2 * fallT)
    const d = PARCEL_REST_Y - onTruckY
    const arcA = 2 * d - 4 * PARCEL_ARC_HEIGHT
    const arcB = 4 * PARCEL_ARC_HEIGHT + d
    x = endX
    z = truckZ + fallEased * zLandingDelta
    y = arcA * fallEased * fallEased + arcB * fallEased + onTruckY

    // Tumbling rotation during drop
    rotationX = fallT * Math.PI * 2.5
    rotationZ = fallT * Math.PI * 1.2

    // Slight scale pulse during flight
    scale = 1 + Math.sin(fallT * Math.PI) * 0.08
  } else {
    // Rest on ground, in front of truck for visibility
    x = endX
    z = truckZ + zLandingDelta

    // Bounce effect after landing
    const landT = Math.min(1, (scrollProgress - DROP_FALL_END) / 0.08)
    const bounceDecay = Math.exp(-landT * 6)
    bounceY = Math.sin(landT * Math.PI * 3) * 0.15 * bounceDecay

    // Squash and stretch on bounce
    const squashT = Math.sin(landT * Math.PI * 3) * bounceDecay
    scale = 1 + squashT * 0.1

    y = PARCEL_REST_Y + bounceY
  }

  const visible = t > 0.05
  const landProgress = landed ? Math.min(1, (scrollProgress - DROP_FALL_END) / (1 - DROP_FALL_END)) : 0

  const boxWidth = 0.14
  const boxHeight = 0.1
  const boxDepth = 0.16
  const logoSize = 0.06

  // Glow intensity increases as parcel falls and pulses when landed
  const glowIntensity = isDroppingPhase
    ? 0.3 + ((scrollProgress - DROP_START) / (DROP_FALL_END - DROP_START)) * 0.5
    : landed
      ? 0.6 + Math.sin(landProgress * Math.PI * 4) * 0.2 * (1 - landProgress)
      : 0

  if (!visible) return null
  return (
    <group position={[x, y, z]}>
      <group ref={bobRef}>
        <group rotation={[rotationX, 0, rotationZ]} scale={scale}>
          {/* Main parcel with rounded edges */}
          <RoundedBox args={[boxWidth, boxHeight, boxDepth]} radius={0.015} smoothness={4}>
            <meshStandardMaterial
              color="#f97316"
              emissive="#f97316"
              emissiveIntensity={glowIntensity}
            />
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

          {/* Tape strip on top */}
          <mesh position={[0, boxHeight / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.02, boxDepth * 0.8]} />
            <meshBasicMaterial color="#d97706" />
          </mesh>
        </group>
      </group>

      {/* Landing celebration: ripples + "Delivered" pop */}
      {landed && (
        <LandingCelebration landProgress={landProgress} />
      )}
    </group>
  )
}

function LandingCelebration({ landProgress }: { landProgress: number }) {
  // Multiple ripples with staggered timing for impact effect
  const ripple1T = Math.min(1, landProgress / 0.25)
  const ripple2T = Math.min(1, Math.max(0, (landProgress - 0.08)) / 0.3)
  const ripple3T = Math.min(1, Math.max(0, (landProgress - 0.15)) / 0.35)

  const ripple1Scale = ripple1T * 1.8
  const ripple2Scale = ripple2T * 2.5
  const ripple3Scale = ripple3T * 3.2

  const ripple1Opacity = (1 - ripple1T) * 0.8
  const ripple2Opacity = (1 - ripple2T) * 0.5
  const ripple3Opacity = (1 - ripple3T) * 0.3

  // Badge pop: elastic feel between 10% and 40% of land progress
  const badgeT = landProgress < 0.1 ? 0 : Math.min(1, (landProgress - 0.1) / 0.3)
  const badgeScale = badgeT < 1 ? 1 - Math.pow(1 - badgeT, 3) : 1
  const badgeOvershoot = badgeT < 1 ? 1 + (1 - Math.pow(1 - badgeT, 2)) * 0.35 : 1
  const badgeOpacity = Math.min(1, badgeT * 2.5)

  return (
    <group>
      {/* Ground impact flash */}
      {landProgress < 0.15 && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.4 + landProgress * 2, 32]} />
          <meshBasicMaterial
            color="#fcd34d"
            transparent
            opacity={(1 - landProgress / 0.15) * 0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Primary impact ripple - teal */}
      {ripple1Opacity > 0.01 && (
        <mesh
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[ripple1Scale, 1, ripple1Scale]}
        >
          <ringGeometry args={[0.15, 0.35, 32]} />
          <meshBasicMaterial
            color="#0d9488"
            transparent
            opacity={ripple1Opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Secondary ripple - orange */}
      {ripple2Opacity > 0.01 && (
        <mesh
          position={[0, 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[ripple2Scale, 1, ripple2Scale]}
        >
          <ringGeometry args={[0.2, 0.4, 32]} />
          <meshBasicMaterial
            color="#f97316"
            transparent
            opacity={ripple2Opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Tertiary ripple - teal outer */}
      {ripple3Opacity > 0.01 && (
        <mesh
          position={[0, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[ripple3Scale, 1, ripple3Scale]}
        >
          <ringGeometry args={[0.25, 0.45, 32]} />
          <meshBasicMaterial
            color="#14b8a6"
            transparent
            opacity={ripple3Opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* "Delivered" badge that pops in */}
      <Html
        position={[0, 0.35, 0]}
        center
        distanceFactor={4}
        style={{
          pointerEvents: 'none',
          opacity: badgeOpacity,
          transform: `scale(${badgeScale * badgeOvershoot})`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            color: 'white',
            padding: '6px clamp(10px, 3vw, 14px)',
            borderRadius: '9999px',
            fontSize: 'clamp(10px, 2.75vw, 13px)',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        >
          Delivered ✓
        </div>
      </Html>
    </group>
  )
}
