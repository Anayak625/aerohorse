/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const GRID_SIZE = 25

interface SceneProps {
  mouse?: { normalizedX: number; normalizedY: number }
  scrollProgress?: number
}

export default function Scene3D({ mouse = { normalizedX: 0, normalizedY: 0 }, scrollProgress = 0 }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const targetCamPos = useRef(new THREE.Vector3(0, 5, 12))

  useFrame((state) => {
    const cam = state.camera
    const mouseStrength = 0.25 * (1 - scrollProgress * 0.5)
    
    const baseZ = 12 - scrollProgress * 3
    const baseY = 5 - scrollProgress * 1.5
    
    targetCamPos.current.set(
      mouse.normalizedX * 2.5 * mouseStrength,
      baseY + mouse.normalizedY * 1.2 * mouseStrength,
      baseZ
    )

    cam.position.lerp(targetCamPos.current, 0.08)
    cam.lookAt(0, 2 - scrollProgress, -scrollProgress * 2)

    if (groupRef.current) {
      groupRef.current.rotation.y = mouse.normalizedX * 0.03 + state.clock.elapsedTime * 0.015
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
        <Sparkles count={100} scale={35} size={2} speed={0.3} opacity={0.3} color="#0d9488" />
        <Sparkles count={50} scale={30} size={2.5} speed={0.2} opacity={0.2} color="#a8a29e" />
        
        <GroundPlane />
        <CityGrid />
        <CityBlocks />
        <DeliveryPath />
        <DroneAnimated />
        <Pods />
      </group>

      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={0.6} />
      </EffectComposer>
    </>
  )
}

function DroneAnimated() {
  const ref = useRef<THREE.Group>(null)
  const trailRef = useRef<THREE.Points>(null)
  const rotorRefs = useRef<THREE.Mesh[]>([])
  const blurRefs = useRef<THREE.Mesh[]>([])
  
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-8, 6, -3),
    new THREE.Vector3(-4, 5, -1),
    new THREE.Vector3(0, 4.5, 1),
    new THREE.Vector3(4, 4, 3),
    new THREE.Vector3(7, 3.5, 5),
  ]), [])

  const trailGeom = useMemo(() => {
    const positions = new Float32Array(50 * 3)
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geom
  }, [])

  const trailPositions = useRef<THREE.Vector3[]>([])

  // Create propeller blade geometry
  const bladeGeom = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, -0.008)
    shape.lineTo(0.18, -0.015)
    shape.quadraticCurveTo(0.2, 0, 0.18, 0.015)
    shape.lineTo(0, 0.008)
    shape.lineTo(-0.18, 0.015)
    shape.quadraticCurveTo(-0.2, 0, -0.18, -0.015)
    shape.lineTo(0, -0.008)
    
    const extrudeSettings = { depth: 0.006, bevelEnabled: false }
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = (state.clock.elapsedTime * 0.1) % 1
    const pos = path.getPoint(t)
    
    ref.current.position.copy(pos)
    ref.current.position.y += Math.sin(state.clock.elapsedTime * 4) * 0.1
    
    // Add slight tilt based on movement direction
    const nextT = Math.min(t + 0.02, 1)
    const nextPos = path.getPoint(nextT)
    ref.current.lookAt(nextPos)
    
    // Subtle banking effect
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05

    // Spin the rotors fast
    rotorRefs.current.forEach((rotor, i) => {
      if (rotor) {
        const direction = i % 2 === 0 ? 1 : -1 // Alternate spin direction
        rotor.rotation.y += direction * 0.8
      }
    })
    
    // Pulse the rotor blur effect
    blurRefs.current.forEach((blur) => {
      if (blur) {
        blur.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 30) * 0.05
      }
    })

    // Trail
    trailPositions.current.unshift(pos.clone())
    if (trailPositions.current.length > 50) trailPositions.current.pop()
    
    if (trailRef.current && trailGeom) {
      const positions = trailGeom.attributes.position.array as Float32Array
      for (let i = 0; i < 50; i++) {
        const p = trailPositions.current[i] || pos
        positions[i * 3] = p.x
        positions[i * 3 + 1] = p.y
        positions[i * 3 + 2] = p.z
      }
      trailGeom.attributes.position.needsUpdate = true
    }
  })

  // Arm positions for quadcopter layout
  const armConfigs = [
    { pos: [0.32, 0.02, 0.32], rot: Math.PI / 4 },      // Front-right
    { pos: [-0.32, 0.02, 0.32], rot: -Math.PI / 4 },    // Front-left
    { pos: [0.32, 0.02, -0.32], rot: -Math.PI / 4 },    // Back-right
    { pos: [-0.32, 0.02, -0.32], rot: Math.PI / 4 },    // Back-left
  ]

  return (
    <>
      <Float speed={2} rotationIntensity={0.05} floatIntensity={0.1}>
        <group ref={ref}>
          {/* Main body - central hub */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 0.08, 8]} />
            <meshStandardMaterial color="#1a1a1f" metalness={0.9} roughness={0.15} />
          </mesh>
          
          {/* Top cover plate */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.03, 8]} />
            <meshStandardMaterial color="#0c4a6e" metalness={0.85} roughness={0.2} />
          </mesh>
          
          {/* Bottom sensor housing */}
          <mesh position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.06, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.3} />
          </mesh>
          
          {/* Camera lens */}
          <mesh position={[0, -0.07, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.025, 0.015, 12]} />
            <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.05} />
          </mesh>
          <mesh position={[0, -0.068, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.018, 16]} />
            <meshBasicMaterial color="#1e3a5f" />
          </mesh>
          
      {/* LED strip around body */}
      <mesh position={[0, 0.01, 0]}>
        <torusGeometry args={[0.13, 0.008, 8, 24]} />
        <meshBasicMaterial color="#0d9488" transparent opacity={0.9} />
      </mesh>
          
          {/* GPS module on top */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
            <meshStandardMaterial color="#27272a" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.095, 0]}>
            <sphereGeometry args={[0.015, 12, 12]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
          
          {/* Arms and motor assemblies */}
          {armConfigs.map((config, i) => (
            <group key={i}>
              {/* Arm - tapered carbon fiber style */}
              <mesh position={[config.pos[0] * 0.5, config.pos[1], config.pos[2] * 0.5]} rotation={[0, config.rot, 0]}>
                <boxGeometry args={[0.38, 0.025, 0.04]} />
                <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.3} />
              </mesh>
              
              {/* Motor housing */}
              <mesh position={config.pos as [number, number, number]}>
                <cylinderGeometry args={[0.045, 0.05, 0.04, 12]} />
                <meshStandardMaterial color="#0c4a6e" metalness={0.85} roughness={0.15} />
              </mesh>
              
              {/* Motor top cap */}
              <mesh position={[config.pos[0], config.pos[1] + 0.025, config.pos[2]]}>
                <cylinderGeometry args={[0.035, 0.04, 0.015, 12]} />
                <meshStandardMaterial color="#27272a" metalness={0.9} roughness={0.1} />
              </mesh>
              
              {/* Propeller hub */}
              <mesh position={[config.pos[0], config.pos[1] + 0.04, config.pos[2]]}>
                <cylinderGeometry args={[0.02, 0.025, 0.02, 8]} />
                <meshStandardMaterial color="#1a1a1f" metalness={0.8} roughness={0.2} />
              </mesh>
              
              {/* Spinning propeller blades */}
              <mesh
                ref={(el) => { if (el) rotorRefs.current[i] = el }}
                position={[config.pos[0], config.pos[1] + 0.052, config.pos[2]]}
                rotation={[Math.PI / 2, 0, i * Math.PI / 3]}
                geometry={bladeGeom}
              >
                <meshStandardMaterial 
                  color="#1e293b" 
                  metalness={0.6} 
                  roughness={0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
              
              {/* Rotor blur disc effect */}
              <mesh
                ref={(el) => { if (el) blurRefs.current[i] = el }}
                position={[config.pos[0], config.pos[1] + 0.055, config.pos[2]]}
                rotation={[0, 0, 0]}
              >
                <circleGeometry args={[0.19, 32]} />
                <meshBasicMaterial color="#0d9488" transparent opacity={0.15} side={THREE.DoubleSide} />
              </mesh>
              
              {/* Motor LED indicator */}
              <mesh position={[config.pos[0], config.pos[1] - 0.015, config.pos[2]]}>
                <sphereGeometry args={[0.008, 8, 8]} />
                <meshBasicMaterial color={i < 2 ? '#22c55e' : '#ef4444'} />
              </mesh>
            </group>
          ))}
          
          {/* Landing gear legs */}
          {[[-0.18, -0.15, 0.15], [0.18, -0.15, 0.15], [-0.18, -0.15, -0.15], [0.18, -0.15, -0.15]].map((pos, i) => (
            <group key={`leg-${i}`}>
              {/* Leg strut */}
              <mesh position={[pos[0], pos[1] + 0.05, pos[2]]} rotation={[0, 0, pos[0] > 0 ? -0.15 : 0.15]}>
                <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
                <meshStandardMaterial color="#27272a" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Foot pad */}
              <mesh position={pos as [number, number, number]}>
                <sphereGeometry args={[0.015, 8, 8]} />
                <meshStandardMaterial color="#18181b" metalness={0.5} roughness={0.5} />
              </mesh>
            </group>
          ))}
          
      {/* Front indicator light */}
      <mesh position={[0, 0.02, 0.14]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color="#0d9488" />
      </mesh>
          
          {/* Rear indicator lights */}
          <mesh position={[-0.04, 0.02, -0.14]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.04, 0.02, -0.14]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          
          {/* Package attachment system */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.08, 0.02, 0.08]} />
            <meshStandardMaterial color="#27272a" metalness={0.8} roughness={0.2} />
          </mesh>
          
          {/* Package */}
          <group position={[0, -0.2, 0]}>
            {/* Cables/strings */}
            {[[-0.03, 0.03], [0.03, 0.03], [-0.03, -0.03], [0.03, -0.03]].map((offset, i) => (
              <mesh key={`cable-${i}`} position={[offset[0], 0.05, offset[1]]}>
                <cylinderGeometry args={[0.003, 0.003, 0.08, 6]} />
                <meshStandardMaterial color="#374151" metalness={0.3} roughness={0.7} />
              </mesh>
            ))}
            {/* Package box */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.14, 0.1, 0.12]} />
              <meshStandardMaterial color="#f97316" metalness={0.1} roughness={0.8} />
            </mesh>
            {/* Package tape */}
            <mesh position={[0, 0.051, 0]}>
              <boxGeometry args={[0.04, 0.002, 0.125]} />
              <meshStandardMaterial color="#d97706" metalness={0.2} roughness={0.6} />
            </mesh>
          {/* Aerohorse logo indicator */}
          <mesh position={[0, 0, 0.061]}>
            <planeGeometry args={[0.06, 0.04]} />
            <meshBasicMaterial color="#0d9488" transparent opacity={0.8} />
          </mesh>
        </group>
        
        {/* Downward light for package visibility */}
        <pointLight position={[0, -0.08, 0]} color="#0d9488" intensity={1} distance={2} />
        
        {/* Main glow light */}
        <pointLight color="#0d9488" intensity={1.5} distance={4} />
        </group>
      </Float>
      
      {/* Trail */}
      <points ref={trailRef} geometry={trailGeom}>
        <pointsMaterial color="#0d9488" size={0.06} transparent opacity={0.5} sizeAttenuation />
      </points>
    </>
  )
}

function DeliveryPath() {
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-8, 6, -3),
    new THREE.Vector3(-4, 5, -1),
    new THREE.Vector3(0, 4.5, 1),
    new THREE.Vector3(4, 4, 3),
    new THREE.Vector3(7, 3.5, 5),
    new THREE.Vector3(7, 0.5, 5),
  ]), [])
  
  const tubeGeom = useMemo(() => new THREE.TubeGeometry(path, 80, 0.025, 8, false), [path])

  return (
    <mesh geometry={tubeGeom}>
      <meshBasicMaterial color="#0d9488" transparent opacity={0.4} />
    </mesh>
  )
}

function Pods() {
  const positions: [number, number, number][] = [
    [0, 0, 1],
    [7, 0, 5],
    [-5, 0, 3],
    [4, 0, -2],
  ]
  
  return (
    <>
      {positions.map((pos, i) => (
        <Pod key={i} position={pos} delay={i * 0.5} />
      ))}
    </>
  )
}

function Pod({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + delay) * 0.04
    }
  })

  return (
    <group ref={ref} position={position}>
      {/* Base */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 0.15, 6]} />
        <meshStandardMaterial color="#57534e" metalness={0.85} roughness={0.15} />
      </mesh>
      
      {/* Dome */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0d9488" transparent opacity={0.25} metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Ring */}
      <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.68, 32]} />
        <meshBasicMaterial color="#0d9488" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Inner glow */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#14b8a6" transparent opacity={0.9} />
      </mesh>
      
      <pointLight position={[0, 0.4, 0]} color="#0d9488" intensity={1.5} distance={3} />
    </group>
  )
}

function CityBlocks() {
  const blocks = useMemo(() => {
    const out: { pos: [number, number, number]; size: [number, number, number]; glow: boolean }[] = []
    const seed = 42
    const random = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000
      return x - Math.floor(x)
    }
    let i = 0
    for (let x = -GRID_SIZE; x <= GRID_SIZE; x += 3.5) {
      for (let z = -GRID_SIZE; z <= GRID_SIZE; z += 3.5) {
        const dist = Math.sqrt(x * x + z * z)
        if (dist > 6 && dist < 22 && random(i) > 0.35) {
          const h = 0.4 + random(i + 1) * 2.8
          out.push({
            pos: [x + random(i + 2) * 1.2, h / 2, z + random(i + 3) * 1.2],
            size: [0.9 + random(i + 4) * 0.7, h, 0.9 + random(i + 5) * 0.7],
            glow: random(i + 6) > 0.88
          })
        }
        i++
      }
    }
    return out
  }, [])

  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial
            color={b.glow ? '#e7e5e4' : '#d6d3d1'}
            emissive={b.glow ? '#0d9488' : '#000000'}
            emissiveIntensity={b.glow ? 0.1 : 0}
            metalness={0.3}
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}

function CityGrid() {
  const [verts, indices] = useMemo(() => {
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
    return [new Float32Array(points), new Uint16Array(idx)]
  }, [])
  
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    g.setIndex(new THREE.BufferAttribute(indices, 1))
    return g
  }, [verts, indices])

  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial color="#0d9488" transparent opacity={0.15} />
    </lineSegments>
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
