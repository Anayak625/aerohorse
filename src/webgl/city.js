import * as THREE from 'three';

// Street grid: blocks separated by streets (main roads)
const N_BLOCKS = 10;  // blocks per axis
const BLOCK_SIZE = 7;
const STREET_WIDTH = 4.5;
const CELL = BLOCK_SIZE + STREET_WIDTH;

// Paths within blocks (pedestrian / alley)
const PATH_WIDTH = 0.3;
const LOTS_PER_BLOCK = 4;  // 4x4 lots → paths between them form a clear grid inside block

// Building variety: random width, depth, height (city-like mix)
const BUILDING_HEIGHT_MIN = 1.2;
const BUILDING_HEIGHT_MAX = 20;
const BUILDING_WIDTH_MIN = 0.6;
const BUILDING_WIDTH_MAX = 0.98;
const BUILDING_DEPTH_MIN = 0.6;
const BUILDING_DEPTH_MAX = 0.98;
const EMPTY_LOT_CHANCE = 0.06;  // small plazas / gaps
const BUILDING_COLORS = [0x0c1322, 0x0f1629, 0x121a2d, 0x0d1525, 0x0a0e17, 0x10182a];

/**
 * City with main streets, block-internal paths, and buildings of random
 * width, depth, and height. Reads like a real street grid with varied skyline.
 */
export function createCity(scene) {
  const group = new THREE.Group();
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const buildings = [];
  const streetPositions = [];
  const totalSize = N_BLOCKS * CELL + STREET_WIDTH;
  const half = totalSize / 2;

  const lotSize = BLOCK_SIZE / LOTS_PER_BLOCK;
  // Max building size per lot so they don't overlap paths between lots
  const buildArea = Math.max(0.5, lotSize - PATH_WIDTH);

  for (let bi = 0; bi < N_BLOCKS; bi++) {
    for (let bj = 0; bj < N_BLOCKS; bj++) {
      const blockOx = bi * CELL + STREET_WIDTH - half;
      const blockOz = bj * CELL + STREET_WIDTH - half;

      for (let li = 0; li < LOTS_PER_BLOCK; li++) {
        for (let lj = 0; lj < LOTS_PER_BLOCK; lj++) {
          const lotCenterX = blockOx + (li + 0.5) * lotSize;
          const lotCenterZ = blockOz + (lj + 0.5) * lotSize;

          if (Math.random() < EMPTY_LOT_CHANCE) continue;
          
          // Density reduction: skip 40% of potential lots
          if (Math.random() < 0.4) continue;

          const wFrac = BUILDING_WIDTH_MIN + Math.random() * (BUILDING_WIDTH_MAX - BUILDING_WIDTH_MIN);
          const dFrac = BUILDING_DEPTH_MIN + Math.random() * (BUILDING_DEPTH_MAX - BUILDING_DEPTH_MIN);
          const width = buildArea * wFrac;
          const depth = buildArea * dFrac;
          const r = Math.random();
          const height = BUILDING_HEIGHT_MIN + (BUILDING_HEIGHT_MAX - BUILDING_HEIGHT_MIN) *
            (r < 0.15 ? Math.random() * 0.4 : r < 0.5 ? 0.3 + Math.random() * 0.4 : 0.5 + Math.random() * 0.5);

          const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.2, // Partial glass effect
            thickness: 1.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
          });
          const mesh = new THREE.Mesh(boxGeometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.scale.set(width, height, depth);
          mesh.position.set(lotCenterX, height * 0.5, lotCenterZ);
          mesh.userData = { type: 'building', blockI: bi, blockJ: bj, lotI: li, lotJ: lj };
          group.add(mesh);
          buildings.push({ mesh, x: lotCenterX, z: lotCenterZ, height });
        }
      }
    }
  }

  // Street intersection positions for pod placement
  for (let si = 0; si <= N_BLOCKS; si++) {
    for (let sj = 0; sj <= N_BLOCKS; sj++) {
      const sx = si * CELL + STREET_WIDTH * 0.5 - half;
      const sz = sj * CELL + STREET_WIDTH * 0.5 - half;
      streetPositions.push(new THREE.Vector3(sx, 0, sz));
    }
  }

  scene.add(group);

  // Ground (clean white)
  const groundGeom = new THREE.PlaneGeometry(totalSize * 1.5, totalSize * 1.5);
  const ground = new THREE.Mesh(
    groundGeom,
    new THREE.MeshStandardMaterial({ color: 0xf5f7fa, roughness: 0.8, metalness: 0.05 })
  );
  ground.receiveShadow = true;
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  scene.add(ground);

  // Main streets (slightly darker than ground, subtle)
  const streetMat = new THREE.MeshStandardMaterial({
    color: 0xe6eef5,
    roughness: 0.6,
    metalness: 0.1,
  });
  const streetY = 0.015;
  const streetGeomX = new THREE.PlaneGeometry(STREET_WIDTH, totalSize * 1.1);
  streetGeomX.rotateX(-Math.PI / 2);
  for (let si = 0; si <= N_BLOCKS; si++) {
    const stripX = si * CELL + STREET_WIDTH * 0.5 - half;
    const mesh = new THREE.Mesh(streetGeomX, streetMat.clone());
    mesh.receiveShadow = true;
    mesh.position.set(stripX, streetY, 0);
    scene.add(mesh);
  }
  const streetGeomZ = new THREE.PlaneGeometry(totalSize * 1.1, STREET_WIDTH);
  streetGeomZ.rotateX(-Math.PI / 2);
  for (let sj = 0; sj <= N_BLOCKS; sj++) {
    const stripZ = sj * CELL + STREET_WIDTH * 0.5 - half;
    const mesh = new THREE.Mesh(streetGeomZ, streetMat.clone());
    mesh.receiveShadow = true;
    mesh.position.set(0, streetY, stripZ);
    scene.add(mesh);
  }

  // Paths within blocks (subtle difference)
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8,
    roughness: 0.8,
  });
  const pathY = 0.018;
  for (let bi = 0; bi < N_BLOCKS; bi++) {
    for (let bj = 0; bj < N_BLOCKS; bj++) {
      const blockOx = bi * CELL + STREET_WIDTH - half;
      const blockOz = bj * CELL + STREET_WIDTH - half;
      // Horizontal paths (along X) between rows of lots
      for (let p = 1; p < LOTS_PER_BLOCK; p++) {
        const pathZ = blockOz + p * lotSize;
        const pathGeom = new THREE.PlaneGeometry(BLOCK_SIZE, PATH_WIDTH);
        pathGeom.rotateX(-Math.PI / 2);
        const pathMesh = new THREE.Mesh(pathGeom, pathMat);
        pathMesh.receiveShadow = true;
        pathMesh.position.set(blockOx + BLOCK_SIZE * 0.5, pathY, pathZ);
        scene.add(pathMesh);
      }
      // Vertical paths (along Z) between columns of lots
      for (let p = 1; p < LOTS_PER_BLOCK; p++) {
        const pathX = blockOx + p * lotSize;
        const pathGeom = new THREE.PlaneGeometry(PATH_WIDTH, BLOCK_SIZE);
        pathGeom.rotateX(-Math.PI / 2);
        const pathMesh = new THREE.Mesh(pathGeom, pathMat);
        pathMesh.receiveShadow = true;
        pathMesh.position.set(pathX, pathY, blockOz + BLOCK_SIZE * 0.5);
        scene.add(pathMesh);
      }
    }
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
