import './styles.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createScene } from './webgl/scene.js';
import { createStage } from './webgl/stage.js';
import { createCity } from './webgl/city.js';
import { Drone } from './webgl/drone.js';
import { Car } from './webgl/car.js';
import { createPackage } from './webgl/package.js';
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

// Create City Background first
const city = createCity(scene);

const stage = createStage(scene);
const { podPosition, doorstep, setPodGlow } = stage;

// Align city garden to pod
city.setGardenPatchPosition(podPosition.x, podPosition.z);

const drone = new Drone(scene, camera);
const car = new Car(scene);
const pkg = createPackage();

const STEPS = [
  { title: 'Urban delivery.<br />Reinvented.', subtitle: 'Anything · Anytime · Delivered' },
  { title: 'Drone to pod.', subtitle: 'Flies to your neighborhood delivery point.' },
  { title: 'Hover & deliver.', subtitle: 'Package descends safely to the pod.' },
  { title: 'Pod to door.', subtitle: 'Car collects and drives to you.' },
  { title: 'City-wide scale.', subtitle: 'From sky to doorstep, reinvented.' }
];

// Cinematic Camera Keyframes
const CAMERA_KEYFRAMES = [
  { position: [8, 14, -8], lookAt: [-6, 2, 8], fov: 48 },      // 0: Wide establishing shot, high angle
  { position: [2, 11, 0], lookAt: [-6, 3, 10], fov: 50 },      // 1: Tracking shot closing in
  { position: [-5, 8, 8], lookAt: [-6, 3, 10], fov: 45 },      // 2: Orbit around pod, detail view
  { position: [-4, 6, 8], lookAt: [-6, 1.5, 10], fov: 45 },    // 3: Low angle, watching drop
  { position: [-8, 5, 16], lookAt: [-12, 1, 20], fov: 52 }     // 4: Follow car to destination
];

const droneStart = new THREE.Vector3(0, 8, 0);  // center of view
const droneAbovePod = new THREE.Vector3(podPosition.x, 6, podPosition.z);  // hover height (uses rotated podPosition)
const podSlotPos = new THREE.Vector3(podPosition.x - 0.7, 0.9, podPosition.z);  // slot in rotated layout

let currentStep = 0;
let timeline = null;
let storyScrollProgress = 0;

drone.setPackage(pkg);
drone.mesh.position.copy(droneStart);
scene.add(drone.mesh);

function lerpV3(out, a, b, t) {
  out.x = a.x + (b.x - a.x) * t;
  out.y = a.y + (b.y - a.y) * t;
  out.z = a.z + (b.z - a.z) * t;
  return out;
}

// Flow: drone center → moves to pod → hovers above → parcel descends → car pod→building
// All driven by scroll. Drone, pod, parcel stay in frame throughout.
function applySceneFromProgress(progress) {
  const p = Math.max(0, Math.min(1, progress));
  const dronePos = drone.mesh.position;

  // Phase 0 (0–0.25): Drone at center, pod at distance — both in frame
  // Phase 1 (0.25–0.5): Drone moves toward pod, stands above it
  // Phase 2 (0.5–0.6): Drone hovers, locks position
  // Phase 3 (0.6–0.8): Parcel descends slowly to pod
  // Phase 4 (0.8–1.0): Car runs from pod to building

  if (p < 0.25) {
    // Drone at center, pod at distance — both in frame
    dronePos.copy(droneStart);
    drone.setPackage(pkg);
    drone.setFlightIntensity(0.5);
    car.mesh.visible = false;
    car.active = false;
    setPodGlow(0.5);
  } else if (p < 0.5) {
    // Drone moves to pod, stands above
    const t = (p - 0.25) / 0.25;
    lerpV3(dronePos, droneStart, droneAbovePod, t);
    drone.setPackage(pkg);
    drone.setFlightIntensity(0.8);
    car.mesh.visible = false;
    setPodGlow(0.8 + 0.2 * t);
  } else if (p < 0.6) {
    // Drone hovers, locks position
    dronePos.copy(droneAbovePod);
    drone.setPackage(pkg);
    drone.setFlightIntensity(0.2); // Hovering
    car.mesh.visible = false;
    setPodGlow(1);
  } else if (p < 0.8) {
    // Parcel descends slowly to pod
    dronePos.copy(droneAbovePod);
    if (drone.package) drone.dropPackage();
    scene.add(pkg);
    const t = (p - 0.6) / 0.2;
    const from = new THREE.Vector3(podPosition.x, 6, podPosition.z);
    lerpV3(pkg.position, from, podSlotPos, t);
    car.mesh.visible = false;
    setPodGlow(1 - 0.2 * t);
  } else {
    // Car runs from pod to building
    dronePos.copy(droneAbovePod);
    drone.setFlightIntensity(0.2);
    scene.remove(pkg);
    if (!car.mesh.visible) {
      car.spawn(new THREE.Vector3(podPosition.x, 0, podPosition.z - 2));
      car.setPackage(pkg);
    }
    const t = (p - 0.8) / 0.2;
    const carStart = new THREE.Vector3(podPosition.x, 0, podPosition.z - 2);
    const carEnd = new THREE.Vector3(doorstep.x + 1, 0, doorstep.z - 1.5);
    car.mesh.position.lerpVectors(carStart, carEnd, t);
    car.mesh.rotation.y = Math.atan2(carEnd.x - carStart.x, carEnd.z - carStart.z);
    if (t >= 1) {
      const dropped = car.dropPackage();
      if (dropped) {
        dropped.position.copy(doorstep);
        scene.add(dropped);
      }
    }
    setPodGlow(0.8 - 0.3 * t);
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
  
  // Smooth ease for camera transition
  const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad
  
  camera.position.x = k0.position[0] + (k1.position[0] - k0.position[0]) * ease;
  camera.position.y = k0.position[1] + (k1.position[1] - k0.position[1]) * ease;
  camera.position.z = k0.position[2] + (k1.position[2] - k0.position[2]) * ease;
  const target = getState().cameraTarget;
  target.x = k0.lookAt[0] + (k1.lookAt[0] - k0.lookAt[0]) * ease;
  target.y = k0.lookAt[1] + (k1.lookAt[1] - k0.lookAt[1]) * ease;
  target.z = k0.lookAt[2] + (k1.lookAt[2] - k0.lookAt[2]) * ease;
  camera.fov = k0.fov + (k1.fov - k0.fov) * ease;
  camera.updateProjectionMatrix();
}

function updateSceneToStep(stepIndex) {
  if (timeline) timeline.kill();
  scene.add(drone.mesh);
  if (stepIndex === 0) {
    drone.mesh.position.copy(droneStart);
    drone.setPackage(pkg);
    car.mesh.visible = false;
    car.active = false;
    setPodGlow(0.5);
    return;
  }
  if (stepIndex === 1) {
    drone.mesh.position.copy(droneAbovePod);
    drone.setPackage(pkg);
    car.mesh.visible = false;
    setPodGlow(0.9);
  } else if (stepIndex === 2) {
    drone.mesh.position.copy(droneAbovePod);
    if (drone.package) drone.dropPackage();
    pkg.position.copy(podSlotPos);
    scene.add(pkg);
    car.mesh.visible = false;
    setPodGlow(1);
  } else if (stepIndex === 3) {
    drone.mesh.position.copy(droneAbovePod);
    scene.remove(pkg);
    car.spawn(new THREE.Vector3(podPosition.x - 2, 0, podPosition.z));
    car.setPackage(pkg);
    car.mesh.visible = true;
    setPodGlow(0.9);
  } else {
    drone.mesh.position.copy(droneAbovePod);
    car.mesh.position.set(doorstep.x + 1, 0, doorstep.z - 1.5);
    const dropped = car.dropPackage();
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
  document.querySelector('.story-scroll-hint')?.classList.add('hidden');
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
  currentStep = stepIndex;
  updateStoryUI(stepIndex);
  if (!skipCamera) setCameraToStep(stepIndex);

  if (stepIndex === 0) {
    drone.mesh.position.copy(droneStart);
    drone.setPackage(pkg);
    car.mesh.visible = false;
    car.active = false;
    setPodGlow(0.5);
    return;
  }

  if (stepIndex === 1) {
    drone.mesh.position.copy(droneAbovePod);
    drone.setPackage(pkg);
    car.mesh.visible = false;
    setPodGlow(0.9);
    return;
  }

  if (stepIndex === 2) {
    drone.mesh.position.copy(droneAbovePod);
    if (drone.package) drone.dropPackage();
    pkg.position.copy(podSlotPos);
    scene.add(pkg);
    car.mesh.visible = false;
    setPodGlow(1);
    return;
  }

  if (stepIndex === 3) {
    drone.mesh.position.copy(droneAbovePod);
    scene.remove(pkg);
    car.spawn(new THREE.Vector3(podPosition.x - 2, 0, podPosition.z));
    car.setPackage(pkg);
    car.mesh.visible = true;
    setPodGlow(0.9);
    return;
  }

  if (stepIndex === 4) {
    drone.mesh.position.copy(droneAbovePod);
    car.mesh.position.set(doorstep.x + 1, 0, doorstep.z - 1.5);
    const dropped = car.dropPackage();
    if (dropped) dropped.position.copy(doorstep);
    setPodGlow(0.5);
  }
}

function goToStepInstant(stepIndex) {
  stopPlayJourney();
  if (timeline) timeline.kill();
  currentStep = stepIndex;
  updateStoryUI(stepIndex);
  setCameraToStep(stepIndex, 0.4);
  scene.add(drone.mesh);

  if (stepIndex === 0) {
    drone.mesh.position.copy(droneStart);
    drone.setPackage(pkg);
    car.mesh.visible = false;
    setPodGlow(0.5);
  } else if (stepIndex === 1) {
    drone.mesh.position.copy(droneAbovePod);
    drone.setPackage(pkg);
    car.mesh.visible = false;
    setPodGlow(0.9);
  } else if (stepIndex === 2) {
    drone.mesh.position.copy(droneAbovePod);
    if (drone.package) drone.dropPackage();
    pkg.position.copy(podSlotPos);
    scene.add(pkg);
    car.mesh.visible = false;
    setPodGlow(1);
  } else if (stepIndex === 3) {
    drone.mesh.position.copy(droneAbovePod);
    scene.remove(pkg);
    car.spawn(new THREE.Vector3(podPosition.x - 2, 0, podPosition.z));
    car.setPackage(pkg);
    car.mesh.visible = true;
    setPodGlow(0.9);
  } else {
    drone.mesh.position.copy(droneAbovePod);
    car.mesh.position.set(doorstep.x + 1, 0, doorstep.z - 1.5);
    const dropped = car.dropPackage();
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

// Hide scroll hint after user scrolls down a bit
ScrollTrigger.create({
  trigger: '#story-viewport',
  start: 'top top',
  end: 'top+=120 top',
  onUpdate: (self) => {
    if (self.progress > 0.15) dismissHint();
  }
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
  
  // Update city (traffic + phase opacity)
  city.updateForPhase(phaseIndex, progress, podPosition);
  city.updateTraffic(delta);

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
  car.update(delta);
  render();
}
animate();

initSolutions();
initTechnology();
initBenefits();
initCta();

function initInnovativeFeatures() {
  // --- Custom Cursor ---
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-dot-outline');

  if (cursorDot && cursorOutline) {
    window.addEventListener('mousemove', (e) => {
      const posX = e.clientX;
      const posY = e.clientY;

      // Cursor dot follows instantly
      cursorDot.style.left = `${posX}px`;
      cursorDot.style.top = `${posY}px`;

      // Cursor outline follows with a slight delay (using GSAP for smoothness)
      gsap.to(cursorOutline, {
        x: posX,
        y: posY,
        duration: 0.15,
        ease: 'power2.out'
      });
    });

    // Hover effect
    const interactiveElements = document.querySelectorAll('a, button, .card-feature');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
  }

  // --- Text Scramble Effect ---
  const scrambleText = (element) => {
    const originalText = element.dataset.originalText || element.innerText;
    element.dataset.originalText = originalText;
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    let iterations = 0;

    const interval = setInterval(() => {
      element.innerText = originalText
        .split('')
        .map((letter, index) => {
          if (index < iterations) {
            return originalText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iterations >= originalText.length) {
        clearInterval(interval);
      }

      iterations += 1 / 3;
    }, 30);
  };

  const title = document.querySelector('.story-title');
  if (title) {
    // Wait a bit for initial load
    setTimeout(() => scrambleText(title), 500);
  }

  // --- Scroll Animations ---
  const sections = document.querySelectorAll('.section-2d');
  sections.forEach(section => {
    gsap.from(section.children, {
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });
  });

  // --- 3D Tilt Effect ---
  const cards = document.querySelectorAll('.card-feature');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg rotation
      const rotateY = ((x - centerX) / centerX) * 10;

      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY,
        duration: 0.5,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  });
}

initInnovativeFeatures();
