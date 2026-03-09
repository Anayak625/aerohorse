/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useEffect, useMemo, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Sparkles, Html, RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useWindowTexture } from '../utils/useWindowTexture'

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

const DRONE_GLTF_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/drone/scene.gltf'
const LOGO_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/aerohorse-logo.png'
const TRUCK_TARGET_SIZE = 1.2
const JOURNEY_TRUCK_START = 0.05 // start coming in right away so it feels continuous from previous section
const JOURNEY_TRUCK_END = 0.65
const TRUCK_START_X = -20 // start further left so it flies in
const TRUCK_END_X = 3
const PARCEL_BACK_OFFSET = 0.1 // 10px back (in world units)
// Parcel stays on truck; at end it goes up then down like a projectile
const DROP_START = 0.65      // when truck reaches end, parcel is "thrown"
const DROP_FALL_END = 0.80   // projectile lands on ground
// Parcel height 0.1 → center 0.05 so bottom sits at y=0 on the surface (not sinking through)
const PARCEL_GROUND_Y = 0.3
const PARCEL_ARC_HEIGHT = 1.3 // peak height of projectile arc (up then down)
const PARCEL_FRONT_OFFSET_Z = 1.8 // move toward camera when dropped so user can see it

const CAMERA_DISTANCE_MIN = 5
const CAMERA_DISTANCE_MAX = 14

// Cinematic view when parcel lands: zoom into parcel, lower angle
const CINEMATIC_START = 0.78   // start blending to cinematic as parcel lands
const CINEMATIC_END = 0.88    // full cinematic by here
const CINEMATIC_DISTANCE = 5.5
const CINEMATIC_POLAR = Math.PI / 2.4  // slightly lower angle for dramatic hero shot
const PARCEL_LANDING_TARGET = new THREE.Vector3(
  TRUCK_END_X - PARCEL_BACK_OFFSET,
  PARCEL_GROUND_Y + 0.1,
  0 + PARCEL_FRONT_OFFSET_Z
)

useGLTF.preload(DRONE_GLTF_URL)

function ScrollZoom({ scrollProgress, controlsRef }: { scrollProgress: number; controlsRef: React.RefObject<any> }) {
  const { camera } = useThree()
  const defaultTarget = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0))
  const spherical = useMemo(() => new THREE.Spherical(), [])
  const vec = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const controls = controlsRef.current
    if (!controls) return
    const t = Math.max(0, Math.min(1, scrollProgress))

    // Blend into cinematic view when parcel has landed
    const cinematicBlend =
      t < CINEMATIC_START ? 0 : t >= CINEMATIC_END ? 1 : (t - CINEMATIC_START) / (CINEMATIC_END - CINEMATIC_START)
    const smoothBlend = cinematicBlend * cinematicBlend * (3 - 2 * cinematicBlend)

    currentTarget.current.copy(defaultTarget).lerp(PARCEL_LANDING_TARGET, smoothBlend)
    const target = currentTarget.current
    const distance =
      CAMERA_DISTANCE_MIN +
      t * (CAMERA_DISTANCE_MAX - CAMERA_DISTANCE_MIN) * (1 - smoothBlend) +
      CINEMATIC_DISTANCE * smoothBlend
    const polarAngle = Math.PI / 2.2 - (Math.PI / 2.2 - CINEMATIC_POLAR) * smoothBlend

    controls.target.copy(target)
    spherical.setFromVector3(camera.position.clone().sub(controls.target))
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

  useEffect(() => {
    camera.position.set(0, 4, 8)
    if (controlsRef.current) {
      controlsRef.current.update()
    }
  }, [])

  return (
    <>
      <ScrollZoom scrollProgress={scrollProgress} controlsRef={controlsRef} />
      <color attach="background" args={['#fafaf9']} />
      <fog attach="fog" args={['#fafaf9', 20, 60]} />

      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 12, 5]} intensity={1.5} color="#fffbeb" />
      <pointLight position={[0, 5, 2]} color="#14b8a6" intensity={3} distance={25} />
      <pointLight position={[4, 3, 1]} color="#94a3b8" intensity={2.5} distance={20} />
      <pointLight position={[-3, 2, 0]} color="#a8a29e" intensity={2} distance={15} />

      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        enableRotate={!isSmallDevice}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={CAMERA_DISTANCE_MIN}
        maxDistance={CAMERA_DISTANCE_MAX}
      />

      {/* City Buildings - Half Planned City */}
      <CityBlock />

      {/* Drone + parcel delivery at ~50% scroll */}
      <JourneyDrone scrollProgress={scrollProgress} />

      <GridFloor />
    </>
  )
}

function JourneyDrone({ scrollProgress }: { scrollProgress: number }) {
  const { scene } = useGLTF(DRONE_GLTF_URL)
  const wingsRef = useRef<THREE.Object3D[]>([])

  const { clonedScene, scale, baseOffset } = useMemo(() => {
    const clone = scene.clone()
    wingsRef.current = []

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true
          ; (child as THREE.Mesh).receiveShadow = true
      }
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
    const s = TRUCK_TARGET_SIZE / maxDim
    return {
      clonedScene: clone,
      scale: s,
      baseOffset: { x: -center.x * s, y: -center.y * s, z: center.z * s },
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
  const posZ = baseOffset.z

  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const currentTime = state.clock.elapsedTime

    // Spin propellers
    wingsRef.current.forEach((wing, i) => {
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
      <DeliveryPod scrollProgress={scrollProgress} x={TRUCK_END_X - PARCEL_BACK_OFFSET} z={posZ + PARCEL_FRONT_OFFSET_Z} />
      <Parcel scrollProgress={scrollProgress} truckX={posX} truckY={posY} truckZ={posZ} droneScale={scale} />
    </>
  )
}

function DeliveryPod({
  scrollProgress,
  x,
  z
}: {
  scrollProgress: number,
  x: number,
  z: number
}) {
  const ref = useRef<THREE.Group>(null)

  // Activate when parcel is dropping or has landed
  const isActivated = scrollProgress >= DROP_START

  const ringRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    // idle pulse is subtle, activated pulse is stronger
    const pulse = isActivated ? 0.8 + Math.sin(state.clock.elapsedTime * 6) * 0.2 : 0.4
    if (ringRef.current?.material) {
      ; (ringRef.current.material as THREE.MeshBasicMaterial).opacity = pulse
    }
    if (glowRef.current?.material) {
      ; (glowRef.current.material as THREE.MeshBasicMaterial).opacity = isActivated ? 1 : 0.3
    }
  })

  return (
    <group ref={ref} position={[x, 0, z]}>
      {/* Base */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 0.15, 32]} />
        <meshStandardMaterial color="#57534e" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Dome */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0d9488" transparent opacity={isActivated ? 0.4 : 0.15} metalness={0.9} roughness={0.1} />
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

      <pointLight position={[0, 0.4, 0]} color="#0d9488" intensity={isActivated ? 3 : 1} distance={4} />
    </group>
  )
}

function Parcel({
  scrollProgress,
  truckX,
  truckY,
  truckZ,
  droneScale = 1,
}: {
  scrollProgress: number
  truckX: number
  truckY: number
  truckZ: number
  droneScale?: number
}) {
  const logoTexture = useTexture(LOGO_URL)
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
    const d = PARCEL_GROUND_Y - onTruckY
    const arcA = 2 * d - 4 * PARCEL_ARC_HEIGHT
    const arcB = 4 * PARCEL_ARC_HEIGHT + d
    x = endX
    z = truckZ + fallEased * PARCEL_FRONT_OFFSET_Z
    y = arcA * fallEased * fallEased + arcB * fallEased + onTruckY

    // Tumbling rotation during drop
    rotationX = fallT * Math.PI * 2.5
    rotationZ = fallT * Math.PI * 1.2

    // Slight scale pulse during flight
    scale = 1 + Math.sin(fallT * Math.PI) * 0.08
  } else {
    // Rest on ground, in front of truck for visibility
    x = endX
    z = truckZ + PARCEL_FRONT_OFFSET_Z

    // Bounce effect after landing
    const landT = Math.min(1, (scrollProgress - DROP_FALL_END) / 0.08)
    const bounceDecay = Math.exp(-landT * 6)
    bounceY = Math.sin(landT * Math.PI * 3) * 0.15 * bounceDecay

    // Squash and stretch on bounce
    const squashT = Math.sin(landT * Math.PI * 3) * bounceDecay
    scale = 1 + squashT * 0.1

    y = PARCEL_GROUND_Y + bounceY
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
          <RoundedBox
            args={[boxWidth, boxHeight, boxDepth]}
            radius={0.015}
            smoothness={4}
            castShadow
            receiveShadow
          >
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

      {/* Trail effect during drop */}
      {isDroppingPhase && (
        <Sparkles
          count={10}
          scale={0.5}
          size={0.8}
          speed={1.5}
          color="#f97316"
          opacity={0.6}
        />
      )}

      {/* Landing celebration: ripple + sparkles + "Delivered" pop */}
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

  // Sparkles burst immediately then fade
  const sparkleOpacity = landProgress < 0.5
    ? Math.min(1, landProgress / 0.1)
    : Math.max(0, 1 - (landProgress - 0.5) / 0.5)

  // Rising particles effect
  const particleRise = Math.min(1, landProgress / 0.6)

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

      {/* Burst sparkles - orange */}
      <Sparkles
        count={35}
        scale={1.5 + particleRise * 0.5}
        size={2}
        speed={0.8}
        color="#f97316"
        opacity={sparkleOpacity * 0.9}
      />

      {/* Secondary sparkles - teal */}
      <Sparkles
        count={22}
        scale={2 + particleRise * 0.8}
        size={1.5}
        speed={0.5}
        color="#0d9488"
        opacity={sparkleOpacity * 0.7}
      />

      {/* Golden accent sparkles */}
      <Sparkles
        count={14}
        scale={1.2}
        size={1.8}
        speed={0.3}
        color="#fcd34d"
        opacity={sparkleOpacity * 0.6}
      />

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
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '13px',
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

function CityBlock() {
  const windowTex = useWindowTexture({
    width: 256,
    height: 512,
    rows: 40,
    cols: 10,
    litProbability: 0.15,
  })

  const BuildingMaterial = ({ color, emissive = true }: { color: string, emissive?: boolean }) => (
    <meshStandardMaterial
      color={color}
      map={windowTex}
      emissiveMap={windowTex}
      emissive={emissive ? '#5eead4' : '#000000'}
      emissiveIntensity={emissive ? 0.3 : 0}
      metalness={0.6}
      roughness={0.3}
    />
  )

  return (
    <group position={[4, 0, 0]}>
      {/* Tallest building - 2 tiers */}
      <group position={[2, 0, -2.5]}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[1.2, 3, 1]} />
          <BuildingMaterial color="#d6d3d1" />
        </mesh>
        <mesh position={[0, 3.5, 0]}>
          <boxGeometry args={[0.9, 1, 0.75]} />
          <BuildingMaterial color="#d6d3d1" />
        </mesh>
      </group>

      {/* Medium building - 2 tiers */}
      <group position={[0, 0, -2]}>
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[1, 2.5, 1]} />
          <BuildingMaterial color="#e7e5e4" />
        </mesh>
        <mesh position={[0, 2.75, 0]}>
          <boxGeometry args={[0.7, 0.5, 0.7]} />
          <BuildingMaterial color="#e7e5e4" />
        </mesh>
      </group>

      <mesh position={[4, 1.2, -2]}>
        <boxGeometry args={[1, 2.4, 0.8]} />
        <BuildingMaterial color="#e7e5e4" />
      </mesh>

      <mesh position={[1, 1.8, -3.5]}>
        <boxGeometry args={[0.9, 3.6, 1]} />
        <BuildingMaterial color="#d6d3d1" emissive={false} />
      </mesh>

      {/* Shorter foreground buildings */}
      <mesh position={[0.5, 0.6, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <BuildingMaterial color="#e7e5e4" />
      </mesh>

      <mesh position={[2.5, 0.5, 0.5]}>
        <boxGeometry args={[1, 1, 0.9]} />
        <BuildingMaterial color="#d6d3d1" />
      </mesh>

      <mesh position={[3.5, 0.4, -0.5]}>
        <boxGeometry args={[0.7, 0.8, 0.7]} />
        <BuildingMaterial color="#e7e5e4" />
      </mesh>
      {/* Hand-placed Trees with wind sway animation and layered pine look */}
      <AnimatedTree position={[1.5, 0, -1.2]} scale={1.2} phase={0} />
      <AnimatedTree position={[3, 0, -1]} scale={1} phase={2} />
      <AnimatedTree position={[-0.5, 0, -1.5]} scale={1.4} phase={4} />

      {/* A few extra background trees for density */}
      <AnimatedTree position={[2, 0, -3.5]} scale={1.1} phase={1} />
      <AnimatedTree position={[-1, 0, -2.5]} scale={0.9} phase={3} />
    </group>
  )
}

function AnimatedTree({ position, scale = 1, phase = 0 }: { position: [number, number, number], scale?: number, phase?: number }) {
  const leavesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!leavesRef.current) return
    const t = state.clock.elapsedTime
    // Subtle wind rotation on the foliage group
    const swayX = Math.sin(t * 1.5 + phase) * 0.08
    const swayZ = Math.cos(t * 1.2 + phase) * 0.08
    leavesRef.current.rotation.set(swayX, 0, swayZ)
  })

  // Height of the trunk so leaves pivot at the top of it
  const trunkHeight = 0.5 * scale

  return (
    <group position={position}>
      {/* Trunk anchored at bottom */}
      <mesh position={[0, trunkHeight / 2, 0]}>
        <cylinderGeometry args={[0.06 * scale, 0.08 * scale, trunkHeight, 16]} />
        <meshStandardMaterial color="#57534e" roughness={0.9} />
      </mesh>

      {/* Leaves Group pivoted at top of trunk */}
      <group ref={leavesRef} position={[0, trunkHeight, 0]}>
        {/* Bottom layer */}
        <mesh position={[0, 0.4 * scale, 0]}>
          <coneGeometry args={[0.5 * scale, 1.0 * scale, 16]} />
          <meshStandardMaterial color="#4d7c0f" roughness={0.8} />
        </mesh>
        {/* Middle layer */}
        <mesh position={[0, 0.8 * scale, 0]}>
          <coneGeometry args={[0.4 * scale, 0.8 * scale, 16]} />
          <meshStandardMaterial color="#65a30d" roughness={0.8} />
        </mesh>
        {/* Top layer */}
        <mesh position={[0, 1.1 * scale, 0]}>
          <coneGeometry args={[0.3 * scale, 0.6 * scale, 16]} />
          <meshStandardMaterial color="#84cc16" roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

function GridFloor() {
  const gridRef = useRef<THREE.LineSegments>(null)

  const [verts, indices] = useMemo(() => {
    const size = 30
    const step = 2
    const points: number[] = []
    const idx: number[] = []
    let i = 0
    for (let x = -size; x <= size; x += step) {
      points.push(x, 0.015, -size, x, 0.015, size)
      idx.push(i, i + 1)
      i += 2
      points.push(-size, 0.015, x, size, 0.015, x)
      idx.push(i, i + 1)
      i += 2
    }
    return [new Float32Array(points), new Uint16Array(idx)]
  }, [])

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    g.setIndex(new THREE.BufferAttribute(indices, 1))
    return g
  }, [verts, indices])

  return (
    <group>
      {/* Base ground layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#fafaf9" metalness={0.1} roughness={0.95} />
      </mesh>

      {/* City Block paved foundation beneath buildings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.005, -1.5]}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
      </mesh>

      <lineSegments ref={gridRef} geometry={geom}>
        <lineBasicMaterial color="#0d9488" transparent opacity={0.12} />
      </lineSegments>
    </group>
  )
}
