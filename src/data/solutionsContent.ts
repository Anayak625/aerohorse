import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  FlameKindling,
  HeartPulse,
  Map,
  Siren,
  Truck,
} from 'lucide-react'
import { solutionProgramExtras, type SolutionProgramExtras } from './solutionProgramExtras'

export type SolutionAccent = 'gold' | 'rose' | 'indigo' | 'sage' | 'live' | 'amber'

export interface SolutionRecommendation {
  product: string
  href: string
  accent: SolutionAccent
}

export interface SolutionStat {
  value: string
  unit?: string
  label: string
}

export interface SolutionWorkflowStep {
  step: string
  title: string
  description: string
}

export interface SolutionPlatform {
  name: string
  role: string
  href: string
  accent: SolutionAccent
}

export interface SolutionOutcome {
  title: string
  metric?: string
  description: string
}

export interface SolutionQuote {
  text: string
  attribution: string
}

export interface SolutionVertical {
  id: string
  icon: LucideIcon
  chip: string
  title: string
  headline: string
  body: string
  bullets: string[]
  recommendations: SolutionRecommendation[]
  image: string
  imagePosition: 'left' | 'right'
  accent: SolutionAccent
}

export interface SolutionOverviewCard {
  id: string
  verticalId: string
  icon: LucideIcon
  chip: string
  tag: string
  headline: string
  body: string
  metrics: { label: string; value: string }[]
  metricColor: string
  borderGlow: string
  topBar: string
}

export interface SolutionNavLink {
  label: string
  shortLabel: string
  desc: string
  href: string
  icon: LucideIcon
}

export const solutionVerticals: SolutionVertical[] = [
  {
    id: 'law-enforcement',
    icon: Building2,
    chip: 'chip-gold',
    title: 'Law Enforcement',
    headline: 'Intel that de-escalates before contact',
    body: 'From active shooter and barricaded subjects to warrant service, AeroHorse gives command real-time video and audio — so teams make deliberate decisions instead of rushed ones.',
    bullets: [
      'Indoor clearance and room clearing with Lemur 2',
      'Perimeter and overwatch support with Guardian',
      'Live feed to command posts and responding units',
      'Two-way audio for crisis negotiation scenarios',
    ],
    recommendations: [
      { product: 'Lemur 2 — indoor tactical', href: '/lemur', accent: 'rose' },
      { product: 'Guardian — outdoor overwatch', href: '/guardian', accent: 'gold' },
      { product: 'DFR program — patrol scale', href: '/dfr', accent: 'indigo' },
    ],
    image:
      'https://images.unsplash.com/photo-1588656606086-fb15bb03d980?q=80&w=2070&auto=format&fit=crop',
    imagePosition: 'left',
    accent: 'gold',
  },
  {
    id: 'dfr',
    icon: Siren,
    chip: 'chip-rose',
    title: 'Drone as First Responder',
    headline: 'On scene in seconds, not minutes',
    body: 'Autonomous launch from Guardian stations, pre-approved corridors, and encrypted live video — purpose-built for agencies running true DFR at scale.',
    bullets: [
      'Autonomous takeoff and routing to 911 coordinates',
      'Eyes on scene before the first patrol unit arrives',
      'Clear low-priority calls without officer dispatch',
      'NDAA-compliant hardware made in the USA',
    ],
    recommendations: [
      { product: 'Guardian aircraft & stations', href: '/guardian', accent: 'gold' },
      { product: 'DFR program overview', href: '/dfr', accent: 'rose' },
    ],
    image:
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=2070&auto=format&fit=crop',
    imagePosition: 'right',
    accent: 'rose',
  },
  {
    id: 'search-rescue',
    icon: Map,
    chip: 'chip-indigo',
    title: 'Search & Rescue',
    headline: 'Cover more ground from a safer altitude',
    body: 'Thermal sensors, wide-area search grids, and live terrain context help SAR teams locate subjects faster — day or night, in wilderness and urban edge cases.',
    bullets: [
      'Thermal detection for subjects in brush and low light',
      'Wide-area search patterns with live GPS context',
      'Long endurance for extended missing-person operations',
      'Stream intel to incident command and ground teams',
    ],
    recommendations: [
      { product: 'Guardian — long-range SAR', href: '/guardian', accent: 'gold' },
      { product: 'Lemur 2 — confined / urban SAR', href: '/lemur', accent: 'rose' },
    ],
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop',
    imagePosition: 'left',
    accent: 'indigo',
  },
  {
    id: 'fire-rescue',
    icon: FlameKindling,
    chip: 'chip-sage',
    title: 'Fire & Rescue',
    headline: 'See through smoke and structure',
    body: 'Identify hotspots, assess roof and wall integrity, and locate victims from above — giving incident commanders a live picture before crews commit to the building.',
    bullets: [
      'Thermal imaging through smoke and haze',
      'Structure and wildland perimeter mapping',
      'Hazmat standoff recon without crossing the hot zone',
      'Continuous overwatch during knockdown and overhaul',
    ],
    recommendations: [
      { product: 'Guardian — fire overwatch', href: '/guardian', accent: 'gold' },
      { product: 'Lemur 2 — interior / hazmat', href: '/lemur', accent: 'sage' },
    ],
    image:
      'https://images.unsplash.com/photo-1484837562475-40b904e5d4cb?q=80&w=2072&auto=format&fit=crop',
    imagePosition: 'right',
    accent: 'sage',
  },
  {
    id: 'healthcare',
    icon: HeartPulse,
    chip: 'chip-live',
    title: 'Healthcare',
    headline: 'Protect facilities. Accelerate response.',
    body: 'Hospitals and health systems use AeroHorse for campus security overwatch, parking and perimeter monitoring, and interior inspection — without pulling clinical staff into unsafe situations.',
    bullets: [
      'After-hours campus and parking structure patrols',
      'Interior corridor checks with Lemur 2 where RF allows',
      'Support security teams during code silver / lockdown events',
      'Documented live video for compliance and incident review',
    ],
    recommendations: [
      { product: 'Guardian — campus overwatch', href: '/guardian', accent: 'gold' },
      { product: 'Lemur 2 — interior inspection', href: '/lemur', accent: 'rose' },
    ],
    image:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2073&auto=format&fit=crop',
    imagePosition: 'left',
    accent: 'live',
  },
  {
    id: 'logistics',
    icon: Truck,
    chip: 'chip-gold',
    title: 'Logistics',
    headline: 'Keep docks, yards, and warehouses moving',
    body: 'Distribution centers and industrial sites gain live visibility of receiving lanes, yard traffic, and hard-to-reach inventory aisles — reducing downtime and manual walk-throughs.',
    bullets: [
      'Dock and trailer line monitoring from a fixed overwatch',
      'Indoor aisle flights for inventory spot-checks and damage claims',
      'Safety audits without stopping forklift operations',
      'Encrypted feeds for ops centers and remote managers',
    ],
    recommendations: [
      { product: 'Guardian — yard & perimeter', href: '/guardian', accent: 'gold' },
      { product: 'Lemur 2 — warehouse interiors', href: '/lemur', accent: 'amber' },
    ],
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
    imagePosition: 'right',
    accent: 'amber',
  },
]

/** DFR uses /dfr; other programs use /solutions/:id */
export function solutionProgramPath(verticalId: string): string {
  if (verticalId === 'dfr') return '/dfr'
  return `/solutions/${verticalId}`
}

export type EnrichedSolutionVertical = SolutionVertical & SolutionProgramExtras

export function getSolutionBySlug(slug: string): EnrichedSolutionVertical | undefined {
  const vertical = solutionVerticals.find((v) => v.id === slug)
  const extra = solutionProgramExtras[slug]
  if (!vertical || !extra) return undefined
  return { ...vertical, ...extra }
}

export const solutionNavLinks: SolutionNavLink[] = solutionVerticals.map((v) => ({
  label: v.title,
  shortLabel:
    v.id === 'law-enforcement'
      ? 'Law enforcement'
      : v.id === 'search-rescue'
        ? 'Search & rescue'
        : v.id === 'fire-rescue'
          ? 'Fire & rescue'
          : v.id === 'dfr'
            ? 'DFR'
            : v.title,
  desc: v.headline,
  href: solutionProgramPath(v.id),
  icon: v.icon,
}))

const overviewMeta: Record<
  string,
  Pick<SolutionOverviewCard, 'metrics' | 'metricColor' | 'borderGlow' | 'topBar' | 'body'>
> = {
  'law-enforcement': {
    body: 'Deploy aerial intel on priority calls, assess threats remotely, and support de-escalation before units make entry.',
    metrics: [
      { label: 'Faster assessment', value: '3.4×' },
      { label: 'Risk reduction', value: '62%' },
    ],
    metricColor: 'text-gold',
    borderGlow: 'hover:border-gold/20',
    topBar: 'bg-gradient-to-r from-gold/60 to-goldDim/20',
  },
  dfr: {
    body: 'Station-to-scene in under 70 seconds with no pilot on the sticks — built for 24/7 DFR programs.',
    metrics: [
      { label: 'Avg. arrival', value: '< 70s' },
      { label: 'Calls cleared', value: '1 in 3' },
    ],
    metricColor: 'text-rose',
    borderGlow: 'hover:border-rose/20',
    topBar: 'bg-gradient-to-r from-rose/60 to-roseDim/20',
  },
  'search-rescue': {
    body: 'Thermal search, wide-area patterns, and live mapping help teams cover more ground in less time.',
    metrics: [
      { label: 'Search area / hr', value: '12 km²' },
      { label: 'Detection', value: 'Thermal' },
    ],
    metricColor: 'text-indigo',
    borderGlow: 'hover:border-indigo/20',
    topBar: 'bg-gradient-to-r from-indigo/60 to-indigoDim/20',
  },
  'fire-rescue': {
    body: 'Live overwatch for structure fires, wildland incidents, and hazmat — without putting crews in blind spots.',
    metrics: [
      { label: 'Perimeter map', value: 'Live' },
      { label: 'Thermal IR', value: '640p' },
    ],
    metricColor: 'text-sage',
    borderGlow: 'hover:border-sage/20',
    topBar: 'bg-gradient-to-r from-sage/60 to-sageDim/20',
  },
  healthcare: {
    body: 'Support hospital security, campus overwatch, and time-sensitive operations with compliant aerial systems.',
    metrics: [
      { label: 'Campus coverage', value: '24/7' },
      { label: 'Indoor + outdoor', value: 'Dual' },
    ],
    metricColor: 'text-live',
    borderGlow: 'hover:border-live/25',
    topBar: 'bg-gradient-to-r from-live/50 to-emerald-700/20',
  },
  logistics: {
    body: 'Track inventory movement, monitor loading docks, and inspect large facilities without shutting down operations.',
    metrics: [
      { label: 'Dock checks', value: 'Live' },
      { label: 'Indoor flight', value: 'Lemur 2' },
    ],
    metricColor: 'text-gold',
    borderGlow: 'hover:border-gold/20',
    topBar: 'bg-gradient-to-r from-gold/60 to-goldDim/20',
  },
}

export const solutionOverviewCards: SolutionOverviewCard[] = solutionVerticals.map((v) => {
  const meta = overviewMeta[v.id]
  return {
    id: v.id,
    verticalId: v.id,
    icon: v.icon,
    chip: v.chip.startsWith('chip ') ? v.chip : `chip ${v.chip}`,
    tag: v.title,
    headline: v.headline,
    body: meta.body,
    metrics: meta.metrics,
    metricColor: meta.metricColor,
    borderGlow: meta.borderGlow,
    topBar: meta.topBar,
  }
})

export const accentStyles = {
  gold: {
    icon: 'text-gold',
    border: 'border-gold/30',
    link: 'text-gold hover:text-goldLight',
    grad: 'grad-gold',
  },
  rose: {
    icon: 'text-rose',
    border: 'border-rose/30',
    link: 'text-rose hover:text-roseLight',
    grad: 'grad-rose',
  },
  indigo: {
    icon: 'text-indigo',
    border: 'border-indigo/30',
    link: 'text-indigo hover:text-indigoLight',
    grad: 'grad-indigo',
  },
  sage: {
    icon: 'text-sage',
    border: 'border-sage/30',
    link: 'text-sage hover:text-indigoLight',
    grad: 'grad-sage',
  },
  live: {
    icon: 'text-live',
    border: 'border-live/30',
    link: 'text-live hover:text-emerald-600',
    grad: 'grad-sage',
  },
  amber: {
    icon: 'text-gold',
    border: 'border-gold/30',
    link: 'text-gold hover:text-goldLight',
    grad: 'grad-gold',
  },
} as const
