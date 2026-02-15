import * as THREE from 'three';

const ACCENT = 0xe0359c; /* Aerohorse magenta */
const BLUE = 0x6a0dad;  /* brand purple */
const GREEN = 0x00cc88;

// Glow line material (tube with emissive + transparency)
function createLineMaterial(color, opacity = 0.3) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

/** Build path points along streets (Manhattan): A → (B.x, A.z) → B so paths follow the grid. */
function manhattanPathPoints(A, B, y) {
  const corner = new THREE.Vector3(B.x, y, A.z);
  return [A.clone(), corner, B.clone()];
}

/**
 * Network lines between pods, pathfinding route, and delivery flow lines.
 * Paths follow the street grid (no diagonals).
 */
export function createRoutes(scene, pods, city) {
  const positions = pods.getPodPositions();
  const gridIndices = pods.getPodGridIndices();
  const { CELL, STREET_WIDTH, half, N_BLOCKS } = city.getStreetGridParams();
  const linesGroup = new THREE.Group();
  scene.add(linesGroup);

  const tubeRadius = 0.12;
  const tubeRadialSegments = 6;

  /** World position of a street intersection from grid (si, sj). */
  function gridToWorld(si, sj) {
    const x = si * CELL + STREET_WIDTH * 0.5 - half;
    const z = sj * CELL + STREET_WIDTH * 0.5 - half;
    return new THREE.Vector3(x, positions[0].y, z);
  }

  // 1) Network lines between nearby pods — along streets only (Manhattan)
  const networkSegments = [];
  const maxDist = 18;
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const d = positions[i].distanceTo(positions[j]);
      if (d < maxDist) networkSegments.push([i, j]);
    }
  }

  const networkLines = [];
  networkSegments.forEach(([a, b]) => {
    const pts = manhattanPathPoints(positions[a], positions[b], positions[a].y);
    const curve3 = new THREE.CatmullRomCurve3(pts, false);
    const tubeGeom = new THREE.TubeGeometry(curve3, 16, tubeRadius * 0.6, tubeRadialSegments, false);
    const mat = createLineMaterial(ACCENT, 0.2);
    const tube = new THREE.Mesh(tubeGeom, mat);
    tube.userData = { type: 'network', a, b };
    linesGroup.add(tube);
    networkLines.push({ line: tube, a: positions[a], b: positions[b] });
  });

  // 2) Pathfinding route (node-to-node) — along streets
  const routeIndices = [0, 5, 12, 18, 25, 33];
  const routePoints = [];
  for (let r = 0; r < routeIndices.length - 1; r++) {
    const A = positions[routeIndices[r]];
    const B = positions[routeIndices[r + 1]];
    const pts = manhattanPathPoints(A, B, A.y);
    if (r === 0) routePoints.push(pts[0], pts[1], pts[2]);
    else routePoints.push(pts[1], pts[2]);
  }
  const routeCurve = new THREE.CatmullRomCurve3(routePoints, false);
  const routeTubeGeom = new THREE.TubeGeometry(routeCurve, 40, tubeRadius * 1.2, tubeRadialSegments, false);
  const routeMaterial = createLineMaterial(ACCENT, 0.7);
  const routeMesh = new THREE.Mesh(routeTubeGeom, routeMaterial);
  routeMesh.visible = false;
  linesGroup.add(routeMesh);

  // 3) Delivery flow: blue (drone) + green (rider). Rider path follows streets.
  const podIndex = 18;
  const podPos = positions[podIndex].clone();
  const podGrid = gridIndices[podIndex];
  const endSi = Math.max(0, Math.min(N_BLOCKS, podGrid.si + 2));
  const endSj = Math.max(0, Math.min(N_BLOCKS, podGrid.sj - 1));
  const streetEnd = gridToWorld(endSi, endSj);
  const skyStart = podPos.clone().add(new THREE.Vector3(-15, 25, 10));
  const droneCurve = new THREE.CatmullRomCurve3([skyStart, podPos], false);
  const riderPathPts = manhattanPathPoints(podPos, streetEnd, podPos.y);
  const riderCurve = new THREE.CatmullRomCurve3(riderPathPts, false);

  const droneTubeGeom = new THREE.TubeGeometry(droneCurve, 20, tubeRadius, tubeRadialSegments, false);
  const droneLine = new THREE.Mesh(droneTubeGeom, createLineMaterial(BLUE, 0.85));
  droneLine.visible = false;
  linesGroup.add(droneLine);

  const riderTubeGeom = new THREE.TubeGeometry(riderCurve, 20, tubeRadius, tubeRadialSegments, false);
  const riderLine = new THREE.Mesh(riderTubeGeom, createLineMaterial(GREEN, 0.85));
  riderLine.visible = false;
  linesGroup.add(riderLine);

  const state = {
    networkOpacity: 0,
    routeProgress: 0,
    deliveryProgress: 0,
  };

  function update(sectionIndex, sectionProgress) {
    if (sectionIndex === 0) {
      state.networkOpacity = Math.min(1, sectionProgress * 1.5);
    } else if (sectionIndex > 0) {
      state.networkOpacity = 1;
    }
    networkLines.forEach(({ line }) => {
      line.material.opacity = 0.08 + state.networkOpacity * 0.18;
    });

    if (sectionIndex === 1) {
      routeMesh.visible = true;
      state.routeProgress = sectionProgress;
      routeMaterial.opacity = 0.35 + 0.5 * state.routeProgress;
    } else if (sectionIndex > 1) {
      routeMesh.visible = true;
      state.routeProgress = 1;
      routeMaterial.opacity = 0.7;
    } else {
      routeMesh.visible = false;
    }

    if (sectionIndex === 3) {
      state.deliveryProgress = sectionProgress;
      droneLine.visible = true;
      riderLine.visible = true;
      droneLine.material.opacity = 0.5 + 0.4 * state.deliveryProgress;
      riderLine.material.opacity = 0.5 + 0.4 * state.deliveryProgress;
    } else if (sectionIndex > 3) {
      droneLine.visible = true;
      riderLine.visible = true;
      droneLine.material.opacity = 0.9;
      riderLine.material.opacity = 0.9;
    } else {
      droneLine.visible = false;
      riderLine.visible = false;
    }
  }

  return {
    linesGroup,
    networkLines,
    routeMesh,
    droneLine,
    riderLine,
    update,
    state,
    routeIndices,
    getRouteIndices: () => routeIndices,
  };
}
