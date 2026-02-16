import * as THREE from 'three';

/**
 * The Package
 * Simple box with branding.
 */
export function createPackage() {
  const geom = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const mat = new THREE.MeshStandardMaterial({ 
    color: 0xffaa00, // Gold/Orange package
    roughness: 0.8
  });
  
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  return mesh;
}
