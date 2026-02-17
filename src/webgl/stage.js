import * as THREE from 'three';

/**
 * Minimal story stage: no procedural city.
 * Single pod, one building, clean ground, soft sky gradient.
 * Used for step-based narrative (click Next to advance).
 */
const POD_X = 0;
const POD_Z = 0;
const BUILDING_X = 14;
const BUILDING_Z = 10;

export function createStage(scene) {
  const group = new THREE.Group();

  // Ground — single plane, soft tone
  const groundGeom = new THREE.PlaneGeometry(80, 80);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0xe8eef2,
    roughness: 0.85,
    metalness: 0.05
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

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

  // One building in the background (destination)
  const buildGeom = new THREE.BoxGeometry(4, 8, 3);
  const buildMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 1
  });
  const building = new THREE.Mesh(buildGeom, buildMat);
  building.position.set(BUILDING_X, 4, BUILDING_Z);
  building.castShadow = true;
  building.receiveShadow = true;
  group.add(building);

  scene.add(group);

  function setPodGlow(intensity) {
    ring.material.emissiveIntensity = intensity;
  }

  return {
    group,
    podPosition: new THREE.Vector3(POD_X, 0, POD_Z),
    buildingPosition: new THREE.Vector3(BUILDING_X, 0, BUILDING_Z),
    doorstep: new THREE.Vector3(BUILDING_X + 1.2, 0.25, BUILDING_Z + 0.8),
    setPodGlow
  };
}
