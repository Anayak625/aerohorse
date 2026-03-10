/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useDevicePerformance } from '../hooks/useDevicePerformance'

const DRONE_GLTF_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/drone/scene.gltf'
// Slightly larger so it matches the landing drone's presence
const DRONE_TARGET_SIZE_DESKTOP = 1.8
const MOBILE_ASPECT_THRESHOLD = 1.2

useGLTF.preload(DRONE_GLTF_URL)

function DroneModel({ progress }: { progress: number }) {
  const { scene } = useGLTF(DRONE_GLTF_URL)
  const { size } = useThree()
  const aspect = size.width / (size.height || 1)
  const isNarrow = aspect < MOBILE_ASPECT_THRESHOLD
  const droneTargetSize = isNarrow ? Math.max(1.9, 0.9 * aspect) : DRONE_TARGET_SIZE_DESKTOP
  const groupRef = useRef<THREE.Group>(null)
  const wingsRef = useRef<THREE.Object3D[]>([])

  const { clonedScene, scale, baseOffset, halfWidthX } = useMemo(() => {
    const clone = scene.clone()
    wingsRef.current = []
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        ; (child as THREE.Mesh).castShadow = true
          ; (child as THREE.Mesh).receiveShadow = true
      }
      // Match landing drone behavior: spin propellers by wing parent nodes
      if (/^Wing\d$/.test(child.name)) wingsRef.current.push(child)
    })
    const box = new THREE.Box3().setFromObject(clone)
    const sizeVec = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(sizeVec)
    box.getCenter(center)
    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1
    const s = droneTargetSize / maxDim
    return {
      clonedScene: clone,
      scale: s,
      baseOffset: {
        x: -center.x * s,
        y: -center.y * s,
        z: -center.z * s,
      },
      halfWidthX: (sizeVec.x * s) / 2,
    }
  }, [scene, droneTargetSize])

  const leftEdgeStart = isNarrow ? -9 * aspect : -18
  const rightEdgeEnd = isNarrow ? 9 * aspect : 18
  // Use progress from 0 to 1 to sweep across the screen left to right
  const posX =
    leftEdgeStart +
    halfWidthX +
    progress * (rightEdgeEnd - leftEdgeStart - halfWidthX * 2) +
    baseOffset.x
  const posY = baseOffset.y + (isNarrow ? -1.9 : -1.9) // Lowered from 1.35 and 2.2
  const posZ = baseOffset.z

  useFrame((state, delta) => {
    // Propeller spin + subtle hover (same "alive" feel as the landing drone)
    wingsRef.current.forEach((wing, i) => {
      const direction = i % 2 === 0 ? 1 : -1
      wing.rotation.z += 25 * direction * delta
    })
    if (groupRef.current) groupRef.current.position.y = posY + Math.sin(state.clock.elapsedTime * 2.2) * 0.06
  })

  return (
    <group
      ref={groupRef}
      position={[posX, posY, posZ]}
      scale={[scale, scale, scale]}
      rotation={[0, 0, 0]}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

function CameraSetup() {
  const { camera, set, size } = useThree()
  const originalCam = useRef(camera)
  const aspect = size.width / (size.height || 1)
  const isNarrow = aspect < MOBILE_ASPECT_THRESHOLD

  useEffect(() => {
    const ortho = new THREE.OrthographicCamera(-14, 14, 7, -7, 0.1, 100)
    ortho.position.set(0, 0, 15)
    ortho.lookAt(0, 0, 0)
    set({ camera: ortho })
    return () => set({ camera: originalCam.current })
  }, [set])

  useEffect(() => {
    if (!camera || !(camera as THREE.OrthographicCamera).isOrthographicCamera) return
    const ortho = camera as THREE.OrthographicCamera
    if (isNarrow) {
      const w = 7 * aspect
      ortho.left = -w
      ortho.right = w
      ortho.top = 7
      ortho.bottom = -7
    } else {
      ortho.left = -14
      ortho.right = 14
      ortho.top = 7
      ortho.bottom = -7
    }
    ortho.updateProjectionMatrix()
  }, [camera, aspect, isNarrow])

  return null
}

function Scene({ progress }: { progress: number }) {
  return (
    <>
      <CameraSetup />
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <pointLight position={[0, 5, 5]} intensity={2} distance={30} />
      <DroneModel progress={progress} />
    </>
  )
}

export default function TransitionDrone({ progress }: { progress: number }) {
  const performance = useDevicePerformance()
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        orthographic
        dpr={performance.dpr as [number, number]}
        gl={{ antialias: performance.antialias, alpha: true, powerPreference: 'high-performance' }}
        style={{ display: 'block' }}
      >
        <Scene progress={progress} />
      </Canvas>
    </div>
  )
}
