import * as THREE from 'three';

/* Aerohorse brand: magenta accent */
const ACCENT = 0xe0359c;
const LIGHT_BG = 0xfaf9fc;
const DARK = 0x0a0e17;

/**
 * Main WebGL scene: renderer, camera, resize, animation loop.
 * Light theme by default (brand-aligned).
 */
export function createScene(container) {
  /* Creative Light Mode: Soft, airy, futuristic */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f5fa); // Very light cool grey/blue
  scene.fog = new THREE.Fog(0xf0f5fa, 60, 180); // Soft distance fog

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
  camera.position.set(0, 35, 55);
  camera.lookAt(0, 5, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; // Enable shadows for depth
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  /* Lighting: Bright, soft, global illumination feel */
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(30, 50, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 150;
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 50;
  sun.shadow.camera.bottom = -50;
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xddeeff, 0.4);
  fill.position.set(-20, 30, -20);
  scene.add(fill);

  const state = {
    camera,
    scene,
    renderer,
    sectionProgress: 0,
    sectionIndex: 0,
    mouse: new THREE.Vector2(),
    raycaster: new THREE.Raycaster(),
    cameraTarget: new THREE.Vector3(0, 5, 0),
  };

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);

  function setSection(index, progress) {
    state.sectionIndex = index;
    state.sectionProgress = progress;
  }

  function getState() {
    return state;
  }

  function render() {
    renderer.render(scene, camera);
  }

  function dispose() {
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  }

  return {
    scene,
    camera,
    renderer,
    setSection,
    getState,
    render,
    dispose,
    ACCENT,
    DARK,
  };
}
