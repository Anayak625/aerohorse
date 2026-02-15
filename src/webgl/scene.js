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
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(LIGHT_BG);
  scene.fog = new THREE.Fog(LIGHT_BG, 40, 120);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
  camera.position.set(0, 35, 55);
  camera.lookAt(0, 5, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  /* Soft daylight for light theme */
  const ambient = new THREE.AmbientLight(0x8899bb, 0.7);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 0.6);
  key.position.set(20, 40, 20);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe8e0f0, 0.35);
  fill.position.set(-15, 20, -15);
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
