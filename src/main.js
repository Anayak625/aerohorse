import './styles.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createScene } from './webgl/scene.js';
import { createCity } from './webgl/city.js';
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
scene.add(camera); // Required for children of camera to be part of scene graph if needed

const city = createCity(scene);
// Camera positions per section (cinematic)
const cameraKeyframes = [
  { position: [0, 35, 55], lookAt: [0, 5, 0] },     // Hero: High angle view
  { position: [15, 25, 15], lookAt: [0, 10, 0] },   // Route: Follow drone
  { position: [5, 5, 20], lookAt: [5, 2, 5] },      // Pod: Close up on Pod
  { position: [0, 10, 10], lookAt: [0, 0, 5] },     // Delivery: Street level
  { position: [0, 55, 0], lookAt: [0, 0, 0] },      // Scale: Top down view
];

// --- STORY ASSETS ---
import { Drone } from './webgl/drone.js';
import { PodNetwork } from './webgl/pods.js';
import { Rider } from './webgl/rider.js';
import { createPackage } from './webgl/package.js';
import { createFlightPath, createPathVisual } from './webgl/routes.js';

// Initialize Actors
const pods = new PodNetwork(scene, { 
  ...city.getStreetGridParams(), 
  streetPositions: city.streetPositions 
}); // Ensure city exposes this
const drone = new Drone(scene, camera);
const rider = new Rider(scene);
const pkg = createPackage();

// Setup Story State
const story = {
  droneStart: new THREE.Vector3(0, -1, -5), // Local to camera: Down 1, Forward 5
  podLocation: pods.pods[0] ? pods.pods[0].position : new THREE.Vector3(10, 0, 10), // Target Pod
  deliveryDest: new THREE.Vector3(20, 0, 20), // Final customer location
};

// Initial State
drone.setPackage(pkg);
drone.mesh.position.copy(story.droneStart);
drone.mesh.rotation.set(0.1, 0.7, 0.05); // Dynamic tilt (pitch, yaw, roll)

// Create Flight Path Visual
// Create Flight Path Visual
// const flightCurve = createFlightPath(story.droneStart, story.podLocation, 20);
// const flightPathVis = createPathVisual(flightCurve);
// scene.add(flightPathVis);


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

    // Camera Interpolation
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
    
    // --- DRONE STORY ANIMATION ---
    // Section 0->1: Drone Fly from Depot to Pod area
    if (progress < 0.4) { // Covering Hero + Route sections
      // STATIC DRONE
      /*
      const flightT = Math.min(1, progress * 2.5); // Normalize to 0-1 range earlier
      const pos = flightCurve.getPoint(flightT);
      drone.mesh.position.copy(pos);
      drone.mesh.lookAt(flightCurve.getPoint(Math.min(1, flightT + 0.01)));
      */
    } 
    // Section 2: Docking at Pod (Hover above)
    else if (progress >= 0.4 && progress < 0.6) {
      /*
      const dockT = (progress - 0.4) * 5; // 0 to 1
      const hoverPos = new THREE.Vector3(story.podLocation.x, 8, story.podLocation.z);
      const landedPos = new THREE.Vector3(story.podLocation.x, 2.8, story.podLocation.z); // On top of pod
      
      drone.mesh.position.lerpVectors(hoverPos, landedPos, dockT);
      
      if (dockT > 0.8) {
         // Drone drops package inside
         // visual trick: hide package from drone, show inside/on pod? 
         // For now, simplify: Drone lands
      }
      */
    }
    
    // Section 3: Drone Leaves, Rider Appears
    else if (progress >= 0.6 && progress < 0.8) {
       const handoffT = (progress - 0.6) * 5;
       
       // Drone flies away
       // drone.mesh.position.y = 2.8 + handoffT * 20;
       
       // Rider arrives
       if (!rider.active) rider.spawn(new THREE.Vector3(story.podLocation.x - 10, 0, story.podLocation.z));
       
       const riderStart = new THREE.Vector3(story.podLocation.x - 10, 0, story.podLocation.z);
       const riderPick = new THREE.Vector3(story.podLocation.x - 1.5, 0, story.podLocation.z);
       
       rider.mesh.position.lerpVectors(riderStart, riderPick, handoffT);
       rider.mesh.lookAt(riderPick);
    }
    
    // Section 4: Scale / End
    else {
       // Loop city traffic or general ambience
    }
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
    // ... leave animations same ...
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



// --- INTERACTIVITY ---
const mouse = new THREE.Vector2();
const targetMouse = new THREE.Vector2(); // Target mouse position for smoothing
const raycaster = new THREE.Raycaster();

window.addEventListener('mousemove', (event) => {
  // Update target instead of raw mouse
  targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Update scene state for other potential uses
  getState().mouse.copy(targetMouse);
});

// Animation loop
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  const delta = 0.016;
  time += delta;

  // Smooth mouse movement
  mouse.x += (targetMouse.x - mouse.x) * 0.05; // Smoothing factor
  mouse.y += (targetMouse.y - mouse.y) * 0.05;

  // Camera Parallax (subtle)
  if (getState().cameraTarget) {
    smoothLookAt.lerp(getState().cameraTarget, 0.08);
    // Add mouse parallax using smoothed mouse
    const parallax = new THREE.Vector3(mouse.x * 2, mouse.y * 2, 0);
    camera.lookAt(smoothLookAt.clone().add(parallax));
  }

  // Update Animations
  drone.update(time, delta);
  
  // Raycasting for Pod Interactivity
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(pods.group.children, true);
  
  if (intersects.length > 0) {
    document.body.style.cursor = 'pointer';
    // Could add visual highlight logic here
    // const podGroup = intersects[0].object.parent;
  } else {
    document.body.style.cursor = 'default';
  }

  render();
}

animate();

initSolutions();
initTechnology();
initBenefits();
initCta();
