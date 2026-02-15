import * as THREE from 'three';

// Street grid: blocks separated by streets
const N_BLOCKS = 10;           // number of blocks per axis
const BLOCK_SIZE = 7;         // units per block (building area)
const STREET_WIDTH = 3.5;     // width of streets between blocks
const CELL = BLOCK_SIZE + STREET_WIDTH;

// Building variety
const BUILDING_HEIGHT_MIN = 1.5;
const BUILDING_HEIGHT_MAX = 16;
const BUILDING_WIDTH_MIN = 0.4;   // fraction of lot
const BUILDING_WIDTH_MAX = 0.95;
const BUILDING_DEPTH_MIN = 0.4;
const BUILDING_DEPTH_MAX = 0.95;
const LOTS_PER_BLOCK = 3;         // 3x3 lots per block → paths between buildings

/**
 * City with a clear street grid and blocks filled with buildings of random
 * width, depth, and height. Streets and block-internal paths stay clear.
 */
export function createCity(scene) {
  const group = new THREE.Group();
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x0f1629,
    roughness: 0.9,
    metalness: 0.1,
    emissive: 0x0a0e17,
  });

  const buildings = [];
  const streetPositions = [];
  const totalSize = N_BLOCKS * CELL + STREET_WIDTH; // +1 street on far side
  const half = totalSize / 2;

  for (let bi = 0; bi < N_BLOCKS; bi++) {
    for (let bj = 0; bj < N_BLOCKS; bj++) {
      // Block origin (world)
      const blockOx = bi * CELL + STREET_WIDTH - half;
      const blockOz = bj * CELL + STREET_WIDTH - half;
      const lotSize = BLOCK_SIZE / LOTS_PER_BLOCK;

      // Buildings within block: one per lot, random size within lot
      for (let li = 0; li < LOTS_PER_BLOCK; li++) {
        for (let lj = 0; lj < LOTS_PER_BLOCK; lj++) {
          const lotCenterX = blockOx + (li + 0.5) * lotSize;
          const lotCenterZ = blockOz + (lj + 0.5) * lotSize;

          const wFrac = BUILDING_WIDTH_MIN + Math.random() * (BUILDING_WIDTH_MAX - BUILDING_WIDTH_MIN);
          const dFrac = BUILDING_DEPTH_MIN + Math.random() * (BUILDING_DEPTH_MAX - BUILDING_DEPTH_MIN);
          const width = lotSize * wFrac;
          const depth = lotSize * dFrac;
          const height = BUILDING_HEIGHT_MIN + Math.random() * (BUILDING_HEIGHT_MAX - BUILDING_HEIGHT_MIN);

          const mesh = new THREE.Mesh(boxGeometry, material.clone());
          mesh.scale.set(width, height, depth);
          mesh.position.set(lotCenterX, height * 0.5, lotCenterZ);
          mesh.userData = { type: 'building', blockI: bi, blockJ: bj, lotI: li, lotJ: lj };
          group.add(mesh);
          buildings.push({ mesh, x: lotCenterX, z: lotCenterZ, height });
        }
      }
    }
  }

  // Street intersection positions (where streets cross) for pod placement
  for (let si = 0; si <= N_BLOCKS; si++) {
    for (let sj = 0; sj <= N_BLOCKS; sj++) {
      const sx = si * CELL + STREET_WIDTH * 0.5 - half;
      const sz = sj * CELL + STREET_WIDTH * 0.5 - half;
      streetPositions.push(new THREE.Vector3(sx, 0, sz));
    }
  }

  scene.add(group);

  // Ground plane first (base layer)
  const groundGeom = new THREE.PlaneGeometry(totalSize * 1.2, totalSize * 1.2);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x050810,
    roughness: 1,
    metalness: 0,
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);

  // Street surfaces on top (slightly raised so they read as roads)
  const streetMat = new THREE.MeshStandardMaterial({
    color: 0x0d1117,
    roughness: 1,
    metalness: 0,
  });
  const streetGeomX = new THREE.PlaneGeometry(STREET_WIDTH, totalSize * 1.1);
  streetGeomX.rotateX(-Math.PI / 2);
  for (let si = 0; si <= N_BLOCKS; si++) {
    const stripX = si * CELL + STREET_WIDTH * 0.5 - half;
    const mesh = new THREE.Mesh(streetGeomX, streetMat);
    mesh.position.set(stripX, 0.008, 0);
    scene.add(mesh);
  }
  const streetGeomZ = new THREE.PlaneGeometry(totalSize * 1.1, STREET_WIDTH);
  streetGeomZ.rotateX(-Math.PI / 2);
  for (let sj = 0; sj <= N_BLOCKS; sj++) {
    const stripZ = sj * CELL + STREET_WIDTH * 0.5 - half;
    const mesh = new THREE.Mesh(streetGeomZ, streetMat);
    mesh.position.set(0, 0.008, stripZ);
    scene.add(mesh);
  }

  return {
    group,
    buildings,
    streetPositions,
    ground,
    getGridSize: () => ({ GRID_SIZE: N_BLOCKS, SPACING: CELL, half: totalSize * 0.5 }),
    getStreetGridParams: () => ({ CELL, STREET_WIDTH, half: totalSize * 0.5, N_BLOCKS }),
  };
}
