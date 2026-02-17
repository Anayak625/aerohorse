import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const ACCENT = 0xe0359c;
const LIGHT_BG = 0xfaf9fc;
const DARK = 0x0a0e17;

/**
 * Main WebGL scene: renderer, camera, post-processing (bloom), resize.
 * Light theme, advanced 3D with bloom for emissive elements.
 */
export function createScene(container) {
  const scene = new THREE.Scene();
  // Enhanced atmospheric fog - deeper color, better blend
  const fogColor = new THREE.Color(0xf0f5fa);
  scene.background = fogColor;
  scene.fog = new THREE.Fog(fogColor, 20, 100); // Tighter fog for depth

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
  camera.position.set(4, 12, -7);
  camera.lookAt(-6, 3.5, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2; // Slightly brighter
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4); // Lower ambient for more contrast
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, 1.5); // Stronger sun
  sun.position.set(-20, 50, 30);
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
  sun.shadow.radius = 2; // Softer shadows
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xddeeff, 0.6); // Cool fill
  fill.position.set(20, 30, -20);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 0.4); // Stronger rim
  rim.position.set(30, 5, -10);
  scene.add(rim);

  // Phase-based lighting (rotated 90° Y: x,y,z → -z,y,x)
  const LIGHT_PHASES = [
    { sunPos: [-20, 50, 30], sunIntensity: 1.5, ambient: 0.4, fogNear: 20, fogFar: 100 },
    { sunPos: [15, 45, 25], sunIntensity: 1.3, ambient: 0.35, fogNear: 15, fogFar: 90 },
    { sunPos: [-15, 35, -10], sunIntensity: 1.2, ambient: 0.3, fogNear: 10, fogFar: 80 },
    { sunPos: [-25, 28, 15], sunIntensity: 1.3, ambient: 0.35, fogNear: 15, fogFar: 90 },
    { sunPos: [-12, 42, 20], sunIntensity: 1.4, ambient: 0.4, fogNear: 20, fogFar: 100 }
  ];

  function setPhase(phaseIndex, phaseProgress) {
    const i = Math.min(Math.floor(phaseIndex), LIGHT_PHASES.length - 1);
    const j = Math.min(i + 1, LIGHT_PHASES.length - 1);
    const t = i === j ? 0 : phaseProgress;
    const a = LIGHT_PHASES[i];
    const b = LIGHT_PHASES[j];
    sun.position.x = a.sunPos[0] + (b.sunPos[0] - a.sunPos[0]) * t;
    sun.position.y = a.sunPos[1] + (b.sunPos[1] - a.sunPos[1]) * t;
    sun.position.z = a.sunPos[2] + (b.sunPos[2] - a.sunPos[2]) * t;
    sun.intensity = a.sunIntensity + (b.sunIntensity - a.sunIntensity) * t;
    ambient.intensity = a.ambient + (b.ambient - a.ambient) * t;
    scene.fog.near = a.fogNear + (b.fogNear - a.fogNear) * t;
    scene.fog.far = a.fogFar + (b.fogFar - a.fogFar) * t;
  }

  const skyGeom = new THREE.SphereGeometry(280, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, '#dceaf7'); // Darker top
  grad.addColorStop(0.5, '#e6f0fa');
  grad.addColorStop(1, '#f0f5fa'); // Match fog
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 64);
  const skyTex = new THREE.CanvasTexture(canvas);
  skyTex.needsUpdate = true;
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTex,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false
  });
  const sky = new THREE.Mesh(skyGeom, skyMat);
  scene.add(sky);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    0.6,    // strength
    0.8,    // radius
    0.75    // threshold
  );
  bloomPass.renderToScreen = true;
  composer.addPass(bloomPass);

  const state = {
    camera,
    scene,
    renderer,
    composer,
    bloomPass,
    sectionProgress: 0,
    sectionIndex: 0,
    mouse: new THREE.Vector2(),
    raycaster: new THREE.Raycaster(),
    cameraTarget: new THREE.Vector3(-6, 3.5, 10),
  };

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    composer.setPixelRatio(pixelRatio);
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
    composer.render();
  }

  function dispose() {
    window.removeEventListener('resize', onResize);
    composer.dispose();
    renderer.dispose();
  }

  return {
    scene,
    camera,
    renderer,
    setSection,
    setPhase,
    getState,
    render,
    dispose,
    ACCENT,
    DARK,
  };
}
