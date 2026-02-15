# Aerohorse

Futuristic landing page for a drone delivery company. Built with **Vite**, **Three.js**, **GSAP**, and **Tailwind CSS**.

## Tech stack

- **Vite** — build and dev server
- **Vanilla JS** — no framework
- **Three.js** — WebGL city, pods, and routes
- **GSAP + ScrollTrigger** — scroll-driven narrative and 2D section animations
- **Tailwind CSS** — 2D sections styling

## Design

- Dark futuristic theme
- Neon blue/cyan accents (`#00d4ff`)
- Minimal, cinematic, smooth transitions

## WebGL experience (scroll-driven)

1. **Hero** — Low-poly city at night; glowing pods; network lines animate on scroll. *"Urban delivery. Reinvented."*
2. **Route activation** — Package route appears; node-to-node path. *"AI selects the fastest route."*
3. **Pod interaction** — Camera zooms to a pod; coverage radius; hover tooltip (delivery time, coverage). *"Pods every 500 meters."*
4. **Delivery flow** — Blue (drone) and green (rider) paths; pod as transition node. *"Drone to pod. Rider to doorstep."*
5. **Scale out** — Camera zooms out; city and pods scale. *"Built to scale across entire cities."*

Then 2D sections: Solutions, Technology, Benefits, CTA, Footer.

## Project structure

```
/src
  /webgl
    scene.js   — Three.js scene, camera, renderer
    city.js   — Low-poly city
    pods.js   — Instanced pod meshes, pulse, hover
    routes.js — Network lines, path route, drone/rider tubes
  /sections
    solutions.js
    technology.js
    benefits.js
    cta.js
  main.js
  styles.css
index.html
```

## Run locally

```bash
npm install
npm run dev
```

Then open the URL shown (e.g. `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Technical notes

- Single WebGL canvas (fixed, full viewport).
- Pods use **instanced meshes** for performance.
- Routes use **TubeGeometry** for 3D lines.
- Scroll progress drives section index and camera keyframes; overlay copy is shown per section.
- Pod hover uses raycasting; tooltip shows delivery time and coverage in pod section.
