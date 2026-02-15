import './styles.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createScene } from './webgl/scene.js';
import { createCity } from './webgl/city.js';
import { createPods } from './webgl/pods.js';
import { createRoutes } from './webgl/routes.js';
import { initSolutions } from './sections/solutions.js';
import { initTechnology } from './sections/technology.js';
import { initBenefits } from './sections/benefits.js';
import { initCta } from './sections/cta.js';

gsap.registerPlugin(ScrollTrigger);

// Header scroll state for glass effect
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });
}

const container = document.getElementById('webgl-container');
const scrollSections = document.querySelectorAll('.webgl-overlay');

// Total scroll height for WebGL narrative (5 sections × 100vh from .webgl-overlay)
const SECTION_COUNT = 5;
const sectionHeight = window.innerHeight;
const totalScrollHeight = sectionHeight * SECTION_COUNT;

const sceneApi = createScene(container);
const { scene, camera, setSection, getState, render } = sceneApi;

const city = createCity(scene);
const pods = createPods(scene, city);
const routes = createRoutes(scene, pods, city);

const focusedPodIndex = 18;
pods.setFocusedPod(focusedPodIndex);

const podPositions = pods.getPodPositions();
const focusPodPos = podPositions[focusedPodIndex];

// Camera positions per section (cinematic)
const cameraKeyframes = [
  { position: [0, 35, 55], lookAt: [0, 5, 0] },
  { position: [8, 22, 38], lookAt: [0, 8, 0] },
  { position: [5, 12, 25], lookAt: [focusPodPos.x, focusPodPos.y, focusPodPos.z] },
  { position: [0, 18, 32], lookAt: [2, 6, 0] },
  { position: [0, 55, 90], lookAt: [0, 5, 0] },
];

// Overlay titles visibility
scrollSections.forEach((el, i) => {
  const title = el.querySelector('.overlay-title');
  if (title) gsap.set(title, { opacity: 0, y: 24 });
  const heroContent = el.querySelector('.hero-content');
  if (heroContent) {
    gsap.set(heroContent.querySelector('.hero-logo'), { opacity: 0, y: 12 });
    gsap.set(heroContent.querySelectorAll('.hero-badge, .overlay-subtitle'), { opacity: 0, y: 16 });
  }
});

// Single ScrollTrigger that drives section index + progress
ScrollTrigger.create({
  start: 0,
  end: totalScrollHeight,
  onUpdate: (self) => {
    const progress = self.progress;
    const sectionIndex = Math.min(
      SECTION_COUNT - 1,
      Math.floor(progress * SECTION_COUNT)
    );
    const sectionProgress =
      progress * SECTION_COUNT - sectionIndex;
    setSection(sectionIndex, sectionProgress);

    const kf = cameraKeyframes[sectionIndex];
    const nextKf = cameraKeyframes[Math.min(sectionIndex + 1, SECTION_COUNT - 1)];
    const t = sectionProgress;
    camera.position.lerpVectors(
      new THREE.Vector3(...kf.position),
      new THREE.Vector3(...nextKf.position),
      t
    );
    const lookAt = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...kf.lookAt),
      new THREE.Vector3(...nextKf.lookAt),
      t
    );
    getState().cameraTarget.copy(lookAt);
  },
});

const smoothLookAt = new THREE.Vector3(0, 5, 0);

// Overlay title animations per section
scrollSections.forEach((section, i) => {
  const title = section.querySelector('.overlay-title');
  const heroContent = section.querySelector('.hero-content');
  const start = i * sectionHeight;
  ScrollTrigger.create({
    start,
    end: start + sectionHeight * 0.5,
    onEnter: () => {
      if (heroContent && i === 0) {
        gsap.to(heroContent.querySelector('.hero-logo'), { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        gsap.to(heroContent.querySelector('.hero-badge'), { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.08 });
        gsap.to(title, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.15 });
        gsap.to(heroContent.querySelector('.overlay-subtitle'), { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.28 });
      } else if (title) {
        gsap.to(title, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
      }
    },
    onLeaveBack: () => {
      if (heroContent && i === 0) {
        const els = [heroContent.querySelector('.hero-logo'), heroContent.querySelector('.hero-badge'), title, heroContent.querySelector('.overlay-subtitle')].filter(Boolean);
        gsap.to(els, { opacity: 0, y: 16, duration: 0.3 });
      } else if (title) gsap.to(title, { opacity: 0, y: 24, duration: 0.3 });
    },
    onLeave: () => {
      if (heroContent && i === 0) {
        const els = [heroContent.querySelector('.hero-logo'), heroContent.querySelector('.hero-badge'), title, heroContent.querySelector('.overlay-subtitle')].filter(Boolean);
        gsap.to(els, { opacity: 0, y: -12, duration: 0.3 });
      } else if (title) gsap.to(title, { opacity: 0, y: -12, duration: 0.3 });
    },
  });
});

// Mouse move for pod hover (raycast)
const state = getState();
const raycaster = state.raycaster;
const mouse = state.mouse;

container.addEventListener('mousemove', (e) => {
  const rect = container.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
});

container.addEventListener('mouseleave', () => {
  pods.setHoveredPod(-1);
});

// Tooltip element for pod hover
let tooltipEl = document.getElementById('pod-tooltip');
if (!tooltipEl) {
  tooltipEl = document.createElement('div');
  tooltipEl.id = 'pod-tooltip';
  tooltipEl.className = 'pod-tooltip';
  document.body.appendChild(tooltipEl);
}

const tooltipStyle = document.createElement('style');
tooltipStyle.textContent = `
  .pod-tooltip {
    position: fixed;
    z-index: 100;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(224, 53, 156, 0.3);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.9rem;
    color: #1a1a2e;
    box-shadow: 0 4px 20px rgba(26, 26, 46, 0.12);
    pointer-events: none;
    opacity: 0;
    transform: translate(-50%, -100%);
    transition: opacity 0.2s;
  }
  .pod-tooltip.visible { opacity: 1; }
  .pod-tooltip strong { color: #E0359C; }
  [data-theme="dark"] .pod-tooltip {
    background: rgba(19, 19, 31, 0.95);
    border-color: rgba(224, 53, 156, 0.4);
    color: #e2e8f0;
  }
  [data-theme="dark"] .pod-tooltip strong { color: #E0359C; }
`;
document.head.appendChild(tooltipStyle);

function updateTooltip() {
  const data = pods.getHoveredPodData();
  if (data && (state.sectionIndex === 2 || state.sectionIndex === 3)) {
    tooltipEl.innerHTML = `<strong>Delivery</strong> ${data.deliveryTime}<br><strong>Coverage</strong> ${data.coverage}`;
    tooltipEl.classList.add('visible');
  } else {
    tooltipEl.classList.remove('visible');
  }
}

// Animation loop
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  const delta = 0.016;
  time += delta;

  const { sectionIndex, sectionProgress } = state;
  pods.update(delta, sectionIndex, sectionProgress);
  routes.update(sectionIndex, sectionProgress);

  if (state.cameraTarget) {
    smoothLookAt.lerp(state.cameraTarget, 0.08);
    camera.lookAt(smoothLookAt);
  }

  // Raycast for pod hover
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObject(pods.instanced, true);
  if (hits.length) {
    const instanceId = hits[0].instanceId;
    pods.setHoveredPod(instanceId);
  } else {
    pods.setHoveredPod(-1);
  }
  updateTooltip();

  const rect = container.getBoundingClientRect();
  if (mouse.x >= -1 && mouse.x <= 1 && mouse.y >= -1 && mouse.y <= 1) {
    tooltipEl.style.left = `${rect.left + (mouse.x * 0.5 + 0.5) * rect.width}px`;
    tooltipEl.style.top = `${rect.top + (-mouse.y * 0.5 + 0.5) * rect.height - 16}px`;
  }

  render();
}

animate();

initSolutions();
initTechnology();
initBenefits();
initCta();
