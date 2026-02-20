/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Sparkles, Html, RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'

const TRUCK_GLTF_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/truck/scene.gltf'
const LOGO_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/aerohorse-logo.png'
const TRUCK_TARGET_SIZE = 1.2
const JOURNEY_TRUCK_START = 0.4
const JOURNEY_TRUCK_END = 0.65
const TRUCK_START_X = -14
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

useGLTF.preload(TRUCK_GLTF_URL)

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
      
      <ambientLight intensity={1} />
      <directionalLight position={[5, 12, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 5, 2]} color="#0d9488" intensity={3} distance={25} />
      <pointLight position={[4, 3, 1]} color="#64748b" intensity={2} distance={20} />
      <pointLight position={[-3, 2, 0]} color="#78716c" intensity={1.5} distance={15} />

      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={CAMERA_DISTANCE_MIN}
        maxDistance={CAMERA_DISTANCE_MAX}
      />

      {/* City Buildings - Half Planned City */}
      <CityBlock />

      {/* Truck + parcel delivery at ~50% scroll */}
      <JourneyTruck scrollProgress={scrollProgress} />

      {/* Ground with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#f5f5f4" />
      </mesh>
      <GridFloor />
    </>
  )
}

function JourneyTruck({ scrollProgress }: { scrollProgress: number }) {
  const { scene } = useGLTF(TRUCK_GLTF_URL)
  const { clonedScene, scale, baseOffset } = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true
        ;(child as THREE.Mesh).receiveShadow = true
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
      baseOffset: { x: -center.x * s, y: -box.min.y * s, z: center.z * s },
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
  const posY = baseOffset.y
  const posZ = baseOffset.z

  return (
    <>
      {scrollProgress >= JOURNEY_TRUCK_START && (
        <group
          position={[posX, posY, posZ]}
          scale={[scale, scale, scale]}
          rotation={[0, 0, 0]}
        >
          <primitive object={clonedScene} />
        </group>
      )}
      <Parcel scrollProgress={scrollProgress} truckX={truckX} truckY={baseOffset.y} truckZ={posZ} />
    </>
  )
}

function Parcel({
  scrollProgress,
  truckX,
  truckY,
  truckZ,
}: {
  scrollProgress: number
  truckX: number
  truckY: number
  truckZ: number
}) {
  const logoTexture = useTexture(LOGO_URL)
  const t = scrollProgress <= JOURNEY_TRUCK_START
    ? 0
    : scrollProgress >= JOURNEY_TRUCK_END
      ? 1
      : (scrollProgress - JOURNEY_TRUCK_START) / (JOURNEY_TRUCK_END - JOURNEY_TRUCK_START)
  const onTruckY = truckY + 0.4
  const endX = TRUCK_END_X - PARCEL_BACK_OFFSET

  let x: number, y: number, z: number
  let rotationX = 0, rotationZ = 0
  let bounceY = 0
  let scale = 1

  const isDroppingPhase = scrollProgress >= DROP_START && scrollProgress < DROP_FALL_END
  const landed = scrollProgress >= DROP_FALL_END
  
  if (scrollProgress < DROP_START) {
    // Stay on truck
    x = truckX - PARCEL_BACK_OFFSET
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

      {/* Trail effect during drop */}
      {isDroppingPhase && (
        <Sparkles
          count={15}
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
        count={60}
        scale={1.5 + particleRise * 0.5}
        size={2}
        speed={0.8}
        color="#f97316"
        opacity={sparkleOpacity * 0.9}
      />
      
      {/* Secondary sparkles - teal */}
      <Sparkles
        count={40}
        scale={2 + particleRise * 0.8}
        size={1.5}
        speed={0.5}
        color="#0d9488"
        opacity={sparkleOpacity * 0.7}
      />
      
      {/* Golden accent sparkles */}
      <Sparkles
        count={25}
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
  return (
    <group position={[4, 0, 0]}>
      {/* Minimal buildings - right side */}
      <mesh position={[0, 1.5, -2]}>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="#e7e5e4" />
      </mesh>
      
      <mesh position={[2, 2, -2.5]}>
        <boxGeometry args={[1.2, 4, 1]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
      
      <mesh position={[4, 1.2, -2]}>
        <boxGeometry args={[1, 2.4, 0.8]} />
        <meshStandardMaterial color="#e7e5e4" />
      </mesh>
      
      <mesh position={[1, 1.8, -3.5]}>
        <boxGeometry args={[0.9, 3.6, 1]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
      
      {/* Shorter foreground buildings */}
      <mesh position={[0.5, 0.6, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshStandardMaterial color="#e7e5e4" transparent opacity={0.6} />
      </mesh>
      
      <mesh position={[2.5, 0.5, 0.5]}>
        <boxGeometry args={[1, 1, 0.9]} />
        <meshStandardMaterial color="#d6d3d1" transparent opacity={0.5} />
      </mesh>
      
      <mesh position={[3.5, 0.4, -0.5]}>
        <boxGeometry args={[0.7, 0.8, 0.7]} />
        <meshStandardMaterial color="#e7e5e4" transparent opacity={0.4} />
      </mesh>
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
      points.push(x, 0.01, -size, x, 0.01, size)
      idx.push(i, i + 1)
      i += 2
      points.push(-size, 0.01, x, size, 0.01, x)
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
    <lineSegments ref={gridRef} geometry={geom}>
      <lineBasicMaterial color="#0d9488" transparent opacity={0.12} />
    </lineSegments>
  )
}
