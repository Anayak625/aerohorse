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
    this.bodyGroup = new THREE.Group();
    this.mesh.add(this.bodyGroup);
    
    this.propellers = [];
    this.createGeometry();
    this.initLights();
    
    this.isFlying = true;
    this.flightIntensity = 0; // 0 = hover, 1 = full speed
    this.targetTilt = 0;       
    this.currentTilt = 0;

    // Physics state
    this.lastPosition = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.lean = new THREE.Vector3(); // smooth banking
    
    parent.add(this.mesh);
  }

  createGeometry() {
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2, // increased slightly
      metalness: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.5,
      metalness: 0.35
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xe0359c,
      emissive: 0xe0359c,
      emissiveIntensity: 3, // brighter
      roughness: 0.2,
      metalness: 0
    });

    // Main Body (Central Hub)
    const bodyGeom = new THREE.CapsuleGeometry(0.5, 0.4, 4, 16);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.z = Math.PI / 2;
    body.scale.set(1, 0.4, 1);
    this.bodyGroup.add(body);

    // Arms
    const armGeom = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 16);
    const arms1 = new THREE.Mesh(armGeom, bodyMat);
    arms1.rotation.z = Math.PI / 2;
    const arms2 = new THREE.Mesh(armGeom, bodyMat);
    arms2.rotation.x = Math.PI / 2;
    this.bodyGroup.add(arms1);
    this.bodyGroup.add(arms2);

    // Rotors & Guards
    const rotorOffset = 1.2;
    const positions = [
      { x: rotorOffset, z: 0 },
      { x: -rotorOffset, z: 0 },
      { x: 0, z: rotorOffset },
      { x: 0, z: -rotorOffset }
    ];

    positions.forEach(pos => {
      // Motor housing
      const motorGeom = new THREE.CylinderGeometry(0.18, 0.15, 0.25, 32);
      const motor = new THREE.Mesh(motorGeom, darkMat);
      motor.position.set(pos.x, 0.1, pos.z);
      this.bodyGroup.add(motor);

      // Propeller Group
      const propGroup = new THREE.Group();
      propGroup.position.set(pos.x, 0.23, pos.z);
      
      const simpleBladeGeom = new THREE.CapsuleGeometry(0.06, 1.0, 4, 8);
      const prop1 = new THREE.Mesh(simpleBladeGeom, darkMat);
      prop1.rotation.z = Math.PI / 2;
      prop1.scale.set(1, 1, 0.05);
      
      const prop2 = prop1.clone();
      prop2.rotation.y = Math.PI / 2;
      
      propGroup.add(prop1);
      propGroup.add(prop2);
      
      this.bodyGroup.add(propGroup);
      this.propellers.push(propGroup);

      // LED Light
      const ledGeom = new THREE.SphereGeometry(0.06, 16, 16);
      const led = new THREE.Mesh(ledGeom, accentMat);
      led.position.set(pos.x, -0.05, pos.z);
      this.bodyGroup.add(led);
    });

    // Landing Gear
    const skidGeom = new THREE.CapsuleGeometry(0.04, 1.2, 4, 8);
    const skid1 = new THREE.Mesh(skidGeom, darkMat);
    skid1.position.set(0.4, -0.3, 0);
    skid1.rotation.x = Math.PI / 2;
    const skid2 = skid1.clone();
    skid2.position.set(-0.4, -0.3, 0);
    
    const legGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
    const legFL = new THREE.Mesh(legGeom, darkMat);
    legFL.position.set(0.4, -0.15, 0.4);
    legFL.rotation.x = Math.PI / 6;
    const legBL = new THREE.Mesh(legGeom, darkMat);
    legBL.position.set(0.4, -0.15, -0.4);
    legBL.rotation.x = -Math.PI / 6;
    const legFR = new THREE.Mesh(legGeom, darkMat);
    legFR.position.set(-0.4, -0.15, 0.4);
    legFR.rotation.x = Math.PI / 6;
    const legBR = new THREE.Mesh(legGeom, darkMat);
    legBR.position.set(-0.4, -0.15, -0.4);
    legBR.rotation.x = -Math.PI / 6;

    this.bodyGroup.add(skid1);
    this.bodyGroup.add(skid2);
    this.bodyGroup.add(legFL);
    this.bodyGroup.add(legBL);
    this.bodyGroup.add(legFR);
    this.bodyGroup.add(legBR);

    this.mesh.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.mesh.scale.set(0.5, 0.5, 0.5);
  }

  initLights() {
    const light = new THREE.PointLight(0xe0359c, 2, 4); // Stronger light
    light.position.set(0, -0.2, 0);
    this.bodyGroup.add(light);
  }

  setFlightIntensity(value) {
    this.flightIntensity = Math.max(0, Math.min(1, value));
  }

  update(time, delta) {
    // 1. Organic Hover (Bobbing)
    const hoverY = Math.sin(time * 2) * 0.15 + Math.sin(time * 0.7) * 0.05;
    this.bodyGroup.position.y = hoverY;
    
    // 2. Micro-adjustments (Wind buffeting)
    this.bodyGroup.rotation.z = Math.sin(time * 1.5) * 0.02;

    // 3. Dynamic Banking based on movement
    // Calculate velocity from position change
    const currentPos = this.mesh.position;
    const disp = new THREE.Vector3().subVectors(currentPos, this.lastPosition);
    if (delta > 0) {
      const v = disp.divideScalar(delta); // velocity unit/sec
      this.velocity.lerp(v, 0.1); // Smooth velocity
    }
    this.lastPosition.copy(currentPos);

    // Tilt body into movement
    // Pitch (lean forward/back based on Z velocity)
    const targetPitch = this.velocity.z * 0.05; 
    // Roll (lean left/right based on X velocity)
    const targetRoll = -this.velocity.x * 0.05;

    this.lean.x += (targetPitch - this.lean.x) * delta * 4;
    this.lean.z += (targetRoll - this.lean.z) * delta * 4;

    this.bodyGroup.rotation.x = this.lean.x;
    this.bodyGroup.rotation.z += this.lean.z;

    if (this.isFlying) {
      const baseSpeed = 12;
      const speed = baseSpeed + this.flightIntensity * 18;
      this.propellers.forEach((prop, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        prop.rotation.y += speed * delta * dir;
      });
    }
  }

  setPackage(pkgMesh) {
    if (this.package) {
      this.bodyGroup.remove(this.package);
    }
    if (pkgMesh) {
      this.package = pkgMesh;
      this.bodyGroup.add(pkgMesh);
      pkgMesh.position.set(0, -0.4, 0);
    }
  }

  dropPackage() {
    if (this.package) {
      const pkg = this.package;
      this.bodyGroup.remove(pkg);
      this.package = null;
      
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
