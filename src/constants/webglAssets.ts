import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

export const CITY_GLTF_URL = `${base}/city/scene.gltf`
export const DRONE_GLTF_URL = `${base}/drone/scene.gltf`
export const POD_GLTF_URL = `${base}/pod/pod.gltf`
export const AEROHORSE_LOGO_URL = `${base}/aerohorse-logo.png`

/**
 * Kick off fetches for GLTFs + parcel logo texture (same URLs as scenes use) so THREE.DefaultLoadingManager
 * reflects real readiness. Call once after the app shell mounts.
 */
export function preloadWebGLModels(): void {
  useGLTF.preload(CITY_GLTF_URL)
  useGLTF.preload(DRONE_GLTF_URL)
  useGLTF.preload(POD_GLTF_URL)
  new THREE.TextureLoader().load(AEROHORSE_LOGO_URL)
}
