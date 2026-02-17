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
const BUILDING_COLORS = [
  0x0c1322, 0x0f1629, 0x121a2d, 0x0d1525, 0x0a0e17, 0x10182a,
  0x1a2332, 0x243044, 0x2d3a52, 0x3d4a62
];

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


  // Window Texture Generation
  function createWindowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 32, 64);
    
    // Random lit windows
    ctx.fillStyle = '#ffeb3b'; // Warm light
    // or sometimes cool light
    if (Math.random() > 0.7) ctx.fillStyle = '#e0f7fa';

    for (let y = 0; y < 64; y += 8) {
      for (let x = 0; x < 32; x += 8) {
        if (Math.random() > 0.6) {
          ctx.fillRect(x + 1, y + 1, 6, 6);
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  // Generate a few shared window textures
  const windowTextures = [createWindowTexture(), createWindowTexture(), createWindowTexture()];

  for (let bi = 0; bi < N_BLOCKS; bi++) {
    for (let bj = 0; bj < N_BLOCKS; bj++) {
      const blockOx = bi * CELL + STREET_WIDTH - half;
      const blockOz = bj * CELL + STREET_WIDTH - half;

      for (let li = 0; li < LOTS_PER_BLOCK; li++) {
        for (let lj = 0; lj < LOTS_PER_BLOCK; lj++) {
          const lotCenterX = blockOx + (li + 0.5) * lotSize;
          const lotCenterZ = blockOz + (lj + 0.5) * lotSize;

          if (Math.random() < EMPTY_LOT_CHANCE) continue;
          if (Math.random() < 0.4) continue;

          const wFrac = BUILDING_WIDTH_MIN + Math.random() * (BUILDING_WIDTH_MAX - BUILDING_WIDTH_MIN);
          const dFrac = BUILDING_DEPTH_MIN + Math.random() * (BUILDING_DEPTH_MAX - BUILDING_DEPTH_MIN);
          const width = buildArea * wFrac;
          const depth = buildArea * dFrac;
          const r = Math.random();
          const height = BUILDING_HEIGHT_MIN + (BUILDING_HEIGHT_MAX - BUILDING_HEIGHT_MIN) *
            (r < 0.15 ? Math.random() * 0.4 : r < 0.5 ? 0.3 + Math.random() * 0.4 : 0.5 + Math.random() * 0.5);

          const color = BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)];
          const isGlass = Math.random() < 0.2;
          
          let material;
          if (isGlass) {
            material = new THREE.MeshPhysicalMaterial({
              color: 0xe8eef4,
              roughness: 0.1,
              metalness: 0.1,
              transmission: 0.6, // More glass-like
              thickness: 1.0,
              transparent: true,
              opacity: 1
            });
          } else {
            // Emissive windows for standard buildings
            const tex = windowTextures[Math.floor(Math.random() * windowTextures.length)];
            material = new THREE.MeshStandardMaterial({
              color,
              roughness: 0.4,
              metalness: 0.1,
              map: tex, // Use texture for base color variation too? Maybe not.
              emissiveMap: tex,
              emissive: 0xffffff,
              emissiveIntensity: Math.random() * 0.8 + 0.2
            });
            // Adjust UVs for window tiling
            material.onBeforeCompile = (shader) => {
              // Simple UV scaling not easily done here without modifying geometry UVs or shader
              // For box geometry, UVs correspond to faces. 
              // Easier to just clone geometry and scale UVs? Or just accept default mapping (might look stretched)
            };
          }

          const mesh = new THREE.Mesh(boxGeometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.scale.set(width, height, depth);
          mesh.position.set(lotCenterX, height * 0.5, lotCenterZ);
          
          // Fix UVs for repeating windows
          // BoxGeometry UVs are 0..1 per face. We want them to repeat based on size.
          // Since we share geometry, we can't modify UVs per instance easily without multiple geometries.
          // For now, let's skip perfect mapping and just use the texture. 
          // Ideally we'd use a custom shader or multiple geometries.
          // Let's create unique geometry for each building to fix UVs (expensive? 100 buildings is fine)
          const geom = new THREE.BoxGeometry(width, height, depth);
          // Scale UVs
          const uvs = geom.attributes.uv;
          for (let i = 0; i < uvs.count; i++) {
             // Map based on X/Y/Z dimensions roughly?
             // Top face is difficult to distinguish without normal check.
             // Simplification: just scale all UVs by height
             uvs.setY(i, uvs.getY(i) * height * 0.5); 
          }
          mesh.geometry = geom;

          group.add(mesh);
          buildings.push({ mesh, x: lotCenterX, z: lotCenterZ, height });
        }
      }
    }
  }

  // --- Traffic System ---
  const trafficGroup = new THREE.Group();
  scene.add(trafficGroup);
  const cars = [];
  const carGeom = new THREE.BoxGeometry(0.6, 0.1, 0.3);
  const carMatHead = new THREE.MeshBasicMaterial({ color: 0xffaa00 }); // Headlights (yellow/white)
  const carMatTail = new THREE.MeshBasicMaterial({ color: 0xff0055 }); // Taillights (red)

  // Initialize some cars
  const NUM_CARS = 40;
  for (let i = 0; i < NUM_CARS; i++) {
    const isX = Math.random() > 0.5;
    const mesh = new THREE.Mesh(carGeom, Math.random() > 0.5 ? carMatHead : carMatTail);
    
    // Pick a random street
    const lanes = isX ? N_BLOCKS : N_BLOCKS; 
    const laneIdx = Math.floor(Math.random() * lanes);
    const pos = (laneIdx * CELL + STREET_WIDTH * 0.5 - half);
    
    const car = {
      mesh,
      isX,
      lanePos: pos,
      travelPos: (Math.random() - 0.5) * totalSize,
      speed: (Math.random() * 5 + 3) * (Math.random() > 0.5 ? 1 : -1)
    };
    
    if (isX) {
      mesh.position.set(car.travelPos, 0.05, pos);
      mesh.rotation.y = car.speed > 0 ? 0 : Math.PI;
    } else {
      mesh.position.set(pos, 0.05, car.travelPos);
      mesh.rotation.y = car.speed > 0 ? -Math.PI / 2 : Math.PI / 2;
    }
    
    trafficGroup.add(mesh);
    cars.push(car);
  }

  function updateTraffic(delta) {
    const limit = totalSize / 2 + 5;
    cars.forEach(c => {
      c.travelPos += c.speed * delta;
      
      // Wrap around
      if (c.travelPos > limit) c.travelPos = -limit;
      if (c.travelPos < -limit) c.travelPos = limit;
      
      if (c.isX) {
        c.mesh.position.x = c.travelPos;
        // Make it float slightly for "flying car" or just ground car? "Urban delivery" implies ground too or air?
        // Let's keep them on ground as traffic.
      } else {
        c.mesh.position.z = c.travelPos;
      }
    });
  }

  // Reuse previous code for Street intersections and garden...
  // (Assuming previous logic for streetPositions and garden is preserved or I need to rewrite it if I replaced the block)
  
  // NOTE: The previous replacement replaced the LOOPS. I need to ensure I didn't delete the rest of the file.
  // The 'EndLine' was 305 which is the end of file. So I need to include the rest of the file content in my replacement 
  // OR use a more targeted replacement.
  // But I am rewriting the building generation loop heavily.
  // I will re-include the garden and return statement.

  // Street intersection positions for pod placement
  for (let si = 0; si <= N_BLOCKS; si++) {
    for (let sj = 0; sj <= N_BLOCKS; sj++) {
      const sx = si * CELL + STREET_WIDTH * 0.5 - half;
      const sz = sj * CELL + STREET_WIDTH * 0.5 - half;
      streetPositions.push(new THREE.Vector3(sx, 0, sz));
    }
  }

  scene.add(group);

  // Garden patch logic (kept same)
  const gardenPatchGeom = new THREE.PlaneGeometry(8, 8);
  const gardenPatchMat = new THREE.MeshStandardMaterial({
    color: 0xbbddaa,
    roughness: 0.9,
    metalness: 0,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const gardenPatch = new THREE.Mesh(gardenPatchGeom, gardenPatchMat);
  gardenPatch.rotation.x = -Math.PI / 2;
  gardenPatch.position.y = 0.01;
  gardenPatch.visible = false;
  scene.add(gardenPatch);

  const gardenProps = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9, metalness: 0 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.95, metalness: 0 });
  [[-2.2, 0, 1.8], [2.6, 0, -1.2], [-1.1, 0, -2.4]].forEach(([ox, _, oz]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.9, 8), trunkMat);
    trunk.position.set(ox, 0.45, oz);
    trunk.castShadow = true;
    gardenProps.add(trunk);
    const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.4, 8), foliageMat);
    foliage.position.set(ox, 1.35, oz);
    foliage.castShadow = true;
    gardenProps.add(foliage);
  });
  gardenProps.visible = false;
  scene.add(gardenProps);

  function setGardenPatchPosition(x, z) {
    gardenPatch.position.x = x;
    gardenPatch.position.z = z;
    gardenProps.position.set(x, 0, z);
  }

  function updateForPhase(phaseIndex, progress, focusPoint) {
    const ease = (t) => t * t * (3 - 2 * t);
    const phaseConfig = [
      { inner: 0, outer: 999, far: 1 },           
      { inner: 0, outer: 50, far: 0.82 },         
      { inner: 5, outer: 11, far: 0.06 },         
      { inner: 7, outer: 16, far: 0.14 },         
      { inner: 7, outer: 16, far: 0.14 }          
    ];

    buildings.forEach((b) => {
      const dx = b.x - focusPoint.x;
      const dz = b.z - focusPoint.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      let opacity = 1;
      const cfg = phaseConfig[phaseIndex];

      if (phaseIndex === 0) {
        opacity = 1;
      } else if (phaseIndex === 1) {
        if (dist <= cfg.inner) opacity = 1;
        else if (dist < cfg.outer) opacity = 1 - (1 - cfg.far) * ease((dist - cfg.inner) / (cfg.outer - cfg.inner));
        else opacity = cfg.far;
      } else if (phaseIndex === 2 || phaseIndex === 3) {
        if (dist <= cfg.inner) opacity = 1;
        else if (dist <= cfg.outer) {
          const raw = (dist - cfg.inner) / (cfg.outer - cfg.inner);
          opacity = 1 - (1 - cfg.far) * ease(raw);
        } else opacity = cfg.far;
      } else if (phaseIndex === 4) {
        const revealT = ease(Math.min(1, (progress - 0.78) / 0.22));
        const cfg4 = phaseConfig[3];
        let base = 1;
        if (dist > cfg4.outer) base = cfg4.far;
        else if (dist > cfg4.inner) {
          const raw = (dist - cfg4.inner) / (cfg4.outer - cfg4.inner);
          base = 1 - (1 - cfg4.far) * ease(raw);
        }
        opacity = base + (1 - base) * revealT;
      }
      b.mesh.material.opacity = Math.min(1, opacity);
    });

    const patchEase = (t) => t * t * (3 - 2 * t);
    if (phaseIndex === 2 || phaseIndex === 3) {
      const raw = phaseIndex === 2 ? Math.min(1, (progress - 0.38) / 0.12) : 1;
      const t = patchEase(raw);
      gardenPatch.visible = true;
      gardenPatch.scale.setScalar(t);
      gardenPatch.material.opacity = 0.6 * t;
      gardenProps.visible = true;
      gardenProps.scale.setScalar(t);
    } else if (phaseIndex === 4) {
      const t = 1 - Math.min(1, (progress - 0.78) / 0.14);
      gardenPatch.visible = t > 0;
      gardenPatch.material.opacity = 0.6 * t;
      gardenPatch.scale.setScalar(Math.max(0.01, t));
      gardenProps.visible = t > 0;
      gardenProps.scale.setScalar(Math.max(0.01, t));
    } else {
      gardenPatch.visible = false;
      gardenProps.visible = false;
    }
  }

  // Ground 
  const groundGeom = new THREE.PlaneGeometry(totalSize * 1.5, totalSize * 1.5);
  const ground = new THREE.Mesh(
    groundGeom,
    new THREE.MeshStandardMaterial({ color: 0xf5f7fa, roughness: 0.8, metalness: 0.05 })
  );
  ground.receiveShadow = true;
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  scene.add(ground);

  // Streets
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

  // Paths
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8,
    roughness: 0.8,
  });
  const pathY = 0.018;
  for (let bi = 0; bi < N_BLOCKS; bi++) {
    for (let bj = 0; bj < N_BLOCKS; bj++) {
      const blockOx = bi * CELL + STREET_WIDTH - half;
      const blockOz = bj * CELL + STREET_WIDTH - half;
      for (let p = 1; p < LOTS_PER_BLOCK; p++) {
        const pathZ = blockOz + p * lotSize;
        const pathGeom = new THREE.PlaneGeometry(BLOCK_SIZE, PATH_WIDTH);
        pathGeom.rotateX(-Math.PI / 2);
        const pathMesh = new THREE.Mesh(pathGeom, pathMat);
        pathMesh.receiveShadow = true;
        pathMesh.position.set(blockOx + BLOCK_SIZE * 0.5, pathY, pathZ);
        scene.add(pathMesh);
      }
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
    gardenPatch,
    setGardenPatchPosition,
    updateForPhase,
    updateTraffic, // New export
    getGridSize: () => ({ GRID_SIZE: N_BLOCKS, SPACING: CELL, half: totalSize * 0.5 }),
    getStreetGridParams: () => ({ CELL, STREET_WIDTH, half: totalSize * 0.5, N_BLOCKS }),
  };
}
