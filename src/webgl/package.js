import * as THREE from 'three';

/**
 * The Package
 * Simple box with branding.
 */
export function createPackage() {
  const geom = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    roughness: 0.5,
    metalness: 0.15,
    emissive: 0xff8800,
    emissiveIntensity: 0.25
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
