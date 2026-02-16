import * as THREE from 'three';

/**
 * Smart Delivery Pods
 * Located at street intersections. They act as drop-off points for drones
 * and pickup points for riders.
 */
export class PodNetwork {
  constructor(scene, cityData) {
    this.scene = scene;
    this.pods = [];
    this.group = new THREE.Group();
    scene.add(this.group);

    this.createPods(cityData);
  }

  createPods(cityData) {
    const { streetPositions, CELL } = cityData;
    
    const podGeom = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 6); // Hexagonal kiosk
    const capGeom = new THREE.CylinderGeometry(1.0, 0.8, 0.2, 6); // Roof
    
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2a3b55,
      roughness: 0.3,
      metalness: 0.6
    });
    
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      emissive: 0x00ffcc,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0
    });

    // Place a pod at regular intervals (every 2nd intersection/block to simulate 500m spacing)
    // We'll filter the streetPositions from city.js
    
    // Use a grid-based placement approach
    const placed = new Set();
    
    streetPositions.forEach(pos => {
      // Snap to a coarser grid to space them out
      const spacing = CELL * 2; 
      const gridX = Math.round(pos.x / spacing) * spacing;
      const gridZ = Math.round(pos.z / spacing) * spacing;
      
      // Check if this intersection is close enough to the snapped grid point
      if (Math.abs(pos.x - gridX) < 1 && Math.abs(pos.z - gridZ) < 1) {
        
        // CHECKERBOARD FILTER: Skip half the spots
        // We only place if (ix + iz) is even (or odd), ensuring a uniform distribution
        const ix = Math.round(gridX / spacing);
        const iz = Math.round(gridZ / spacing);
        if ((ix + iz) % 2 !== 0) return;

        const key = `${gridX},${gridZ}`;
        if (!placed.has(key)) {
          this.spawnPod(pos.x, 0, pos.z, podGeom, capGeom, bodyMat, glowMat);
          placed.add(key);
        }
      }
    });

    console.log(`Spawned ${this.pods.length} Axon Pods.`);
  }

  spawnPod(x, y, z, geom, capGeom, bodyMat, glowMat) {
    const podGroup = new THREE.Group();
    podGroup.position.set(x, y + 1.25, z); // pivot at center height

    // Main kiosk body
    const body = new THREE.Mesh(geom, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    podGroup.add(body);

    // Roof cap
    const cap = new THREE.Mesh(capGeom, bodyMat);
    cap.position.y = 1.35;
    podGroup.add(cap);

    // Glow strip (UI panel)
    const stripGeom = new THREE.PlaneGeometry(0.8, 0.4);
    const strip = new THREE.Mesh(stripGeom, glowMat);
    strip.position.set(0, 0.5, 0.76); // Slight offset from center to sit on face
    strip.rotation.y = 0; 
    // Align to a face of the hexagon
    // Hexagon flat distance is r * cos(30). r=0.8 -> 0.69
    
    // Let's stick to a simple glowing ring on top
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.05, 8, 16),
      glowMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.6;
    podGroup.add(ring);

    this.group.add(podGroup);
    
    this.pods.push({
      mesh: podGroup,
      position: new THREE.Vector3(x, y, z),
      id: Math.random().toString(36).substr(2, 9)
    });
  }

  getNearestPod(position) {
    let nearest = null;
    let minDist = Infinity;
    
    for (const pod of this.pods) {
      const dist = position.distanceTo(pod.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = pod;
      }
    }
    return nearest;
  }
}
