/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
/**
 * Shared landing / journey city: one GLTF URL, one loader cache entry.
 * Each Canvas still clones geometry for materials (hero) or uses the cached scene (low-end).
 */
import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { CITY_GLTF_URL } from '../constants/webglAssets'

export { CITY_GLTF_URL }

/** Align plaza with world origin where the pod sits (same as hero Scene3D). */
export const CITY_PLAZA_OFFSET = { x: 2, z: -4 }

/** Yaw the whole city around the vertical through the plaza/pod (world origin). */
const CITY_YAW_RAD = THREE.MathUtils.degToRad(90)

export function HeroCityModel({ useLitMaterials }: { useLitMaterials: boolean }) {
  const { scene } = useGLTF(CITY_GLTF_URL)

  const { cityRoot, scale, offset } = useMemo(() => {
    const root = useLitMaterials ? scene.clone(true) : scene
    if (useLitMaterials) {
      const basicToStandard = new Map<THREE.MeshBasicMaterial, THREE.MeshStandardMaterial>()

      const toStandard = (mat: THREE.Material): THREE.Material => {
        if (!(mat instanceof THREE.MeshBasicMaterial)) return mat
        let std = basicToStandard.get(mat)
        if (!std) {
          const baseColor = mat.color.clone()
          baseColor.r = Math.min(1, baseColor.r * 1.035)
          baseColor.g = Math.min(1, baseColor.g * 1.012)
          baseColor.b = Math.max(0, baseColor.b * 0.985)
          std = new THREE.MeshStandardMaterial({
            map: mat.map ?? undefined,
            color: baseColor,
            transparent: mat.transparent,
            opacity: mat.opacity,
            side: mat.side,
            metalness: 0.1,
            roughness: 0.74,
            envMapIntensity: 0.5,
          })
          if (std.map) std.map.colorSpace = THREE.SRGBColorSpace
          basicToStandard.set(mat, std)
        }
        return std
      }

      root.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (!mesh.isMesh || !mesh.material) return
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(toStandard)
        } else {
          mesh.material = toStandard(mesh.material)
        }
        mesh.castShadow = false
        mesh.receiveShadow = false
      })

      basicToStandard.forEach((_, basic) => basic.dispose())
    } else {
      root.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (!mesh.isMesh) return
        mesh.castShadow = false
        mesh.receiveShadow = false
      })
    }

    const box = new THREE.Box3().setFromObject(root)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const TARGET_SIZE = 44
    const s = TARGET_SIZE / maxDim
    return {
      cityRoot: root,
      scale: s,
      offset: [
        -center.x * s + CITY_PLAZA_OFFSET.x,
        -box.min.y * s,
        -center.z * s + CITY_PLAZA_OFFSET.z,
      ] as [number, number, number],
    }
  }, [scene, useLitMaterials])

  return (
    <group rotation={[0, CITY_YAW_RAD, 0]}>
      <group position={offset}>
        <primitive object={cityRoot} scale={scale} />
      </group>
    </group>
  )
}

/** Horizon-tinted fog color — keep in sync with linear fog in Scene3D / JourneyScene */
export const CITY_FOG_COLOR = '#dde6ef'

export function CitySkyGradient() {
  return (
    <mesh scale={[-1, 1, 1]} renderOrder={-1000} frustumCulled={false}>
      <sphereGeometry args={[180, 64, 40]} />
      <shaderMaterial
        depthWrite={false}
        side={THREE.BackSide}
        uniforms={{}}
        vertexShader={`
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vPos;
          void main() {
            vec3 d = normalize(vPos);
            float h = d.y * 0.5 + 0.5;
            vec3 zenith = vec3(0.40, 0.58, 0.88);
            vec3 upper = vec3(0.52, 0.70, 0.92);
            vec3 horizon = vec3(0.90, 0.86, 0.82);
            vec3 groundHaze = vec3(0.95, 0.93, 0.91);
            vec3 col = mix(groundHaze, horizon, smoothstep(0.0, 0.32, h));
            col = mix(col, upper, smoothstep(0.32, 0.68, h));
            col = mix(col, zenith, smoothstep(0.68, 1.0, h));
            float az = atan(d.z, d.x);
            float el = asin(clamp(d.y, -1.0, 1.0));
            float w1 = sin(az * 2.1 + el * 2.8) * 0.5 + 0.5;
            float w2 = sin(az * 1.15 - el * 1.9 + 1.7) * 0.5 + 0.5;
            float clouds = smoothstep(0.38, 0.72, w1) * 0.07 + smoothstep(0.42, 0.78, w2) * 0.055;
            col += vec3(1.0, 0.99, 0.97) * clouds;
            vec3 sunDir = normalize(vec3(0.32, 0.52, -0.79));
            float sun = pow(max(dot(d, sunDir), 0.0), 64.0);
            col += vec3(1.0, 0.96, 0.88) * sun * 0.42;
            float sunHalo = pow(max(dot(d, sunDir), 0.0), 8.0) * 0.12;
            col += vec3(1.0, 0.92, 0.82) * sunHalo;
            float aerial = pow(1.0 - max(d.y, 0.0), 2.2) * 0.045;
            col += vec3(0.72, 0.84, 0.98) * aerial;
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  )
}

/**
 * Distant fill below the city floor (y≈0); polygon offset avoids z-fight with terrain.
 */
function CityGroundShaderMat() {
  const uniforms = useMemo(
    () => ({
      uCenter: { value: new THREE.Color('#efe8de') },
      uMid: { value: new THREE.Color('#e2eaf2') },
      uEdge: { value: new THREE.Color('#d2dde8') },
    }),
    []
  )
  return (
    <shaderMaterial
      uniforms={uniforms}
      polygonOffset
      polygonOffsetFactor={2}
      polygonOffsetUnits={2}
      vertexShader={`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        varying vec2 vUv;
        uniform vec3 uCenter;
        uniform vec3 uMid;
        uniform vec3 uEdge;
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float r = length(p);
          vec3 c = mix(uCenter, uMid, smoothstep(0.0, 0.45, r));
          c = mix(c, uEdge, smoothstep(0.45, 1.15, r));
          float grain = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) * 0.02;
          c += vec3(grain);
          gl_FragColor = vec4(c, 1.0);
        }
      `}
    />
  )
}

export function CityGroundPlane() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]}>
        <planeGeometry args={[120, 120, 1, 1]} />
        <CityGroundShaderMat />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <ringGeometry args={[22, 58, 56]} />
        <meshBasicMaterial
          color="#e8eef6"
          transparent
          opacity={0.55}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.105, 0]}>
        <ringGeometry args={[58, 95, 64]} />
        <meshBasicMaterial
          color="#cfd9e6"
          transparent
          opacity={0.22}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
    </group>
  )
}
