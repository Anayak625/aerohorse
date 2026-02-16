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

// Ground path (straight lines along streets map)
// For this demo, we'll just fake a path from Pod to a random "House"
export function createGroundPath(start, end) {
  // Simple L-shape or straight line for demo
  // In a real grid we'd use A* 
  // Here we just do a direct line but stick to Y=0.3
  const curve = new THREE.LineCurve3(
    new THREE.Vector3(start.x, 0.3, start.z),
    new THREE.Vector3(end.x, 0.3, end.z)
  );
  return curve;
}
