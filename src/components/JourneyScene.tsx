/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Sparkles, Html } from '@react-three/drei'
import * as THREE from 'three'

const TRUCK_GLTF_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/truck/scene.gltf'
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

const CAMERA_DISTANCE_MIN = 8
const CAMERA_DISTANCE_MAX = 22

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
  const t = scrollProgress <= JOURNEY_TRUCK_START
    ? 0
    : scrollProgress >= JOURNEY_TRUCK_END
      ? 1
      : (scrollProgress - JOURNEY_TRUCK_START) / (JOURNEY_TRUCK_END - JOURNEY_TRUCK_START)
  const onTruckY = truckY + 0.4
  const endX = TRUCK_END_X - PARCEL_BACK_OFFSET

  let x: number, y: number, z: number
  if (scrollProgress < DROP_START) {
    // Stay on truck
    x = truckX - PARCEL_BACK_OFFSET
    y = onTruckY
    z = truckZ
  } else if (scrollProgress < DROP_FALL_END) {
    // Projectile: up then down (parabolic arc), and move to front of view
    const fallT = (scrollProgress - DROP_START) / (DROP_FALL_END - DROP_START)
    const fallEased = fallT * fallT * (3 - 2 * fallT) // smooth 0..1
    const d = PARCEL_GROUND_Y - onTruckY
    const arcA = 2 * d - 4 * PARCEL_ARC_HEIGHT
    const arcB = 4 * PARCEL_ARC_HEIGHT + d
    x = endX
    z = truckZ + fallEased * PARCEL_FRONT_OFFSET_Z
    y = arcA * fallEased * fallEased + arcB * fallEased + onTruckY
  } else {
    // Rest on ground, in front of truck for visibility
    x = endX
    y = PARCEL_GROUND_Y
    z = truckZ + PARCEL_FRONT_OFFSET_Z
  }

  const visible = t > 0.05
  const landed = scrollProgress >= DROP_FALL_END
  const landProgress = landed ? Math.min(1, (scrollProgress - DROP_FALL_END) / (1 - DROP_FALL_END)) : 0

  if (!visible) return null
  return (
    <group position={[x, y, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.14, 0.1, 0.16]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      <mesh position={[0, 0, 0]} scale={[1.02, 1.02, 0.2]}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshBasicMaterial color="#d97706" />
      </mesh>
      {[[-0.03, 0], [0.03, 0], [0, -0.03], [0, 0.03]].map((offset, idx) => (
        <mesh key={idx} position={[offset[0], 0.06, offset[1]]}>
          <cylinderGeometry args={[0.001, 0.001, 0.06, 4]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      ))}

      {/* Landing celebration: ripple + sparkles + "Delivered" pop */}
      {landed && (
        <LandingCelebration landProgress={landProgress} />
      )}
    </group>
  )
}

function LandingCelebration({ landProgress }: { landProgress: number }) {
  // Impact ripple: expands and fades in first 40% of land progress
  const rippleT = Math.min(1, landProgress / 0.4)
  const rippleScale = rippleT * 2.5
  const rippleOpacity = (1 - rippleT) * 0.6
  // Badge pop: elastic feel between 15% and 50% of land progress
  const badgeT = landProgress < 0.15 ? 0 : Math.min(1, (landProgress - 0.15) / 0.35)
  const badgeScale = badgeT < 1 ? 1 - Math.pow(1 - badgeT, 3) : 1
  const badgeOvershoot = badgeT < 1 ? 1 + (1 - Math.pow(1 - badgeT, 2)) * 0.25 : 1
  const badgeOpacity = Math.min(1, badgeT * 2)
  // Sparkles fade in over first 30%
  const sparkleOpacity = Math.min(1, landProgress / 0.3) * 0.8

  return (
    <group>
      {/* Ground ripple — ring that expands and fades */}
      {rippleOpacity > 0.01 && (
        <mesh
          position={[0, -0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[rippleScale, 1, rippleScale]}
        >
          <ringGeometry args={[0.2, 0.5, 32]} />
          <meshBasicMaterial
            color="#0d9488"
            transparent
            opacity={rippleOpacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Sparkles around the parcel */}
      <Sparkles
        count={40}
        scale={1.2}
        size={1.5}
        speed={0.4}
        color="#f97316"
        opacity={sparkleOpacity}
      />
      <Sparkles
        count={25}
        scale={1.5}
        size={1}
        speed={0.2}
        color="#0d9488"
        opacity={sparkleOpacity * 0.7}
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
