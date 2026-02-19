/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const TRUCK_GLTF_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/truck/scene.gltf'
const TRUCK_TARGET_SIZE = 1.7

useGLTF.preload(TRUCK_GLTF_URL)

function TruckModel({ progress }: { progress: number }) {
  const { scene } = useGLTF(TRUCK_GLTF_URL)

  const { clonedScene, scale, baseOffset, halfWidthX } = useMemo(() => {
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
      baseOffset: {
        x: -center.x * s,
        y: -box.min.y * s,
        z: center.z * s,
      },
      halfWidthX: (size.x * s) / 2,
    }
  }, [scene])

  // progress 0 = truck's left edge at extreme left of view (-14); 1 = truck's right edge at 80vw (8.4)
  // Ortho view X: -14 to 14 (width 28). 80vw → right edge at -14 + 0.8*28 = 8.4
  const leftEdgeStart = -14
  const rightEdgeEnd = -14 + 0.8 * 28 // 8.4
  const posX =
    (leftEdgeStart + halfWidthX) +
    progress * (rightEdgeEnd - halfWidthX - (leftEdgeStart + halfWidthX)) +
    baseOffset.x
  // Shift truck down so it passes at "Scroll to continue" level (lower part of view)
  const posY = baseOffset.y - 2.3
  const posZ = baseOffset.z
  // Face right (+X): rotation Y = 0 (in Scene3D, Math.PI faced -X)
  const rotationY = 0

  return (
    <group
      position={[posX, posY, posZ]}
      scale={[scale, scale, scale]}
      rotation={[0, rotationY, 0]}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

function CameraSetup() {
  const { camera, set } = useThree()
  const originalCam = useRef(camera)
  useEffect(() => {
    const ortho = new THREE.OrthographicCamera(-14, 14, 7, -7, 0.1, 100)
    ortho.position.set(0, 0, 15)
    ortho.lookAt(0, 0, 0)
    ortho.updateProjectionMatrix()
    set({ camera: ortho })
    return () => set({ camera: originalCam.current })
  }, [set])
  return null
}

function Scene({ progress }: { progress: number }) {
  return (
    <>
      <CameraSetup />
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <pointLight position={[0, 5, 5]} intensity={2} distance={30} />
      <TruckModel progress={progress} />
    </>
  )
}

export default function TransitionTruck({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        orthographic
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ display: 'block' }}
      >
        <Scene progress={progress} />
      </Canvas>
    </div>
  )
}
