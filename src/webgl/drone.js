import * as THREE from 'three';
import gsap from 'gsap';

/**
 * Procedural Drone Mesh
 * A sleek, futuristic quadcopter with rotors and status lights.
 */
export class Drone {
  constructor(scene, parent = scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    
    this.propellers = [];
    this.createGeometry();
    this.initLights();
    
    // Animation state
    this.isFlying = true;
    
    parent.add(this.mesh);
  }

  createGeometry() {
    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      roughness: 0.2, 
      metalness: 0.5 
    });
    const darkMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a, 
      roughness: 0.5, 
      metalness: 0.2 
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xe0359c,
      emissive: 0xe0359c,
      emissiveIntensity: 2,
      roughness: 0.2,
      metalness: 0
    });

    // Main Body (Central Hub) - Sleek capsule/sphere shape
    const bodyGeom = new THREE.CapsuleGeometry(0.5, 0.4, 4, 16);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.z = Math.PI / 2;
    body.scale.set(1, 0.4, 1); // Flatten it
    this.mesh.add(body);

    // Arms - Tubular instead of boxy
    const armGeom = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 16);
    const arms1 = new THREE.Mesh(armGeom, bodyMat);
    arms1.rotation.z = Math.PI / 2;
    
    const arms2 = new THREE.Mesh(armGeom, bodyMat);
    arms2.rotation.x = Math.PI / 2;
    
    this.mesh.add(arms1);
    this.mesh.add(arms2);

    // Rotors & Guards
    const rotorOffset = 1.2;
    const positions = [
      { x: rotorOffset, z: 0 },
      { x: -rotorOffset, z: 0 },
      { x: 0, z: rotorOffset },
      { x: 0, z: -rotorOffset }
    ];

    positions.forEach(pos => {
      // Motor housing - Smooth cylinder
      const motorGeom = new THREE.CylinderGeometry(0.18, 0.15, 0.25, 32);
      const motor = new THREE.Mesh(motorGeom, darkMat);
      motor.position.set(pos.x, 0.1, pos.z);
      this.mesh.add(motor);

      // Propeller blade - Sleek flattened blades
      const propGeom = new THREE.BoxGeometry(1.0, 0.02, 0.1); 
      // Could accept box for blades as they are flat, but lets round edges if possible? 
      // Simplified for perf, but lets use slightly tapered cylinder for hub
      
      const propGroup = new THREE.Group();
      propGroup.position.set(pos.x, 0.23, pos.z);
      
      const bladeGeom = new THREE.CapsuleGeometry(0.04, 0.9, 4, 8);
      const blade1 = new THREE.Mesh(bladeGeom, darkMat);
      blade1.rotation.z = Math.PI / 2;
      blade1.scale.set(1, 1, 0.1); // Flattened
      
      const blade2 = blade1.clone();
      blade2.rotation.y = Math.PI / 2;
      blade2.rotation.x = Math.PI / 2; // Adjust for capsule orientation if needed, actually just rot Y is enough if geometry aligns
      // Re-doing blade to be simpler:
      
      const simpleBladeGeom = new THREE.CapsuleGeometry(0.06, 1.0, 4, 8);
      const prop1 = new THREE.Mesh(simpleBladeGeom, darkMat);
      prop1.rotation.z = Math.PI / 2;
      prop1.scale.set(1, 1, 0.05); // Flattened air-foil look
      
      const prop2 = prop1.clone();
      prop2.rotation.y = Math.PI / 2;
      
      propGroup.add(prop1);
      propGroup.add(prop2);
      
      this.mesh.add(propGroup);
      this.propellers.push(propGroup);

      // LED Light under motor
      const ledGeom = new THREE.SphereGeometry(0.06, 16, 16);
      const led = new THREE.Mesh(ledGeom, accentMat);
      led.position.set(pos.x, -0.05, pos.z);
      this.mesh.add(led);
    });

    // Landing Gear / Skids - Sleek curved capsules
    const skidGeom = new THREE.CapsuleGeometry(0.04, 1.2, 4, 8);
    
    // Left Skid
    const skid1 = new THREE.Mesh(skidGeom, darkMat);
    skid1.position.set(0.4, -0.3, 0);
    skid1.rotation.x = Math.PI / 2; // Align along Z axis
    
    // Right Skid
    const skid2 = skid1.clone();
    skid2.position.set(-0.4, -0.3, 0);
    
    // Legs connecting skids to body
    const legGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
    
    const legFL = new THREE.Mesh(legGeom, darkMat);
    legFL.position.set(0.4, -0.15, 0.4);
    legFL.rotation.x = Math.PI / 6; // Angled slightly
    
    const legBL = new THREE.Mesh(legGeom, darkMat);
    legBL.position.set(0.4, -0.15, -0.4);
    legBL.rotation.x = -Math.PI / 6;
    
    const legFR = new THREE.Mesh(legGeom, darkMat);
    legFR.position.set(-0.4, -0.15, 0.4);
    legFR.rotation.x = Math.PI / 6;
    
    const legBR = new THREE.Mesh(legGeom, darkMat);
    legBR.position.set(-0.4, -0.15, -0.4);
    legBR.rotation.x = -Math.PI / 6;

    this.mesh.add(skid1);
    this.mesh.add(skid2);
    this.mesh.add(legFL);
    this.mesh.add(legBL);
    this.mesh.add(legFR);
    this.mesh.add(legBR);

    // Shadow caster
    this.mesh.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Initial scale
    this.mesh.scale.set(0.5, 0.5, 0.5);
  }

  initLights() {
    // Small point light for "tech" feel
    const light = new THREE.PointLight(0xe0359c, 1, 3);
    light.position.set(0, -0.2, 0);
    this.mesh.add(light);
  }

  update(time, delta) {
    // Rotate propellers
    if (this.isFlying) {
      const speed = 15;
      this.propellers.forEach((prop, i) => {
        // Alternate rotation direction for realism
        const dir = i % 2 === 0 ? 1 : -1;
        prop.rotation.y += speed * delta * dir;
      });
    }

    // Gentle hover bobbing
    // this.mesh.position.y += Math.sin(time * 2) * 0.005;
    
    // Tilt based on movement (simulated)
    // In a real physics engine we'd calculate velocity, here we'll just fake it slightly
    // based on position changes if needed, or controlled by GSAP
  }

  setPackage(pkgMesh) {
    if (this.package) {
      this.mesh.remove(this.package);
    }
    if (pkgMesh) {
      this.package = pkgMesh;
      this.mesh.add(pkgMesh);
      pkgMesh.position.set(0, -0.4, 0);
    }
  }

  dropPackage() {
    if (this.package) {
      const pkg = this.package;
      this.mesh.remove(pkg);
      this.package = null;
      
      // Return the package mesh to world space so it can fall/stay
      const worldPos = new THREE.Vector3();
      pkg.getWorldPosition(worldPos);
      pkg.position.copy(worldPos);
      pkg.rotation.set(0,0,0);
      this.scene.add(pkg);
      return pkg;
    }
    return null;
  }
}
