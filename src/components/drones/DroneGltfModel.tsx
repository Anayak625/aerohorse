import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { DroneViewMode } from './droneViewerTypes'

const TARGET_SIZE = 2.2

function applyViewMode(material: THREE.Material, mode: DroneViewMode) {
  if (!(material instanceof THREE.MeshStandardMaterial)) return
  switch (mode) {
    case 'wireframe':
      material.wireframe = true
      material.transparent = false
      material.opacity = 1
      material.color.set('#64748b')
      material.emissive.set('#2563eb')
      material.emissiveIntensity = 0.15
      break
    case 'thermal':
      material.wireframe = false
      material.transparent = false
      material.opacity = 1
      material.color.set('#ea580c')
      material.emissive.set('#f97316')
      material.emissiveIntensity = 0.75
      break
    case 'xray':
      material.wireframe = false
      material.transparent = true
      material.opacity = 0.45
      material.color.set('#94a3b8')
      material.emissive.set('#2563eb')
      material.emissiveIntensity = 0.9
      break
    default:
      material.wireframe = false
      material.transparent = false
      material.opacity = 1
      material.emissive.set('#000000')
      material.emissiveIntensity = 0
      break
  }
}

function normalizeScene(scene: THREE.Object3D, viewMode: DroneViewMode) {
  const root = new THREE.Group()
  const clone = scene.clone(true)

  clone.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((mat) => applyViewMode(mat, viewMode))
      }
    }
  })

  clone.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(clone)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 0.001)
  const scale = TARGET_SIZE / maxDim

  clone.position.sub(center)
  clone.scale.setScalar(scale)
  root.add(clone)

  return root
}

interface DroneGltfModelProps {
  url: string
  viewMode: DroneViewMode
  explode: number
}

export function DroneGltfModel({ url, viewMode, explode }: DroneGltfModelProps) {
  const { scene } = useGLTF(url)
  const group = useRef<THREE.Group>(null)

  const model = useMemo(() => normalizeScene(scene, viewMode), [scene, viewMode])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.rotation.y = t * 0.35
    group.current.position.y = Math.sin(t * 0.6) * 0.05
    const explodeScale = 1 + explode * 0.12
    group.current.scale.setScalar(explodeScale)
  })

  return (
    <group ref={group} position={[0, 0.05, 0]}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload('/drone/scene.gltf')
