import * as THREE from 'three';

/**
 * Procedural Rider Mesh
 * Abstract representation of a delivery rider on a scooter/e-bike.
 */
export class Rider {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    this.active = false;
    
    this.createGeometry();
    
    scene.add(this.mesh);
    this.mesh.visible = false; // Start hidden until activated
  }

  createGeometry() {
    const bikeMat = new THREE.MeshStandardMaterial({ 
      color: 0x333333, 
      roughness: 0.4, 
      metalness: 0.6 
    });
    const riderMat = new THREE.MeshStandardMaterial({ 
      color: 0xe0359c, // Brand color for rider uniform
      roughness: 0.6 
    });
    
    // Bike Body
    const chassisGeom = new THREE.BoxGeometry(0.5, 0.3, 1.2);
    const chassis = new THREE.Mesh(chassisGeom, bikeMat);
    chassis.position.y = 0.3;
    this.mesh.add(chassis);

    // Wheels
    const wheelGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16);
    wheelGeom.rotateZ(Math.PI / 2);
    
    const wheelF = new THREE.Mesh(wheelGeom, bikeMat);
    wheelF.position.set(0, 0.25, 0.4);
    this.mesh.add(wheelF);
    
    const wheelB = new THREE.Mesh(wheelGeom, bikeMat);
    wheelB.position.set(0, 0.25, -0.4);
    this.mesh.add(wheelB);

    // Initial scale
    this.mesh.scale.set(0.6, 0.6, 0.6);
  }

  spawn(position) {
    this.mesh.position.copy(position);
    this.mesh.visible = true;
    this.active = true;
  }
}
