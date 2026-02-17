import * as THREE from 'three';

/**
 * Minimal story stage: pod, destination building, and a small city skyline.
 * Clean ground, soft sky; used for step-based narrative (click Next to advance).
 */
// Front-facing layout: rotated 90° around Y (x,y,z)→(-z,y,x) from original
const POD_X = -6;
const POD_Z = 10;
const BUILDING_X = -14;
const BUILDING_Z = 22;

// City building palette — varied but cohesive
const BUILDING_COLORS = [0xe8ecf0, 0xdce2eb, 0xf0f2f6, 0xdfe4ea, 0xffffff, 0xe2e8f0];

function addBuilding(group, x, z, w, h, d, color, options = {}) {
  const geom = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({
    color: color ?? 0xe8ecf0,
    roughness: options.roughness ?? 0.2,
    metalness: options.metalness ?? 0.15,
    ...options
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(x, h * 0.5, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (options.rotation) mesh.rotation.y = options.rotation;
  group.add(mesh);
  return mesh;
}

export function createStage(scene) {
  const group = new THREE.Group();

  // Ground — soft tone with subtle warmth
  const groundGeom = new THREE.PlaneGeometry(80, 80);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0xe4eaf0,
    roughness: 0.9,
    metalness: 0.02
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  // Subtle street strip in front of main building (delivery zone)
  const streetGeom = new THREE.PlaneGeometry(12, 6);
  streetGeom.rotateX(-Math.PI / 2);
  const streetMat = new THREE.MeshStandardMaterial({
    color: 0xd8dce4,
    roughness: 0.75,
    metalness: 0.05
  });
  const street = new THREE.Mesh(streetGeom, streetMat);
  street.position.set(BUILDING_X, 0.008, BUILDING_Z + 4);
  street.receiveShadow = true;
  group.add(street);

  // One delivery pod (hexagonal kiosk)
  const podGeom = new THREE.CylinderGeometry(0.9, 0.9, 2.6, 6);
  const capGeom = new THREE.CylinderGeometry(1.05, 0.9, 0.2, 6);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a5f,
    roughness: 0.25,
    metalness: 0.65
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0x00ffcc,
    emissive: 0x00ffcc,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0
  });
  const podGroup = new THREE.Group();
  podGroup.position.set(POD_X, 1.25, POD_Z);
  const body = new THREE.Mesh(podGeom, bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  podGroup.add(body);
  const cap = new THREE.Mesh(capGeom, bodyMat);
  cap.position.y = 1.35;
  podGroup.add(cap);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.06, 8, 16),
    glowMat.clone()
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.65;
  podGroup.add(ring);
  group.add(podGroup);

  // Main destination building — clean modern block
  addBuilding(group, BUILDING_X, BUILDING_Z, 4, 8, 3, 0xf5f6f8, {
    roughness: 0.12,
    metalness: 0.08
  });

  // City skyline: background buildings for depth and scale
  addBuilding(group, BUILDING_X - 8, BUILDING_Z + 6, 5, 12, 4, BUILDING_COLORS[0], { roughness: 0.25 });
  addBuilding(group, BUILDING_X + 6, BUILDING_Z + 8, 3.5, 6, 2.5, BUILDING_COLORS[1], { roughness: 0.22 });
  addBuilding(group, BUILDING_X - 4, BUILDING_Z + 14, 4, 9, 3, BUILDING_COLORS[2], { roughness: 0.2 });
  addBuilding(group, BUILDING_X + 10, BUILDING_Z + 12, 3, 5, 2, BUILDING_COLORS[3], { roughness: 0.28 });
  addBuilding(group, BUILDING_X - 12, BUILDING_Z + 10, 4.5, 7, 3.5, BUILDING_COLORS[4], { roughness: 0.24 });
  addBuilding(group, BUILDING_X + 2, BUILDING_Z + 18, 5.5, 11, 4, BUILDING_COLORS[5], { roughness: 0.18 });

  scene.add(group);

  function setPodGlow(intensity) {
    ring.material.emissiveIntensity = intensity;
  }

  return {
    group,
    podPosition: new THREE.Vector3(POD_X, 0, POD_Z),
    buildingPosition: new THREE.Vector3(BUILDING_X, 0, BUILDING_Z),
    doorstep: new THREE.Vector3(BUILDING_X - 1, 0.25, BUILDING_Z + 1.5),
    setPodGlow
  };
}
