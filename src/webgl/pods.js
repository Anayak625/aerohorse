import * as THREE from 'three';

const POD_COUNT = 48;
const ACCENT = 0xe0359c; /* Aerohorse magenta */
const RADIUS = 2.2;

/**
 * Instanced meshes for delivery pods: small glowing nodes.
 * Pulse via scale/emissive in update; support hover highlight and coverage radius.
 */
const POD_HEIGHT_ABOVE_GROUND = 0.6;

export function createPods(scene, city) {
  const { streetPositions, getGridSize } = city;
  const N_BLOCKS = getGridSize().GRID_SIZE;
  const cols = N_BLOCKS + 1;

  // Place pods on street intersections (not on buildings); store grid indices for street-aligned paths
  const positions = [];
  const gridIndices = []; // { si, sj } per pod
  const used = new Set();
  while (positions.length < POD_COUNT && used.size < streetPositions.length) {
    const i = Math.floor(Math.random() * streetPositions.length);
    if (used.has(i)) continue;
    used.add(i);
    const street = streetPositions[i];
    positions.push(new THREE.Vector3(street.x, POD_HEIGHT_ABOVE_GROUND, street.z));
    gridIndices.push({ si: Math.floor(i / cols), sj: i % cols });
  }

  const geometry = new THREE.SphereGeometry(0.35, 12, 10);
  const material = new THREE.MeshStandardMaterial({
    color: 0xd03090,
    emissive: ACCENT,
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.2,
  });

  const instanced = new THREE.InstancedMesh(geometry, material, POD_COUNT);
  instanced.count = POD_COUNT;
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  const dummy = new THREE.Object3D();

  positions.forEach((pos, i) => {
    dummy.position.copy(pos);
    dummy.updateMatrix();
    instanced.setMatrixAt(i, dummy.matrix);
    instanced.setColorAt(i, color.setHex(ACCENT));
  });
  instanced.instanceMatrix.needsUpdate = true;
  if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;

  scene.add(instanced);

  // Coverage radius (one circle per pod; we'll show one at a time when focused)
  const radiusGeometry = new THREE.RingGeometry(RADIUS * 0.92, RADIUS, 32);
  const radiusMaterial = new THREE.MeshBasicMaterial({
    color: ACCENT,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
  });
  const radiusRing = new THREE.Mesh(radiusGeometry, radiusMaterial);
  radiusRing.rotation.x = -Math.PI / 2;
  radiusRing.visible = false;
  scene.add(radiusRing);

  const state = {
    positions,
    instanced,
    radiusRing,
    hoveredIndex: -1,
    focusedIndex: -1,
    time: 0,
  };

  function update(delta, sectionIndex, sectionProgress) {
    state.time += delta;
    const pulse = 0.85 + 0.15 * Math.sin(state.time * 2);

    for (let i = 0; i < POD_COUNT; i++) {
      dummy.position.copy(positions[i]);
      const isFocused = state.focusedIndex === i;
      const isHovered = state.hoveredIndex === i;
      const scale = (isFocused || isHovered) ? 1.25 * pulse : pulse;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
      const intensity = (isFocused || isHovered) ? 0.95 : 0.5 + 0.2 * Math.sin(state.time * 2 + i * 0.5);
      instanced.setColorAt(i, color.setHex(ACCENT).multiplyScalar(intensity));
    }
    instanced.instanceMatrix.needsUpdate = true;
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;

    if (state.focusedIndex >= 0 && state.focusedIndex < positions.length) {
      radiusRing.position.copy(positions[state.focusedIndex]);
      radiusRing.visible = sectionIndex >= 2; // Pod interaction section
    } else {
      radiusRing.visible = false;
    }
  }

  function setFocusedPod(index) {
    state.focusedIndex = index;
  }

  function setHoveredPod(index) {
    state.hoveredIndex = index;
  }

  function getPodPositions() {
    return positions;
  }

  function getPodGridIndices() {
    return gridIndices;
  }

  function getHoveredPodData() {
    const i = state.hoveredIndex >= 0 ? state.hoveredIndex : state.focusedIndex;
    if (i < 0) return null;
    return {
      index: i,
      position: positions[i],
      deliveryTime: '~12 min',
      coverage: '500m',
    };
  }

  return {
    instanced,
    radiusRing,
    update,
    setFocusedPod,
    setHoveredPod,
    getPodPositions,
    getPodGridIndices,
    getHoveredPodData,
    state,
  };
}
