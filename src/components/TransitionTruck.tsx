/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const TRUCK_GLTF_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/truck/scene.gltf'
const TRUCK_TARGET_SIZE_DESKTOP = 1.7
const MOBILE_ASPECT_THRESHOLD = 1.2

useGLTF.preload(TRUCK_GLTF_URL)

function TruckModel({ progress }: { progress: number }) {
  const { scene } = useGLTF(TRUCK_GLTF_URL)
  const { size } = useThree()
  const aspect = size.width / (size.height || 1)
  const isNarrow = aspect < MOBILE_ASPECT_THRESHOLD
  const truckTargetSize = isNarrow ? Math.max(0.5, 0.85 * aspect) : TRUCK_TARGET_SIZE_DESKTOP

  const { clonedScene, scale, baseOffset, halfWidthX } = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true
        ;(child as THREE.Mesh).receiveShadow = true
      }
    })
    const box = new THREE.Box3().setFromObject(clone)
    const sizeVec = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(sizeVec)
    box.getCenter(center)
    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1
    const s = truckTargetSize / maxDim
    return {
      clonedScene: clone,
      scale: s,
      baseOffset: {
        x: -center.x * s,
        y: -box.min.y * s,
        z: center.z * s,
      },
      halfWidthX: (sizeVec.x * s) / 2,
    }
  }, [scene, truckTargetSize])

  // Desktop: ortho X -14..14, truck path -14 to 8.4. Mobile: ortho -7*aspect..7*aspect, map path into it
  const leftEdgeStart = isNarrow ? -7 * aspect : -14
  const rightEdgeEnd = isNarrow ? -7 * aspect + 0.8 * (14 * aspect) : -14 + 0.8 * 28
  const posX =
    (leftEdgeStart + halfWidthX) +
    progress * (rightEdgeEnd - halfWidthX - (leftEdgeStart + halfWidthX)) +
    baseOffset.x
  const posY = baseOffset.y - (isNarrow ? 1.6 : 2.3)
  const posZ = baseOffset.z
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
