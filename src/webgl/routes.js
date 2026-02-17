import * as THREE from 'three';

/**
 * Route Logic
 * Generates flight paths (curves) for drones and street paths for riders.
 */

// Simple CatmullRomCurve3 generator
export function createFlightPath(start, end, height = 15) {
  const mid1 = start.clone().lerp(end, 0.33);
  const mid2 = start.clone().lerp(end, 0.66);
  
  // Arch the flight path
  mid1.y = height;
  mid2.y = height;
  
  const curve = new THREE.CatmullRomCurve3([
    start,
    mid1,
    mid2,
    end
  ]);
  
  return curve;
}

export function createPathVisual(curve, color = 0x00ffcc) {
  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  const material = new THREE.LineBasicMaterial({ 
    color: color,
    transparent: true,
    opacity: 0.3
  });
  
  return new THREE.Line(geometry, material);
}

// Straight line (legacy)
export function createGroundPath(start, end) {
  return new THREE.LineCurve3(
    new THREE.Vector3(start.x, 0, start.z),
    new THREE.Vector3(end.x, 0, end.z)
  );
}

// Curved ground path for more natural rider movement (CatmullRom with arc)
export function createCurvedGroundPath(start, end, arcHeight = 0) {
  const mid = new THREE.Vector3(
    (start.x + end.x) * 0.5 + (start.z - end.z) * 0.15,
    0,
    (start.z + end.z) * 0.5 + (end.x - start.x) * 0.15
  );
  const points = [
    new THREE.Vector3(start.x, 0, start.z),
    mid,
    new THREE.Vector3(end.x, 0, end.z)
  ];
  return new THREE.CatmullRomCurve3(points);
}
