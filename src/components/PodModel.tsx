/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { POD_GLTF_URL } from '../constants/webglAssets'

export { POD_GLTF_URL }

/** From pod.gltf bounds (meters in file space) — used so parcel drop height matches without waiting on load. */
const POD_BOUNDS = { minY: -0.23666006, maxY: 0.22633736, maxXZ: 1.000243 }

/** Match previous procedural pod ~1.6 m footprint. */
export const POD_TARGET_FOOTPRINT = 1.55

/** Lower the mesh into the ground plane so the base clips under the plaza / terrain. */
export const POD_GROUND_SINK = 0.09

export function getPodModelScale(): number {
  return POD_TARGET_FOOTPRINT / POD_BOUNDS.maxXZ
}

/** World Y of the top of the pod mesh when the group sits at y = podLift and the model is floor-aligned. */
export function getPodTopSurfaceWorldY(podLift: number): number {
  const s = getPodModelScale()
  const yAlign = -POD_BOUNDS.minY * s
  const topLocal = POD_BOUNDS.maxY * s + yAlign
  return podLift + topLocal - POD_GROUND_SINK
}

/** World Y for parcel center when it rests on the pod (hero: parcel scaled by droneScale). */
export function getHeroParcelLandWorldY(podLift: number, droneScale: number): number {
  const parcelHalfWorld = (0.1 * droneScale) / 2
  return getPodTopSurfaceWorldY(podLift) + parcelHalfWorld
}

/** Journey parcel uses unscaled ~0.1 box height → ~0.05 half. */
export function getJourneyParcelLandWorldY(podLift: number): number {
  return getPodTopSurfaceWorldY(podLift) + 0.05
}

type PodModelProps = {
  hovered?: boolean
}

/**
 * GLTF pod: floor-aligned at y=0 inside parent, scaled to `POD_TARGET_FOOTPRINT`.
 * Hover drives subtle emissive pulse on PBR materials.
 */
export function PodGLTFModel({ hovered = false }: PodModelProps) {
  const { scene } = useGLTF(POD_GLTF_URL)

  const { clone, scale, yAlign, emissiveMaterials } = useMemo(() => {
    const c = scene.clone(true)
    const mats: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = []
    c.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh || !mesh.material) return
      mesh.castShadow = false
      mesh.receiveShadow = false
      const meshMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      meshMats.forEach((m) => {
        if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) {
          m.emissive = new THREE.Color('#0d9488')
          m.emissiveIntensity = 0.08
          mats.push(m)
        }
      })
    })
    const box = new THREE.Box3().setFromObject(c)
    const s = getPodModelScale()
    const align = -box.min.y * s
    return { clone: c, scale: s, yAlign: align, emissiveMaterials: mats }
  }, [scene])

  useEffect(() => {
    const root = clone
    return () => {
      root.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (!mesh.isMesh) return
        mesh.geometry?.dispose()
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach((m) => m.dispose?.())
      })
    }
  }, [clone])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pulse = hovered ? 0.22 + Math.sin(t * 8) * 0.12 : 0.08
    emissiveMaterials.forEach((m) => {
      m.emissiveIntensity = pulse
    })
  })

  return (
    <group position={[0, yAlign - POD_GROUND_SINK, 0]}>
      <primitive object={clone} scale={scale} />
    </group>
  )
}
