import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import type { DroneViewMode } from './droneViewerTypes'

interface RotatingGroupProps {
  children: ReactNode
  speed?: number
  bob?: boolean
  explode?: number
}

function RotatingGroup({ children, speed = 0.18, bob = true, explode = 0 }: RotatingGroupProps) {
  const group = useRef<THREE.Group>(null)
  useFrame((s) => {
    if (!group.current) return
    group.current.rotation.y = s.clock.getElapsedTime() * speed
    if (bob) {
      group.current.position.y = Math.sin(s.clock.getElapsedTime() * 0.7) * 0.06
    }
  })
  return (
    <group ref={group} scale={1 + explode * 0.12}>
      {children}
    </group>
  )
}

function armOffset(explode: number, x: number, z: number) {
  const f = 1 + explode * 0.35
  return [x * f, explode * 0.06, z * f] as [number, number, number]
}

function matProps(viewMode: DroneViewMode, base: string, emissive?: string) {
  if (viewMode === 'wireframe') {
    return { color: '#93c5fd', wireframe: true, metalness: 0.5, roughness: 0.3, emissive: '#2563eb', emissiveIntensity: 0.3 }
  }
  if (viewMode === 'thermal') {
    return { color: '#ea580c', wireframe: false, metalness: 0.4, roughness: 0.4, emissive: '#f97316', emissiveIntensity: 0.9 }
  }
  if (viewMode === 'xray') {
    return { color: '#e2e8f0', wireframe: false, metalness: 0.2, roughness: 0.1, emissive: emissive ?? '#2563eb', emissiveIntensity: 1.1, transparent: true, opacity: 0.4 }
  }
  return { color: base, wireframe: false, metalness: 0.9, roughness: 0.12, emissive: emissive ?? '#000000', emissiveIntensity: emissive ? 0.5 : 0 }
}

export function GuardianProceduralMesh({
  explode = 0,
  viewMode = 'standard',
}: {
  explode?: number
  viewMode?: DroneViewMode
}) {
  const body = matProps(viewMode, '#cbd5e1')

  return (
    <RotatingGroup explode={explode}>
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.12, 0.7]} />
        <meshStandardMaterial {...body} envMapIntensity={2} />
      </mesh>
      {[45, 135, 225, 315].map((deg, i) => {
        const r = (deg * Math.PI) / 180
        const px = Math.cos(r) * 0.65
        const pz = Math.sin(r) * 0.65
        const pos = armOffset(explode, px, pz)
        const arm = matProps(viewMode, '#94a3b8')
        return (
          <group key={i} position={pos}>
            <mesh rotation={[0, -r + Math.PI / 4, 0]}>
              <boxGeometry args={[0.55, 0.035, 0.05]} />
              <meshStandardMaterial {...arm} />
            </mesh>
            <mesh position={[0, 0.035, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.07, 16]} />
              <meshStandardMaterial {...matProps(viewMode, '#64748b')} />
            </mesh>
            <mesh position={[0, 0.09, 0]}>
              <boxGeometry args={[0.65, 0.008, 0.05]} />
              {viewMode === 'standard' ? (
                <MeshDistortMaterial
                  color={i % 2 === 0 ? '#2563eb' : '#93c5fd'}
                  metalness={0.3}
                  roughness={0.3}
                  distort={0.08}
                  speed={6}
                  transparent
                  opacity={0.75}
                />
              ) : (
                <meshStandardMaterial {...matProps(viewMode, '#2563eb', '#2563eb')} />
              )}
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, -0.1 + explode * 0.05, 0.22 + explode * 0.08]}>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshStandardMaterial
          {...matProps(viewMode, '#2563eb', '#1d4ed8')}
        />
      </mesh>
    </RotatingGroup>
  )
}

export function LemurProceduralMesh({
  explode = 0,
  viewMode = 'standard',
}: {
  explode?: number
  viewMode?: DroneViewMode
}) {
  const body = matProps(viewMode, '#94a3b8')

  return (
    <RotatingGroup speed={0.22} explode={explode}>
      <mesh>
        <boxGeometry args={[0.45, 0.08, 0.45]} />
        <meshStandardMaterial {...body} />
      </mesh>
      <mesh scale={1 + explode * 0.15}>
        <torusGeometry args={[0.38, 0.018, 12, 48]} />
        <meshStandardMaterial {...matProps(viewMode, '#64748b')} />
      </mesh>
      <mesh position={[0, 0.1 + explode * 0.04, 0.2 + explode * 0.1]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial {...matProps(viewMode, '#1e293b', '#2563eb')} />
      </mesh>
      <mesh position={[0, 0.14 + explode * 0.05, 0.26 + explode * 0.12]}>
        <cylinderGeometry args={[0.04, 0.05, 0.06, 16]} />
        <meshStandardMaterial {...matProps(viewMode, '#2563eb', '#2563eb')} />
      </mesh>
      {[0, 90, 180, 270].map((deg, i) => {
        const r = (deg * Math.PI) / 180
        const pos = armOffset(explode, Math.cos(r) * 0.32, Math.sin(r) * 0.32)
        return (
          <group key={i} position={[pos[0], 0.02 + explode * 0.02, pos[2]]}>
            <mesh rotation={[0, -r, 0]}>
              <boxGeometry args={[0.22, 0.02, 0.03]} />
              <meshStandardMaterial {...matProps(viewMode, '#cbd5e1')} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
              <meshStandardMaterial
                {...matProps(viewMode, i % 2 === 0 ? '#5b8fd4' : '#93c5fd', '#5b8fd4')}
                transparent={viewMode === 'xray'}
                opacity={viewMode === 'xray' ? 0.5 : 1}
              />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0.12 + explode * 0.06, -0.02, 0.15 + explode * 0.05]}>
        <coneGeometry args={[0.03, 0.08, 8]} />
        <meshStandardMaterial {...matProps(viewMode, '#f59e0b', '#d97706')} />
      </mesh>
    </RotatingGroup>
  )
}

export function AmbientDroneRings({ accent }: { accent: 'gold' | 'rose' }) {
  const r1 = useRef<THREE.Mesh>(null)
  const r2 = useRef<THREE.Mesh>(null)
  const primary = accent === 'gold' ? '#2563eb' : '#5b8fd4'
  const secondary = '#93c5fd'

  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (r1.current) r1.current.rotation.z = t * 0.25
    if (r2.current) r2.current.rotation.z = -t * 0.15
  })

  return (
    <>
      <mesh ref={r1} position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.005, 12, 160]} />
        <meshStandardMaterial color={primary} emissive={primary} emissiveIntensity={4} transparent opacity={0.45} />
      </mesh>
      <mesh ref={r2} position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.003, 8, 128]} />
        <meshStandardMaterial color={secondary} emissive={secondary} emissiveIntensity={3} transparent opacity={0.3} />
      </mesh>
    </>
  )
}
