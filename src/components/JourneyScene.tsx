/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

export default function JourneyScene({ scrollProgress = 0 }: { scrollProgress: number }) {
  const droneRef = useRef<THREE.Group>(null)
  const riderRef = useRef<THREE.Group>(null)
  
  const phase = scrollProgress < 0.33 ? 0 : scrollProgress < 0.66 ? 1 : 2
  
  const dronePath = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-6, 5, 0),
    new THREE.Vector3(-3, 4, 0),
    new THREE.Vector3(0, 3, 0),
  ]), [])
  
  const riderPath = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.6, 0),
    new THREE.Vector3(2, 0.6, 0.5),
    new THREE.Vector3(4, 0.6, 1),
  ]), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    
    if (droneRef.current) {
      const droneT = Math.min((t * 0.15) % 1.2, 1)
      const pos = dronePath.getPoint(droneT)
      droneRef.current.position.lerp(pos, 0.05)
      droneRef.current.position.y += Math.sin(t * 4) * 0.03
      
      if (droneT < 0.95) {
        const next = dronePath.getPoint(Math.min(droneT + 0.05, 1))
        droneRef.current.lookAt(next)
      }
    }
    
    if (riderRef.current) {
      const riderT = Math.max(0, Math.min(((t - 5) * 0.2) % 1.3, 1))
      if (riderT > 0) {
        const pos = riderPath.getPoint(riderT)
        riderRef.current.position.lerp(pos, 0.05)
        riderRef.current.visible = true
      } else {
        riderRef.current.visible = false
      }
    }
  })

  return (
    <>
      <color attach="background" args={['#fafaf9']} />
      <fog attach="fog" args={['#fafaf9', 20, 60]} />
      
      <ambientLight intensity={1} />
      <directionalLight position={[5, 12, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 5, 2]} color="#0d9488" intensity={3} distance={25} />
      <pointLight position={[4, 3, 1]} color="#64748b" intensity={2} distance={20} />
      <pointLight position={[-3, 2, 0]} color="#78716c" intensity={1.5} distance={15} />

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.3}
      />
      
      <Sparkles count={80} scale={25} size={2.5} speed={0.4} opacity={0.3} color="#0d9488" />

      {/* Paths */}
      <PathLine path={dronePath} color="#0d9488" />
      <PathLine path={riderPath} color="#64748b" />

      {/* Drone */}
      <Float speed={2} rotationIntensity={0.05} floatIntensity={0.1}>
        <group ref={droneRef} position={[-6, 5, 0]}>
          <RealisticDrone />
        </group>
      </Float>

      {/* Rider */}
      <group ref={riderRef} visible={false} position={[0, 0.6, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
          <meshStandardMaterial color="#57534e" />
        </mesh>
        <mesh position={[0.2, 0.2, 0.1]}>
          <boxGeometry args={[0.2, 0.3, 0.15]} />
          <meshStandardMaterial color="#0d9488" emissive="#0d9488" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.2]} />
          <meshStandardMaterial color="#78716c" />
        </mesh>
      </group>

      {/* Smart Pod */}
      <SmartPod position={[0, 0, 0]} />
      
      {/* Destination House */}
      <House position={[4.5, 0, 1]} />

      {/* Ground with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#f5f5f4" />
      </mesh>
      <GridFloor />

      {/* Phase Labels */}
      <Label position={[-4, 6, 0]} text="DRONE" active={phase === 0} />
      <Label position={[0, 4, 0]} text="POD" active={phase === 1} />
      <Label position={[4.5, 2.5, 1]} text="HOME" active={phase === 2} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={0.8} />
      </EffectComposer>
    </>
  )
}

function PathLine({ path, color }: { path: THREE.Curve<THREE.Vector3>; color: string }) {
  const geom = useMemo(() => {
    const points = path.getPoints(50)
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [path])

  return (
    <line geometry={geom}>
      <lineBasicMaterial color={color} transparent opacity={0.6} linewidth={2} />
    </line>
  )
}

function SmartPod({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.03
    }
  })

  return (
    <group ref={ref} position={position}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.8, 0.9, 0.2, 8]} />
        <meshStandardMaterial color="#57534e" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Dome */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.55, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0d9488" transparent opacity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Ring light */}
      <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.8, 32]} />
        <meshBasicMaterial color="#0d9488" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Inner glow */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#14b8a6" transparent opacity={0.8} />
      </mesh>
      
      <pointLight position={[0, 0.5, 0]} color="#0d9488" intensity={2} distance={4} />
    </group>
  )
}

function House({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main building */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 1, 1]} />
        <meshStandardMaterial color="#e7e5e4" metalness={0.3} roughness={0.8} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1, 0.6, 4]} />
        <meshStandardMaterial color="#78716c" metalness={0.3} roughness={0.8} />
      </mesh>
      
      {/* Door */}
      <mesh position={[0.3, 0.4, 0.51]}>
        <boxGeometry args={[0.25, 0.5, 0.02]} />
        <meshStandardMaterial color="#0d9488" emissive="#0d9488" emissiveIntensity={0.4} />
      </mesh>
      
      {/* Window light */}
      <mesh position={[-0.3, 0.6, 0.51]}>
        <boxGeometry args={[0.2, 0.2, 0.02]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
      
      <pointLight position={[0.3, 0.5, 0.8]} color="#0d9488" intensity={0.8} distance={3} />
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

function Label({ position, text, active }: { position: [number, number, number]; text: string; active: boolean }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={active ? '#0d9488' : '#a8a29e'} />
      </mesh>
      {active && <pointLight color="#0d9488" intensity={0.8} distance={2} />}
    </group>
  )
}

function RealisticDrone() {
  const rotorRefs = useRef<THREE.Mesh[]>([])
  const blurRefs = useRef<THREE.Mesh[]>([])
  
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
    // Spin the rotors fast
    rotorRefs.current.forEach((rotor, i) => {
      if (rotor) {
        const direction = i % 2 === 0 ? 1 : -1
        rotor.rotation.y += direction * 0.8
      }
    })
    
    // Pulse the rotor blur effect
    blurRefs.current.forEach((blur) => {
      if (blur) {
        blur.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 30) * 0.05
      }
    })
  })

  const armConfigs = [
    { pos: [0.32, 0.02, 0.32], rot: Math.PI / 4 },
    { pos: [-0.32, 0.02, 0.32], rot: -Math.PI / 4 },
    { pos: [0.32, 0.02, -0.32], rot: -Math.PI / 4 },
    { pos: [-0.32, 0.02, -0.32], rot: Math.PI / 4 },
  ]

  return (
    <group>
      {/* Main body - central hub */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.08, 8]} />
        <meshStandardMaterial color="#57534e" metalness={0.9} roughness={0.15} />
      </mesh>
      
      {/* Top cover plate */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.03, 8]} />
        <meshStandardMaterial color="#0d9488" metalness={0.85} roughness={0.2} />
      </mesh>
      
      {/* Bottom sensor housing */}
      <mesh position={[0, -0.06, 0]}>
        <sphereGeometry args={[0.06, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#78716c" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Camera lens */}
      <mesh position={[0, -0.07, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.015, 12]} />
        <meshStandardMaterial color="#44403c" metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh position={[0, -0.068, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.018, 16]} />
        <meshBasicMaterial color="#0d9488" />
      </mesh>
      
      {/* LED strip around body */}
      <mesh position={[0, 0.01, 0]}>
        <torusGeometry args={[0.13, 0.008, 8, 24]} />
        <meshBasicMaterial color="#0d9488" transparent opacity={0.9} />
      </mesh>
      
      {/* GPS module on top */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
        <meshStandardMaterial color="#78716c" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.095, 0]}>
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      
      {/* Arms and motor assemblies */}
      {armConfigs.map((config, i) => (
        <group key={i}>
          {/* Arm */}
          <mesh position={[config.pos[0] * 0.5, config.pos[1], config.pos[2] * 0.5]} rotation={[0, config.rot, 0]}>
            <boxGeometry args={[0.38, 0.025, 0.04]} />
            <meshStandardMaterial color="#78716c" metalness={0.7} roughness={0.3} />
          </mesh>
          
          {/* Motor housing */}
          <mesh position={config.pos as [number, number, number]}>
            <cylinderGeometry args={[0.045, 0.05, 0.04, 12]} />
            <meshStandardMaterial color="#0d9488" metalness={0.85} roughness={0.15} />
          </mesh>
          
          {/* Motor top cap */}
          <mesh position={[config.pos[0], config.pos[1] + 0.025, config.pos[2]]}>
            <cylinderGeometry args={[0.035, 0.04, 0.015, 12]} />
            <meshStandardMaterial color="#78716c" metalness={0.9} roughness={0.1} />
          </mesh>
          
          {/* Propeller hub */}
          <mesh position={[config.pos[0], config.pos[1] + 0.04, config.pos[2]]}>
            <cylinderGeometry args={[0.02, 0.025, 0.02, 8]} />
            <meshStandardMaterial color="#57534e" metalness={0.8} roughness={0.2} />
          </mesh>
          
          {/* Spinning propeller blades */}
          <mesh
            ref={(el) => { if (el) rotorRefs.current[i] = el }}
            position={[config.pos[0], config.pos[1] + 0.052, config.pos[2]]}
            rotation={[Math.PI / 2, 0, i * Math.PI / 3]}
            geometry={bladeGeom}
          >
            <meshStandardMaterial 
              color="#64748b" 
              metalness={0.6} 
              roughness={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Rotor blur disc effect */}
          <mesh
            ref={(el) => { if (el) blurRefs.current[i] = el }}
            position={[config.pos[0], config.pos[1] + 0.055, config.pos[2]]}
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
          <mesh position={[pos[0], pos[1] + 0.05, pos[2]]} rotation={[0, 0, pos[0] > 0 ? -0.15 : 0.15]}>
            <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
            <meshStandardMaterial color="#78716c" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={pos as [number, number, number]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#57534e" metalness={0.5} roughness={0.5} />
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
      
      {/* Package attachment */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.08, 0.02, 0.08]} />
        <meshStandardMaterial color="#78716c" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Package */}
      <group position={[0, -0.2, 0]}>
        {[[-0.03, 0.03], [0.03, 0.03], [-0.03, -0.03], [0.03, -0.03]].map((offset, i) => (
          <mesh key={`cable-${i}`} position={[offset[0], 0.05, offset[1]]}>
            <cylinderGeometry args={[0.003, 0.003, 0.08, 6]} />
            <meshStandardMaterial color="#a8a29e" metalness={0.3} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.14, 0.1, 0.12]} />
          <meshStandardMaterial color="#f97316" metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.051, 0]}>
          <boxGeometry args={[0.04, 0.002, 0.125]} />
          <meshStandardMaterial color="#d97706" metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.061]}>
          <planeGeometry args={[0.06, 0.04]} />
          <meshBasicMaterial color="#0d9488" transparent opacity={0.8} />
        </mesh>
      </group>
      
      <pointLight position={[0, -0.08, 0]} color="#0d9488" intensity={0.8} distance={2} />
      <pointLight color="#0d9488" intensity={1} distance={4} />
    </group>
  )
}
