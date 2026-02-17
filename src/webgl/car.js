import * as THREE from 'three';

/**
 * Delivery car — drives from pod to building.
 */
export class Car {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    this.active = false;
    this.wheels = [];
    this.lastPosition = new THREE.Vector3();
    this.package = null;

    this.createGeometry();
    scene.add(this.mesh);
    this.mesh.visible = false;
  }

  createGeometry() {
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.4,
      metalness: 0.6,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xe0359c,
      emissive: 0xe0359c,
      emissiveIntensity: 0.3,
      roughness: 0.5,
    });

    // Car body — compact delivery van
    const cabinGeom = new THREE.BoxGeometry(0.8, 0.5, 1.2);
    const cabin = new THREE.Mesh(cabinGeom, bodyMat);
    cabin.position.set(0, 0.5, 0);
    this.mesh.add(cabin);

    const cargoGeom = new THREE.BoxGeometry(0.9, 0.55, 1.4);
    const cargo = new THREE.Mesh(cargoGeom, accentMat);
    cargo.position.set(0, 0.55, -0.9);
    this.mesh.add(cargo);

    // Wheels
    const wheelGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.12, 16);
    wheelGeom.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.8, metalness: 0.3 });

    const wheelPositions = [
      [0.45, 0.22, 0.5],
      [0.45, 0.22, -0.5],
      [-0.45, 0.22, 0.5],
      [-0.45, 0.22, -0.5],
    ];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.position.set(x, y, z);
      this.mesh.add(wheel);
      this.wheels.push(wheel);
    });

    this.mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.mesh.scale.set(0.7, 0.7, 0.7);
  }

  spawn(position) {
    this.mesh.position.copy(position);
    this.lastPosition.copy(position);
    this.mesh.visible = true;
    this.active = true;
  }

  setPackage(pkgMesh) {
    if (this.package) this.mesh.remove(this.package);
    if (pkgMesh) {
      this.package = pkgMesh;
      this.mesh.add(pkgMesh);
      pkgMesh.position.set(0, 0.6, -0.9);
    }
  }

  dropPackage() {
    if (this.package) {
      const pkg = this.package;
      this.mesh.remove(pkg);
      this.package = null;
      const worldPos = new THREE.Vector3();
      pkg.getWorldPosition(worldPos);
      pkg.position.copy(worldPos);
      pkg.rotation.set(0, 0, 0);
      this.scene.add(pkg);
      return pkg;
    }
    return null;
  }

  update(delta) {
    if (!this.active || !this.wheels.length) return;
    const dist = this.mesh.position.distanceTo(this.lastPosition);
    this.lastPosition.copy(this.mesh.position);
    const spin = dist * 3;
    this.wheels.forEach((w) => {
      w.rotation.x += spin;
    });
  }
}
