import type { LucideIcon } from 'lucide-react'
import { Building2, Shield } from 'lucide-react'
import { guardianSpecsData, lemurSpecsData } from './droneSpecsData'
import type { SpecGroup, SpecHighlight } from '../components/sections/TechnicalSpecsSection'

export type DroneAccent = 'gold' | 'rose'
export type DroneModelType = 'outdoor' | 'indoor' | 'gltf'

export interface DroneHotspot {
  id: string
  label: string
  detail: string
  position: [number, number, number]
  specHighlight?: string
}

export interface DroneCatalogEntry {
  id: string
  name: string
  shortName: string
  tagline: string
  category: string
  description: string
  accent: DroneAccent
  chip: string
  modelType: DroneModelType
  modelUrl?: string
  detailHref: string
  image: string
  icon: LucideIcon
  highlights: SpecHighlight[]
  groups: SpecGroup[]
  features: string[]
  hotspots: DroneHotspot[]
  compare: {
    flightTime: string
    weight: string
    maxSpeed: string
    environment: string
    thermal: string
    audio: string
  }
}

export const droneCatalog: DroneCatalogEntry[] = [
  {
    id: 'guardian',
    name: 'Guardian',
    shortName: 'Guardian',
    tagline: 'Outdoor · Drone as First Responder',
    category: 'Outdoor operations',
    description:
      'Long-range autonomous aircraft with dual thermal sensors, 640× optical zoom, SkyBeam spotlight, and 45-minute endurance — built for DFR stations and perimeter overwatch.',
    accent: 'gold',
    chip: 'chip-gold',
    modelType: 'gltf',
    modelUrl: '/drone/scene.gltf',
    detailHref: '/guardian',
    image:
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=2070&auto=format&fit=crop',
    icon: Shield,
    highlights: guardianSpecsData.highlights,
    groups: guardianSpecsData.groups,
    features: [
      'Autonomous launch from Guardian stations',
      '4K + 640× thermal + telephoto payload',
      'IP55 all-weather airframe',
      '360° obstacle avoidance',
      'Encrypted live video to CAD & dispatch',
      '2,400 lm SkyBeam spotlight',
    ],
    hotspots: [
      {
        id: 'camera',
        label: 'Multi-sensor payload',
        detail: '4K wide · 640× zoom · 640p thermal · SkyBeam',
        position: [0, 0.2, 0.42],
        specHighlight: '4K',
      },
      {
        id: 'arm-ne',
        label: 'Propulsion arm',
        detail: '55 mph top speed · low-noise props',
        position: [0.72, 0.12, 0.38],
        specHighlight: '55',
      },
      {
        id: 'body',
        label: 'Airframe core',
        detail: '3.2 kg MTOW · IP55 sealed electronics',
        position: [0, -0.08, -0.12],
        specHighlight: 'IP55',
      },
      {
        id: 'arm-sw',
        label: 'OAS array',
        detail: '360° obstacle sensing for BVLOS corridors',
        position: [-0.68, 0.1, -0.52],
      },
    ],
    compare: {
      flightTime: '45 min',
      weight: '3.2 kg',
      maxSpeed: '55 mph',
      environment: 'Outdoor / DFR',
      thermal: '640 × 512',
      audio: '2-way (relay)',
    },
  },
  {
    id: 'lemur',
    name: 'Lemur 2',
    shortName: 'Lemur 2',
    tagline: 'Indoor · Tactical reconnaissance',
    category: 'Indoor operations',
    description:
      'Purpose-built for SWAT and tactical teams — room clearing, crisis negotiation, mesh networking, and a 30k RPM glass breaker in a 1.6 kg footprint.',
    accent: 'rose',
    chip: 'chip-rose',
    modelType: 'indoor',
    detailHref: '/lemur',
    image:
      'https://images.unsplash.com/photo-1588656606086-fb15bb03d980?q=80&w=2070&auto=format&fit=crop',
    icon: Building2,
    highlights: lemurSpecsData.highlights,
    groups: lemurSpecsData.groups,
    features: [
      'Doorway-scale footprint for interior flight',
      'Two-way speaker + cardioid microphone',
      'Radiometric thermal for low-light rooms',
      '30,000 RPM tungsten glass breaker',
      'Multi-node mesh relay',
      '31-minute endurance per battery',
    ],
    hotspots: [
      {
        id: 'cam',
        label: 'Sensor head',
        detail: '4K visual + 640p radiometric thermal',
        position: [0, 0.18, 0.32],
        specHighlight: '4K',
      },
      {
        id: 'breaker',
        label: 'Glass breaker',
        detail: '30k RPM tungsten tip for breach support',
        position: [0.28, -0.04, 0.14],
        specHighlight: '30k',
      },
      {
        id: 'audio',
        label: 'Audio payload',
        detail: 'Loudspeaker + mic for negotiation',
        position: [-0.26, 0.06, 0.16],
        specHighlight: '2-Way',
      },
      {
        id: 'frame',
        label: 'Protective frame',
        detail: '1.6 kg · cage for wall strikes',
        position: [0, -0.12, -0.08],
        specHighlight: '1.6',
      },
    ],
    compare: {
      flightTime: '31 min',
      weight: '1.6 kg',
      maxSpeed: '8 m/s',
      environment: 'Indoor / confined',
      thermal: '640 × 512',
      audio: '2-way onboard',
    },
  },
]

export function getDroneById(id: string): DroneCatalogEntry | undefined {
  return droneCatalog.find((d) => d.id === id)
}

export const compareRows: { key: keyof DroneCatalogEntry['compare']; label: string }[] = [
  { key: 'flightTime', label: 'Max flight time' },
  { key: 'weight', label: 'Takeoff weight' },
  { key: 'maxSpeed', label: 'Max speed' },
  { key: 'environment', label: 'Mission environment' },
  { key: 'thermal', label: 'Thermal imaging' },
  { key: 'audio', label: 'Communications' },
]
