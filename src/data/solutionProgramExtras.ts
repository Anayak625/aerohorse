import type {
  SolutionOutcome,
  SolutionPlatform,
  SolutionStat,
  SolutionWorkflowStep,
} from './solutionsContent'
import { stats } from '../lib/site'

export interface SolutionQuote {
  text: string
  attribution: string
}

export interface SolutionProgramExtras {
  tagline: string
  challenge: string
  approach: string
  stats: SolutionStat[]
  workflow: SolutionWorkflowStep[]
  outcomes: SolutionOutcome[]
  platforms: SolutionPlatform[]
  quote?: SolutionQuote
}

export const solutionProgramExtras: Record<string, SolutionProgramExtras> = {
  'law-enforcement': {
    tagline: 'Decisions made with eyes on scene — not guesswork at the door',
    challenge:
      'Officers often arrive blind to layout, threats, and subject location. Traditional response puts personnel in the fatal funnel before command has a complete picture.',
    approach:
      'AeroHorse layers outdoor overwatch with indoor tactical assets so command sees the full situation — perimeter, entries, and interior context — before making contact.',
    stats: [
      { value: '3.4', unit: '×', label: 'Faster threat assessment' },
      { value: '62', unit: '%', label: 'Reported risk reduction' },
      { value: '< 70', unit: 's', label: 'DFR scene arrival' },
      { value: '24/7', label: 'Live overwatch capable' },
    ],
    workflow: [
      {
        step: '01',
        title: 'Priority call triaged',
        description: 'Dispatch flags high-risk events and triggers the nearest aerial asset — DFR or tactical overwatch.',
      },
      {
        step: '02',
        title: 'Perimeter established',
        description: 'Guardian provides 360° exterior video while Lemur 2 stages for interior clearance if needed.',
      },
      {
        step: '03',
        title: 'Interior intel gathered',
        description: 'Lemur 2 maps rooms, identifies subjects, and supports negotiation via two-way audio.',
      },
      {
        step: '04',
        title: 'Deliberate contact',
        description: 'Command clears teams when layout and threats are understood — reducing use-of-force exposure.',
      },
    ],
    outcomes: [
      {
        title: 'Safer entries',
        metric: '↑ Officer safety',
        description: 'Teams know what is behind the door before breaching or making contact.',
      },
      {
        title: 'Faster resolution',
        metric: '3.4× assessment',
        description: 'Barricade and crisis incidents resolve with better intel and fewer surprises.',
      },
      {
        title: 'De-escalation support',
        metric: '2-way audio',
        description: 'Negotiators communicate through Lemur 2 without exposing personnel.',
      },
    ],
    platforms: [
      {
        name: 'Lemur 2',
        role: 'Indoor tactical clearance, barricades, and crisis negotiation',
        href: '/lemur',
        accent: 'rose',
      },
      {
        name: 'Guardian',
        role: 'Perimeter overwatch, pursuit support, and outdoor DFR',
        href: '/guardian',
        accent: 'gold',
      },
      {
        name: 'DFR Program',
        role: 'Autonomous 911 response at patrol scale',
        href: '/dfr',
        accent: 'indigo',
      },
    ],
    quote: {
      text: 'When seconds count, aerial intel lets us slow the situation down before anyone goes through the door.',
      attribution: 'Major Incident Commander · West Coast agency',
    },
  },
  dfr: {
    tagline: 'Autonomous eyes on scene before the first unit arrives',
    challenge:
      'Patrol cannot be everywhere at once. Low-priority and high-priority calls alike wait for ground units while situations evolve unseen.',
    approach:
      'Guardian stations launch autonomously on 911 triggers, fly pre-approved corridors, and stream encrypted video to dispatch and MDTs — no pilot required.',
    stats: [
      { value: stats.arrivalTime, label: 'Avg. scene arrival' },
      { value: stats.callsCleared, label: 'Calls cleared solo' },
      { value: stats.fasterResponse, label: 'Faster response' },
      { value: stats.coverage, label: 'Program uptime' },
    ],
    workflow: [
      {
        step: '01',
        title: '911 call received',
        description: 'LiveOps receives CAD data and instantly queues the nearest Guardian station.',
      },
      {
        step: '02',
        title: 'Autonomous launch',
        description: 'Station opens, aircraft routes to coordinates via approved air corridors.',
      },
      {
        step: '03',
        title: 'Eyes on scene',
        description: `4K and thermal video stream to dispatch and responding units in ${stats.arrivalTimeLong}.`,
      },
      {
        step: '04',
        title: 'Resolve or dispatch',
        description: 'Supervisors clear calls remotely or send ground units with full situational awareness.',
      },
    ],
    outcomes: [
      {
        title: 'Faster response',
        metric: stats.fasterResponse,
        description: 'Agencies report dramatically shorter time-to-eyes-on-scene vs. patrol alone.',
      },
      {
        title: 'Fewer dispatches',
        metric: stats.callsCleared,
        description: 'Low-priority calls closed with aerial confirmation — saving patrol hours.',
      },
      {
        title: 'Always available',
        metric: '24/7/365',
        description: 'No staffing gaps — autonomous launch whenever the station is online.',
      },
    ],
    platforms: [
      {
        name: 'Guardian',
        role: 'Long-range aircraft, thermal payload, and autonomous stations',
        href: '/guardian',
        accent: 'gold',
      },
      {
        name: 'LiveOps & DFR',
        role: 'CAD integration, corridor planning, and program operations',
        href: '/dfr',
        accent: 'rose',
      },
    ],
    quote: {
      text: 'DFR changed how we triage 911 — we see the scene before we send anyone into it.',
      attribution: 'DFR Program Manager · Southwest metro',
    },
  },
  'search-rescue': {
    tagline: 'Cover more terrain in less time — day or night',
    challenge:
      'Ground teams face vast search areas, limited visibility, and clock pressure. Every hour without detection reduces survival probability.',
    approach:
      'Guardian runs wide-area thermal grids while Lemur 2 searches confined urban spaces — both streaming live to incident command.',
    stats: [
      { value: '12', unit: 'km²/hr', label: 'Search coverage' },
      { value: '640', unit: 'p', label: 'Thermal resolution' },
      { value: '45', unit: 'min', label: 'Guardian endurance' },
      { value: '24/7', label: 'Night operations' },
    ],
    workflow: [
      {
        step: '01',
        title: 'Search box defined',
        description: 'IC establishes sectors; Guardian plots efficient grid patterns with GPS overlay.',
      },
      {
        step: '02',
        title: 'Thermal sweep',
        description: 'Aircraft detects heat signatures in brush, water edge, and urban rubble.',
      },
      {
        step: '03',
        title: 'Ground coordination',
        description: 'Live feed guides K9 and ground teams to high-probability areas.',
      },
      {
        step: '04',
        title: 'Confined follow-up',
        description: 'Lemur 2 clears structures, culverts, and vehicles ground teams cannot reach quickly.',
      },
    ],
    outcomes: [
      {
        title: 'Wider coverage',
        metric: '12 km²/hr',
        description: 'Search areas that would take ground teams days are scanned in hours.',
      },
      {
        title: 'Night capability',
        metric: 'Thermal IR',
        description: 'Operations continue after dark without pausing the mission clock.',
      },
      {
        title: 'Urban + wildland',
        metric: 'Dual platform',
        description: 'Outdoor Guardian and indoor Lemur 2 cover the full search environment.',
      },
    ],
    platforms: [
      {
        name: 'Guardian',
        role: 'Wide-area thermal search and extended flight time',
        href: '/guardian',
        accent: 'gold',
      },
      {
        name: 'Lemur 2',
        role: 'Confined-space and urban edge search',
        href: '/lemur',
        accent: 'rose',
      },
    ],
    quote: {
      text: 'Thermal from above found the hiker in terrain we would not have reached until morning.',
      attribution: 'SAR Coordinator · Mountain rescue unit',
    },
  },
  'fire-rescue': {
    tagline: 'Incident command with a live aerial picture',
    challenge:
      'Smoke, structure, and scale hide conditions crews cannot see from the street. Committing teams without overhead intel increases risk and time on scene.',
    approach:
      'Guardian maps fire progression and structural hotspots from altitude while Lemur 2 inspects interiors and hazmat standoff zones.',
    stats: [
      { value: '640', unit: 'p', label: 'Thermal IR' },
      { value: 'Live', label: 'Perimeter map' },
      { value: 'IP55', label: 'Weather rated' },
      { value: '2400', unit: ' lm', label: 'SkyBeam spotlight' },
    ],
    workflow: [
      {
        step: '01',
        title: 'Establish overwatch',
        description: 'Guardian launches to map fire front, exposures, and access routes for apparatus.',
      },
      {
        step: '02',
        title: 'Thermal assessment',
        description: 'Hotspots and extension paths are marked for command before interior commit.',
      },
      {
        step: '03',
        title: 'Hazmat standoff',
        description: 'Placards, valves, and leak sources are inspected from safe distance via zoom and thermal.',
      },
      {
        step: '04',
        title: 'Knockdown support',
        description: 'Continuous aerial feed through overhaul confirms no hidden extension.',
      },
    ],
    outcomes: [
      {
        title: 'Safer commits',
        metric: 'Pre-entry intel',
        description: 'Command sees roof and wall integrity indicators before sending crews inside.',
      },
      {
        title: 'Faster targeting',
        metric: 'Live thermal',
        description: 'Water and resources directed to actual fire seat — not smoke alone.',
      },
      {
        title: 'Hazmat distance',
        metric: 'Standoff recon',
        description: 'Identify threats without crossing the hot zone.',
      },
    ],
    platforms: [
      {
        name: 'Guardian',
        role: 'Structure and wildland overwatch, thermal mapping',
        href: '/guardian',
        accent: 'gold',
      },
      {
        name: 'Lemur 2',
        role: 'Interior recon and hazmat close inspection',
        href: '/lemur',
        accent: 'sage',
      },
    ],
    quote: {
      text: 'We knew where the fire was moving on the roof before we put crews on the ladder.',
      attribution: 'Battalion Chief · Urban fire department',
    },
  },
  healthcare: {
    tagline: 'Campus security without pulling clinicians into harm\'s way',
    challenge:
      'Large medical campuses have parking structures, multiple buildings, and after-hours vulnerability — but security staffing cannot be everywhere simultaneously.',
    approach:
      'Guardian patrols exteriors and parking while Lemur 2 supports interior corridor checks during lockdowns and security events.',
    stats: [
      { value: '24/7', label: 'Campus patrol' },
      { value: 'Dual', label: 'Indoor + outdoor' },
      { value: 'Enc', label: 'Live feed' },
      { value: 'NDAA', label: 'Compliant hardware' },
    ],
    workflow: [
      {
        step: '01',
        title: 'Routine patrol',
        description: 'Scheduled Guardian flights cover parking, helipads, and perimeter fencing.',
      },
      {
        step: '02',
        title: 'Alert response',
        description: 'Security operations center directs aircraft to alarms and access breaches.',
      },
      {
        step: '03',
        title: 'Lockdown support',
        description: 'Lemur 2 inspects corridors and common areas while buildings are secured.',
      },
      {
        step: '04',
        title: 'Document & review',
        description: 'Encrypted recordings support compliance, training, and incident debrief.',
      },
    ],
    outcomes: [
      {
        title: 'Wider coverage',
        metric: 'Full campus',
        description: 'One operator oversees more ground than foot patrols alone.',
      },
      {
        title: 'Clinical safety',
        metric: 'Remote intel',
        description: 'Security gains visibility without placing staff in unknown interiors.',
      },
      {
        title: 'Audit ready',
        metric: 'Recorded feed',
        description: 'Documented video for compliance and after-action review.',
      },
    ],
    platforms: [
      {
        name: 'Guardian',
        role: 'Campus perimeter, parking, and overnight overwatch',
        href: '/guardian',
        accent: 'gold',
      },
      {
        name: 'Lemur 2',
        role: 'Interior inspection and lockdown support',
        href: '/lemur',
        accent: 'rose',
      },
    ],
    quote: {
      text: 'Our security team finally has eyes across the full campus without walking every wing at 2 a.m.',
      attribution: 'Director of Security · Academic medical center',
    },
  },
  logistics: {
    tagline: 'Yard and aisle visibility without stopping operations',
    challenge:
      'Large facilities lose hours to manual walk-throughs, dock disputes, and aisle obstructions that are hard to spot from the ground.',
    approach:
      'Guardian monitors yards and dock lines on schedule while Lemur 2 flies inventory aisles during live operations.',
    stats: [
      { value: 'Live', label: 'Dock monitoring' },
      { value: '31', unit: 'min', label: 'Lemur flight time' },
      { value: '4K', label: 'Damage documentation' },
      { value: 'Enc', label: 'Ops center feed' },
    ],
    workflow: [
      {
        step: '01',
        title: 'Yard overwatch',
        description: 'Guardian scans trailer lines, gate activity, and perimeter on a set schedule.',
      },
      {
        step: '02',
        title: 'Dock verification',
        description: 'Live feed confirms trailer presence, door status, and loading activity.',
      },
      {
        step: '03',
        title: 'Aisle inspection',
        description: 'Lemur 2 documents rack damage, obstructions, and signage without forklifts stopping.',
      },
      {
        step: '04',
        title: 'Remote review',
        description: 'Regional managers audit sites from encrypted streams — fewer travel hours.',
      },
    ],
    outcomes: [
      {
        title: 'Less downtime',
        metric: 'In-operation flights',
        description: 'Aisle checks without shutting down forklift lanes.',
      },
      {
        title: 'Claims evidence',
        metric: '4K record',
        description: 'Document damage and inventory issues with timestamped video.',
      },
      {
        title: 'Multi-site scale',
        metric: 'Remote ops',
        description: 'One center monitors multiple yards across a network.',
      },
    ],
    platforms: [
      {
        name: 'Guardian',
        role: 'Yard, dock, and perimeter monitoring',
        href: '/guardian',
        accent: 'gold',
      },
      {
        name: 'Lemur 2',
        role: 'Warehouse aisle and racking inspection',
        href: '/lemur',
        accent: 'amber',
      },
    ],
    quote: {
      text: 'We cut weekly walk-through hours and caught dock issues the same day they happened.',
      attribution: 'Operations Director · National 3PL',
    },
  },
}
