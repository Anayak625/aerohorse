/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

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
      <color attach="background" args={['#fafaf9']} />
      <fog attach="fog" args={['#fafaf9', 20, 60]} />
      
      <ambientLight intensity={1} />
      <directionalLight position={[5, 12, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 5, 2]} color="#0d9488" intensity={3} distance={25} />
      <pointLight position={[4, 3, 1]} color="#64748b" intensity={2} distance={20} />
      <pointLight position={[-3, 2, 0]} color="#78716c" intensity={1.5} distance={15} />

      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={15}
      />

      {/* City Buildings - Half Planned City */}
      <CityBlock />

      {/* Ground with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#f5f5f4" />
      </mesh>
      <GridFloor />
    </>
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

