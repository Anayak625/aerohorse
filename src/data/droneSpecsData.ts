import { Camera, Plane, Radio } from 'lucide-react'
import type { SpecGroup, SpecHighlight } from '../components/sections/TechnicalSpecsSection'

export const guardianSpecsData = {
  highlights: [
    { value: '45', unit: 'min', label: 'Max flight time' },
    { value: 'IP55', label: 'Weather rating' },
    { value: '3.2', unit: 'kg', label: 'Takeoff weight' },
    { value: '55', unit: 'mph', label: 'Top speed' },
  ] satisfies SpecHighlight[],
  groups: [
    {
      id: 'Aircraft',
      title: 'Airframe & performance',
      subtitle: 'Built for rapid deployment and all-weather DFR operations.',
      icon: Plane,
      chip: 'chip-gold',
      iconWrap: 'border-gold/20 bg-goldGlow',
      iconColor: 'text-gold',
      border: 'border-gold/15',
      specs: [
        { label: 'Weight (with battery)', value: '3.2 kg' },
        { label: 'Dimensions (folded)', value: '250 × 200 × 150 mm' },
        { label: 'Max flight time', value: '45 minutes' },
        { label: 'Max speed', value: '55 mph (89 km/h)' },
        { label: 'IP rating', value: 'IP55' },
        { label: 'Operating temperature', value: '−20°C to 50°C' },
      ],
    },
    {
      id: 'Payload',
      title: 'Camera & sensors',
      subtitle: 'Multi-sensor imaging for day, night, and thermal overwatch.',
      icon: Camera,
      chip: 'chip-rose',
      iconWrap: 'border-rose/25 bg-deep',
      iconColor: 'text-rose',
      border: 'border-rose/15',
      specs: [
        { label: 'Wide camera', value: '4K / 60fps · 1/2" CMOS' },
        { label: 'Telephoto', value: '640× hybrid optical zoom' },
        { label: 'Thermal IR', value: '640 × 512 · 30fps' },
        { label: 'SkyBeam spotlight', value: '2,400 lumens' },
        { label: 'Obstacle avoidance', value: '360° OAS array' },
        { label: 'Video transmission', value: 'Encrypted live feed' },
      ],
    },
  ] satisfies SpecGroup[],
}

export const lemurSpecsData = {
  highlights: [
    { value: '31', unit: 'min', label: 'Max flight time' },
    { value: '1.6', unit: 'kg', label: 'Takeoff weight' },
    { value: '30k', unit: 'RPM', label: 'Glass breaker' },
    { value: '4K', label: 'Video resolution' },
  ] satisfies SpecHighlight[],
  groups: [
    {
      id: 'Platform',
      title: 'Airframe & mobility',
      subtitle: 'Compact footprint for doorways, stairwells, and confined interiors.',
      icon: Plane,
      chip: 'chip-rose',
      iconWrap: 'border-rose/25 bg-deep',
      iconColor: 'text-rose',
      border: 'border-rose/15',
      specs: [
        { label: 'Weight (with battery)', value: '1.6 kg' },
        { label: 'Dimensions', value: '280 × 280 × 120 mm' },
        { label: 'Max flight time', value: '31 minutes' },
        { label: 'Max speed', value: '8 m/s (indoor)' },
        { label: 'Wind resistance', value: 'Up to 8 m/s' },
        { label: 'Operating temperature', value: '−10°C to 40°C' },
      ],
    },
    {
      id: 'Systems',
      title: 'Sensors & communications',
      subtitle: 'See, hear, and coordinate in zero-light and RF-challenging environments.',
      icon: Radio,
      chip: 'chip-indigo',
      iconWrap: 'border-indigo/25 bg-deep',
      iconColor: 'text-indigo',
      border: 'border-indigo/15',
      specs: [
        { label: 'Primary camera', value: '4K · 1/2.3" CMOS' },
        { label: 'Thermal imaging', value: '640 × 512 radiometric' },
        { label: 'Low-light / IR', value: 'Integrated IR illuminators' },
        { label: 'Two-way audio', value: 'Speaker + cardioid mic' },
        { label: 'Mesh networking', value: 'Multi-node relay' },
        { label: 'Glass breaker', value: '30,000 RPM tungsten tip' },
      ],
    },
  ] satisfies SpecGroup[],
}
