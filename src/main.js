import './styles.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createScene } from './webgl/scene.js';
import { createStage } from './webgl/stage.js';
import { Drone } from './webgl/drone.js';
import { Rider } from './webgl/rider.js';
import { createPackage } from './webgl/package.js';
import { createFlightPath } from './webgl/routes.js';
import { initSolutions } from './sections/solutions.js';
import { initTechnology } from './sections/technology.js';
import { initBenefits } from './sections/benefits.js';
import { initCta } from './sections/cta.js';

gsap.registerPlugin(ScrollTrigger);

const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });
}

const container = document.getElementById('webgl-container');
const sceneApi = createScene(container);
const { scene, camera, getState, render, setPhase } = sceneApi;
scene.add(camera);

const stage = createStage(scene);
const { podPosition, doorstep, setPodGlow } = stage;

// Single drone for the whole journey — one mesh, one continuous path (scroll or Play both use applySceneFromProgress)
const drone = new Drone(scene, camera);
const rider = new Rider(scene);
const pkg = createPackage();

const STEPS = [
  { title: 'Urban delivery.<br />Reinvented.', subtitle: 'Anything · Anytime · Delivered' },
  { title: 'Smart routing.', subtitle: 'Drone flies to your neighborhood pod.' },
  { title: 'Pods every 500m.', subtitle: 'Package lands. Secure pickup.' },
  { title: 'Drone to Pod.<br />Rider to Door.', subtitle: 'Local rider collects and heads to you.' },
  { title: 'City-wide scale.', subtitle: 'From sky to doorstep, reinvented.' }
];

// Camera frames so pod + drone are visible together when drone is above pod
const CAMERA_KEYFRAMES = [
  { position: [0, 18, 32], lookAt: [0, 2, 0], fov: 48 },
  { position: [8, 14, 22], lookAt: [0, 10, -4], fov: 42 },
  { position: [-4, 5, 11], lookAt: [0, 3, 0], fov: 44 },  // pod phase: frame pod + drone above it
  { position: [10, 5, 6], lookAt: [-4, 0, 0], fov: 38 },
  { position: [4, 22, 18], lookAt: [14, 0, 10], fov: 50 }
];

const depotWorld = new THREE.Vector3(0, 20, 26);
const depotTop = new THREE.Vector3(depotWorld.x, depotWorld.y + 4, depotWorld.z); // top of depot
const podHover = new THREE.Vector3(0, 12, 0);
const flightCurve = createFlightPath(depotWorld, podHover, 18);
const podSlotPos = new THREE.Vector3(0, 0.9, 0.7);

// Drone path: top of depot → hover (lower so pod stays in view) → above pod (both in frame)
const DRONE_TARGETS = [
  depotTop.clone(),              // top of depot (handoff ends here)
  new THREE.Vector3(0, 7, 0),   // hover above area, lower so pod visible as we approach
  new THREE.Vector3()            // above pod (y set in applySceneFromProgress)
];

let currentStep = 0;
let timeline = null;
let storyScrollProgress = 0;

drone.setPackage(pkg);
drone.mesh.position.set(0, -1, -5);

const _handoffWorld = new THREE.Vector3();
const _cameraLocalOffset = new THREE.Vector3(0, -1, -5);

function lerpV3(out, a, b, t) {
  out.x = a.x + (b.x - a.x) * t;
  out.y = a.y + (b.y - a.y) * t;
  out.z = a.z + (b.z - a.z) * t;
  return out;
}

// Apply drone/rider/package positions from scroll progress (smooth, continuous, no disappear)
function applySceneFromProgress(progress) {
  const p = Math.max(0, Math.min(1, progress));
  const phase = p * 5;
  const i = Math.floor(phase);
  const j = Math.min(i + 1, 4);
  const t = i === j ? 0 : phase - i;

  // Drone: on camera until handoff start; then smooth handoff so it never disappears
  const HANDOFF_START = 0.12;
  const HANDOFF_END = 0.28;

  if (p < HANDOFF_START) {
    if (drone.mesh.parent === scene) {
      camera.add(drone.mesh);
      drone.mesh.position.set(0, -1, -5);
    }
    drone.setPackage(pkg);
    rider.mesh.visible = false;
    rider.active = false;
    setPodGlow(0.5 + 0.2 * (p / HANDOFF_START));
    return;
  }

  // Move to scene once: use world position where drone was (so no pop), then lerp to top of depot
  if (drone.mesh.parent !== scene) {
    _handoffWorld.copy(_cameraLocalOffset).applyQuaternion(camera.quaternion).add(camera.position);
    camera.remove(drone.mesh);
    scene.add(drone.mesh);
    drone.mesh.position.copy(_handoffWorld);
  }

  // Drone above pod at height so pod + drone both visible in frame (camera looks at mid-point)
  const droneAbovePodY = 4.5;
  DRONE_TARGETS[2].set(podPosition.x, droneAbovePodY, podPosition.z);

  const dronePos = drone.mesh.position;

  if (p < HANDOFF_END) {
    // Handoff: from in front of camera to top of depot (no disappear)
    const handoffT = (p - HANDOFF_START) / (HANDOFF_END - HANDOFF_START);
    lerpV3(dronePos, _handoffWorld, DRONE_TARGETS[0], Math.min(1, handoffT));
  } else {
    // 0.28→0.48 top of depot→hover, 0.48→0.68 hover→top of pod; after that drone stays on pod
    const segment = Math.min(2, Math.floor((p - HANDOFF_END) / 0.2));
    const segT = ((p - HANDOFF_END) / 0.2) - segment;
    if (segment === 0) lerpV3(dronePos, DRONE_TARGETS[0], DRONE_TARGETS[1], segT);
    else if (segment === 1) lerpV3(dronePos, DRONE_TARGETS[1], DRONE_TARGETS[2], segT);
    else dronePos.copy(DRONE_TARGETS[2]); // stay on top of pod for rest of scroll
  }

  // Pod glow (aligned with handoff and segments)
  if (p < 0.4) setPodGlow(0.5 + 0.2 * (p - HANDOFF_START) / (0.4 - HANDOFF_START));
  else if (p < 0.6) setPodGlow(0.7 + 0.5 * (p - 0.4) / 0.2);
  else if (p < 0.8) setPodGlow(1.2 - 0.2 * (p - 0.6) / 0.2);
  else setPodGlow(1 - 0.5 * (p - 0.8) / 0.2);

  // Package: on drone until 0.4, then lerp to pod slot by 0.6, then rider/doorstep
  if (p < 0.4) {
    drone.setPackage(pkg);
  } else {
    if (drone.package) drone.dropPackage();
    if (p < 0.6) {
      rider.mesh.visible = false;
      rider.active = false;
      if (rider.package) {
        const dropped = rider.dropPackage();
        if (dropped) scene.add(dropped);
      }
      scene.add(pkg);
      const from = new THREE.Vector3(podPosition.x, 4.5, podPosition.z);
      lerpV3(pkg.position, from, podSlotPos, (p - 0.4) / 0.2);
    } else if (p < 0.8) {
      if (!rider.mesh.visible) {
        rider.spawn(new THREE.Vector3(podPosition.x - 1.5, 0, podPosition.z));
        scene.remove(pkg);
        rider.setPackage(pkg);
        rider.mesh.visible = true;
        rider.active = true;
      }
      rider.mesh.position.set(podPosition.x - 1.5, 0, podPosition.z);
    } else {
      const riderEnd = new THREE.Vector3(doorstep.x - 0.5, 0, doorstep.z - 0.5);
      const rp = (p - 0.8) / 0.2;
      rider.mesh.position.lerpVectors(
        new THREE.Vector3(podPosition.x - 1.5, 0, podPosition.z),
        riderEnd,
        rp
      );
      if (rp >= 1) {
        const dropped = rider.dropPackage();
        if (dropped) {
          dropped.position.copy(doorstep);
          scene.add(dropped);
        }
      }
      setPodGlow(0.5 + 0.5 * rp);
    }
  }
}

// Scroll-driven: lerp camera and lookAt between keyframes from progress 0..1
function applyCameraFromProgress(progress) {
  const p = Math.max(0, Math.min(1, progress));
  const phase = p * (CAMERA_KEYFRAMES.length - 1);
  const i = Math.floor(phase);
  const j = Math.min(i + 1, CAMERA_KEYFRAMES.length - 1);
  const t = i === j ? 0 : phase - i;
  const k0 = CAMERA_KEYFRAMES[i];
  const k1 = CAMERA_KEYFRAMES[j];
  camera.position.x = k0.position[0] + (k1.position[0] - k0.position[0]) * t;
  camera.position.y = k0.position[1] + (k1.position[1] - k0.position[1]) * t;
  camera.position.z = k0.position[2] + (k1.position[2] - k0.position[2]) * t;
  const target = getState().cameraTarget;
  target.x = k0.lookAt[0] + (k1.lookAt[0] - k0.lookAt[0]) * t;
  target.y = k0.lookAt[1] + (k1.lookAt[1] - k0.lookAt[1]) * t;
  target.z = k0.lookAt[2] + (k1.lookAt[2] - k0.lookAt[2]) * t;
  camera.fov = k0.fov + (k1.fov - k0.fov) * t;
  camera.updateProjectionMatrix();
}

// Update drone/rider/package/pod to match step (no camera, no timeline) — used when scroll changes phase
function updateSceneToStep(stepIndex) {
  if (timeline) timeline.kill();
  if (stepIndex === 0) {
    camera.add(drone.mesh);
    drone.mesh.position.set(0, -1, -5);
    drone.setPackage(pkg);
    rider.mesh.visible = false;
    rider.active = false;
    setPodGlow(0.5);
    return;
  }
  camera.remove(drone.mesh);
  scene.add(drone.mesh);
  if (stepIndex === 1) {
    drone.mesh.position.set(0, 12, 0);
    drone.setPackage(pkg);
    rider.mesh.visible = false;
    setPodGlow(0.7);
  } else if (stepIndex === 2) {
    drone.mesh.position.set(podPosition.x, 3.5, podPosition.z);
    drone.dropPackage();
    pkg.position.copy(podSlotPos);
    scene.add(pkg);
    rider.mesh.visible = false;
    setPodGlow(1.2);
  } else if (stepIndex === 3) {
    drone.mesh.position.set(podPosition.x, 4.5, podPosition.z);
    scene.remove(pkg);
    rider.setPackage(pkg);
    rider.spawn(new THREE.Vector3(podPosition.x - 1.5, 0, podPosition.z));
    rider.mesh.visible = true;
    rider.active = true;
    setPodGlow(1);
  } else {
    drone.mesh.position.set(podPosition.x, 4.5, podPosition.z);
    rider.mesh.position.set(doorstep.x - 0.5, 0, doorstep.z - 0.5);
    const dropped = rider.dropPackage();
    if (dropped) dropped.position.copy(doorstep);
    setPodGlow(0.5);
  }
}

function setCameraToStep(stepIndex, duration = 0.6) {
  const kf = CAMERA_KEYFRAMES[stepIndex];
  gsap.to(camera.position, {
    x: kf.position[0],
    y: kf.position[1],
    z: kf.position[2],
    duration,
    ease: 'power2.inOut'
  });
  const target = getState().cameraTarget;
  gsap.to(target, {
    x: kf.lookAt[0],
    y: kf.lookAt[1],
    z: kf.lookAt[2],
    duration,
    ease: 'power2.inOut'
  });
  gsap.to(camera, { fov: kf.fov, duration, ease: 'power2.inOut', onUpdate: () => camera.updateProjectionMatrix() });
}

let hintDismissed = false;
function dismissHint() {
  if (hintDismissed) return;
  hintDismissed = true;
  document.getElementById('story-hint')?.classList.add('hidden');
}

function updateStoryUI(stepIndex) {
  const titleEl = document.getElementById('story-title');
  const subtitleEl = document.getElementById('story-subtitle');
  if (titleEl) {
    titleEl.innerHTML = STEPS[stepIndex].title;
    gsap.fromTo(titleEl, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
  }
  if (subtitleEl) {
    subtitleEl.textContent = STEPS[stepIndex].subtitle;
    gsap.fromTo(subtitleEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: 'power2.out' });
  }
  document.querySelectorAll('.story-step').forEach((btn, i) => {
    btn.classList.toggle('active', i === stepIndex);
    btn.setAttribute('aria-current', i === stepIndex ? 'true' : 'false');
  });
  const nextBtn = document.getElementById('story-next');
  if (nextBtn) nextBtn.textContent = stepIndex >= 4 ? 'See how' : 'Next';
  const wrap = document.getElementById('story-progress-wrap');
  if (wrap) wrap.setAttribute('data-progress', String(stepIndex));
}

function goToStep(stepIndex, skipCamera = false) {
  if (stepIndex === currentStep) return;
  stopPlayJourney();
  if (timeline) timeline.kill();
  const prev = currentStep;
  currentStep = stepIndex;
  updateStoryUI(stepIndex);
  if (!skipCamera) setCameraToStep(stepIndex);

  if (stepIndex === 0) {
    camera.add(drone.mesh);
    drone.mesh.position.set(0, -1, -5);
    drone.setPackage(pkg);
    rider.mesh.visible = false;
    rider.active = false;
    setPodGlow(0.5);
    return;
  }

  if (prev < 1 && stepIndex >= 1) {
    camera.remove(drone.mesh);
    scene.add(drone.mesh);
    drone.mesh.position.copy(depotWorld);
    const progress = { t: 0 };
    timeline = gsap.timeline();
    timeline.to(progress, { t: 1, duration: 2, ease: 'power2.inOut', onUpdate: () => {
      const p = flightCurve.getPoint(progress.t);
      drone.mesh.position.copy(p);
      const next = flightCurve.getPoint(Math.min(1, progress.t + 0.03));
      drone.mesh.lookAt(next);
      drone.setFlightIntensity(0.9);
      drone.setTilt(0.2);
    }});
    timeline.call(() => { drone.setFlightIntensity(0.3); drone.setTilt(0); }, null, 1.9);
    setPodGlow(0.7);
    return;
  }

  if (stepIndex === 2) {
    drone.mesh.position.set(podPosition.x, 12, podPosition.z);
    timeline = gsap.timeline();
    timeline.to(drone.mesh.position, { y: 3.5, duration: 1.2, ease: 'power2.inOut' });
    timeline.call(() => {
      drone.dropPackage();
      pkg.position.copy(podSlotPos);
      scene.add(pkg);
    }, null, 0.85);
    timeline.to({}, { duration: 0.3 });
    timeline.call(() => setPodGlow(1.2), null, 1);
    return;
  }

  if (stepIndex === 3) {
    drone.mesh.position.set(podPosition.x, 3.5, podPosition.z);
    if (drone.package) drone.dropPackage();
    pkg.position.copy(podSlotPos);
    scene.add(pkg);
    scene.remove(pkg);
    rider.setPackage(pkg);
    rider.spawn(new THREE.Vector3(podPosition.x - 12, 0, podPosition.z));
    rider.mesh.visible = true;
    rider.active = true;
    timeline = gsap.timeline();
    timeline.to(drone.mesh.position, { y: 4.5, x: podPosition.x, z: podPosition.z, duration: 1, ease: 'power2.inOut' });
    timeline.to(rider.mesh.position, { x: podPosition.x - 1.5, z: podPosition.z, duration: 1.5, ease: 'power2.inOut' }, 0.2);
    setPodGlow(1);
    return;
  }

  if (stepIndex === 4) {
    rider.mesh.position.set(podPosition.x - 1.5, 0, podPosition.z);
    timeline = gsap.timeline();
    timeline.to(rider.mesh.position, {
      x: doorstep.x - 0.5,
      z: doorstep.z - 0.5,
      duration: 2,
      ease: 'power2.inOut'
    });
    timeline.call(() => {
      const dropped = rider.dropPackage();
      if (dropped) dropped.position.copy(doorstep);
    }, null, 1.85);
    setPodGlow(0.5);
  }
}

function goToStepInstant(stepIndex) {
  stopPlayJourney();
  if (timeline) timeline.kill();
  currentStep = stepIndex;
  updateStoryUI(stepIndex);
  setCameraToStep(stepIndex, 0.4);

  if (stepIndex === 0) {
    camera.add(drone.mesh);
    drone.mesh.position.set(0, -1, -5);
    drone.setPackage(pkg);
    rider.mesh.visible = false;
    setPodGlow(0.5);
    return;
  }
  camera.remove(drone.mesh);
  scene.add(drone.mesh);
  if (stepIndex === 1) {
    drone.mesh.position.set(0, 12, 0);
    drone.setPackage(pkg);
    rider.mesh.visible = false;
    setPodGlow(0.7);
  } else if (stepIndex === 2) {
    drone.mesh.position.set(0, 3.5, 0);
    drone.dropPackage();
    pkg.position.copy(podSlotPos);
    scene.add(pkg);
    rider.mesh.visible = false;
    setPodGlow(1.2);
  } else if (stepIndex === 3) {
    drone.mesh.position.set(podPosition.x, 4.5, podPosition.z);
    scene.remove(pkg);
    rider.setPackage(pkg);
    rider.spawn(new THREE.Vector3(podPosition.x - 1.5, 0, podPosition.z));
    rider.mesh.visible = true;
    rider.active = true;
    setPodGlow(1);
  } else {
    drone.mesh.position.set(podPosition.x, 4.5, podPosition.z);
    rider.mesh.position.set(doorstep.x - 0.5, 0, doorstep.z - 0.5);
    const dropped = rider.dropPackage();
    if (dropped) dropped.position.copy(doorstep);
    setPodGlow(0.5);
  }
}

document.querySelectorAll('.story-step').forEach((btn) => {
  btn.addEventListener('click', () => {
    dismissHint();
    const step = parseInt(btn.getAttribute('data-step'), 10);
    scrollToStep(step);
  });
});

document.getElementById('story-next')?.addEventListener('click', () => {
  dismissHint();
  if (currentStep < 4) scrollToStep(currentStep + 1);
  else document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
});

// Play: animate scroll progress so the same single drone follows the same path (continuity)
const playProgressProxy = { p: 0 };
let playTween = null;
document.getElementById('story-play')?.addEventListener('click', () => {
  dismissHint();
  const btn = document.getElementById('story-play');
  if (btn?.classList.contains('playing')) return;
  btn?.classList.add('playing');
  if (playTween) playTween.kill();
  playProgressProxy.p = storyScrollProgress;
  const duration = 22;
  playTween = gsap.to(playProgressProxy, {
    p: 1,
    duration,
    ease: 'none',
    onUpdate: () => { storyScrollProgress = playProgressProxy.p; },
    onComplete: () => {
      btn?.classList.remove('playing');
      playTween = null;
    },
    onKill: () => { btn?.classList.remove('playing'); playTween = null; }
  });
});

function stopPlayJourney() {
  if (playTween) {
    playTween.kill();
    playTween = null;
  }
  document.getElementById('story-play')?.classList.remove('playing');
}

updateStoryUI(0);
setPodGlow(0.5);

document.getElementById('story-progress-wrap')?.setAttribute('data-progress', '0');

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    if (currentStep < 4) scrollToStep(currentStep + 1);
    else document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
    dismissHint();
  } else if (e.key === 'ArrowLeft' && currentStep > 0) {
    scrollToStep(currentStep - 1);
    dismissHint();
  }
});

const smoothLookAt = new THREE.Vector3(0, 2, 0);
const mouse = new THREE.Vector2();
const targetMouse = new THREE.Vector2();

// Scroll-driven story: progress 0..1 over #story-viewport (500vh)
ScrollTrigger.create({
  id: 'story-phases',
  trigger: '#story-viewport',
  start: 'top top',
  end: 'bottom top'
});

window.addEventListener('resize', () => ScrollTrigger.refresh());
window.addEventListener('mousemove', (e) => {
  targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  getState().mouse.copy(targetMouse);
});

// Scroll to a story step (0..4); used when clicking step buttons
function scrollToStep(stepIndex) {
  const st = ScrollTrigger.getById('story-phases');
  if (!st) return;
  const progress = Math.max(0, Math.min(1, stepIndex / 4));
  const y = st.start + progress * (st.end - st.start);
  window.scrollTo({ top: y, behavior: 'smooth' });
}

let time = 0;
let lastScrollPhaseIndex = -1;

function animate() {
  requestAnimationFrame(animate);
  const delta = 0.016;
  time += delta;

  // Drive camera and lighting from scroll when in story section
  const st = ScrollTrigger.getById('story-phases');
  if (st) storyScrollProgress = st.progress;
  const progress = Math.max(0, Math.min(1, storyScrollProgress));
  const phaseIndex = Math.min(4, Math.floor(progress * 5));
  const phaseProgress = progress * 5 - phaseIndex;

  applyCameraFromProgress(progress);
  setPhase(phaseIndex, phaseProgress);
  // Single drone, single path: always drive from scroll progress (scroll or Play both use this)
  applySceneFromProgress(progress);

  if (phaseIndex !== lastScrollPhaseIndex) {
    lastScrollPhaseIndex = phaseIndex;
    currentStep = phaseIndex;
    updateStoryUI(phaseIndex);
  }

  mouse.lerp(targetMouse, 0.05);
  smoothLookAt.lerp(getState().cameraTarget, 0.1);
  const parallax = new THREE.Vector3(mouse.x * 1.5, mouse.y * 1.5, 0);
  camera.lookAt(smoothLookAt.clone().add(parallax));
  drone.update(time, delta);
  rider.update(delta);
  render();
}
animate();

initSolutions();
initTechnology();
initBenefits();
initCta();
