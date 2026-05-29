# AeroHorse

> Technology in the service of life.

The marketing site for **AeroHorse** — a connected ecosystem of autonomous drones,
AI software, and intelligent docking stations built exclusively for public safety:
law enforcement, drone-as-first-responder (DFR) programs, search & rescue, and firefighting.

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling (custom design tokens in `tailwind.config.js`)
- **Framer Motion** for UI/page transitions
- **GSAP** + **ScrollTrigger** for scroll-driven animation
- **Lenis** for smooth scrolling
- **react-three-fiber** + **drei** for the 3D hero / technology visuals
- **react-router-dom** for routing

## Getting started

```bash
pnpm install      # or: npm install
pnpm dev          # start the dev server at http://localhost:5173
pnpm build        # type-check + production build to /dist
pnpm preview      # preview the production build locally
pnpm lint         # run ESLint
```

## Project structure

```
src/
├── components/
│   ├── Layout.tsx              # Header + Footer shell, smooth scroll, cursor
│   ├── sections/               # Homepage sections (Hero, Benefits, Products, …)
│   └── ui/                     # Reusable UI (Header, Footer, TextReveal, cursor, …)
├── hooks/                      # useLenis, useScrollReveal
├── lib/
│   ├── site.ts                 # ← Single source of truth for stats & content
│   └── utils.ts                # cn() class-merge helper
├── pages/                      # Route pages (Home, Guardian, Lemur, DFR, …)
├── index.css                   # Global styles, design primitives, animations
└── main.tsx                    # App entry
```

## Editing content

All headline metrics (response time, calls cleared, agency counts, contact details,
press outlets, partner agencies) live in **`src/lib/site.ts`**. Update them there once
and every page stays in sync — never hardcode these numbers in components.

## Routes

| Path         | Page                              |
| ------------ | --------------------------------- |
| `/`          | Home                              |
| `/guardian`  | Guardian (outdoor DFR drone)      |
| `/lemur`     | Lemur 2 (indoor tactical drone)   |
| `/dfr`       | Drone as First Responder program  |
| `/solutions` | Solutions by mission              |
| `/contact`   | Request a demo                    |

## Accessibility & performance

- Respects `prefers-reduced-motion` (animations and smooth scroll are disabled).
- The custom cursor is automatically disabled on touch / coarse-pointer devices.
- Heavy `three.js` code is split into its own vendor chunk (see `vite.config.ts`).
