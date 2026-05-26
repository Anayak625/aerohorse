import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Battery, Camera, Radio, Wind, Shield, Wifi, Thermometer } from 'lucide-react'
import { cn } from '../../lib/utils'

gsap.registerPlugin(ScrollTrigger)

type Accent = 'gold' | 'rose' | 'indigo'
type Size = 'hero' | 'wide' | 'tall' | 'small'

interface Card {
  id: string
  size: Size
  tag?: string
  title: string
  desc?: string
  metric?: { value: string; unit: string }
  icon?: React.FC<{ className?: string }>
  accent: Accent
}

const cards: Card[] = [
  {
    id: 'guardian',
    size: 'hero',
    tag: 'Outdoor Operations · New',
    title: 'Guardian — Long-Range First Responder',
    desc: 'Autonomous deployment, thermal imaging, 2-way communication, and emergency lighting — on scene in under 70 seconds.',
    accent: 'gold',
  },
  {
    id: 'battery',
    size: 'small',
    title: 'Flight Time',
    metric: { value: '45', unit: 'min' },
    icon: Battery,
    accent: 'gold',
  },
  {
    id: 'camera',
    size: 'small',
    title: 'Resolution',
    metric: { value: '4K', unit: '60fps' },
    icon: Camera,
    accent: 'rose',
  },
  {
    id: 'lemur',
    size: 'tall',
    tag: 'Indoor Tactical',
    title: 'Lemur 2',
    desc: 'Navigate doors, hallways, and confined spaces. Deliver audio communication without officer exposure.',
    accent: 'rose',
  },
  {
    id: 'comms',
    size: 'small',
    title: 'Live Comms',
    metric: { value: '2-Way', unit: 'Audio' },
    icon: Radio,
    accent: 'indigo',
  },
  {
    id: 'dfr',
    size: 'wide',
    tag: 'Drone as First Responder',
    title: '1 in 3 Calls Cleared Without Dispatching a Unit',
    desc: 'AeroHorse DFR programs reduce officer exposure and free up resources for priority incidents.',
    accent: 'indigo',
  },
  {
    id: 'wind',
    size: 'small',
    title: 'Wind Rating',
    metric: { value: '35', unit: 'mph' },
    icon: Wind,
    accent: 'gold',
  },
  {
    id: 'thermal',
    size: 'small',
    title: 'Thermal IR',
    metric: { value: '640', unit: 'p IR' },
    icon: Thermometer,
    accent: 'rose',
  },
  {
    id: 'security',
    size: 'small',
    title: 'Data Sec.',
    metric: { value: 'AES', unit: '256' },
    icon: Shield,
    accent: 'indigo',
  },
  {
    id: 'connect',
    size: 'small',
    title: 'Network',
    metric: { value: 'LTE', unit: '+ 5G' },
    icon: Wifi,
    accent: 'gold',
  },
]

const colSpan: Record<Size, string> = {
  hero:  'col-span-12 md:col-span-8',
  wide:  'col-span-12 md:col-span-8',
  tall:  'col-span-12 md:col-span-4',
  small: 'col-span-6 md:col-span-2',
}

const accentStyles: Record<Accent, {
  chip: string; metricColor: string; iconColor: string;
  borderHover: string; bgHover: string; topLine: string;
}> = {
  gold: {
    chip: 'chip chip-gold',
    metricColor: 'text-gold',
    iconColor: 'text-gold opacity-60',
    borderHover: 'hover:border-gold/25',
    bgHover: 'hover:bg-gold/[0.03]',
    topLine: 'from-transparent via-gold/40 to-transparent',
  },
  rose: {
    chip: 'chip chip-rose',
    metricColor: 'text-rose',
    iconColor: 'text-rose opacity-60',
    borderHover: 'hover:border-rose/25',
    bgHover: 'hover:bg-rose/[0.03]',
    topLine: 'from-transparent via-rose/40 to-transparent',
  },
  indigo: {
    chip: 'chip chip-indigo',
    metricColor: 'text-indigo',
    iconColor: 'text-indigo opacity-60',
    borderHover: 'hover:border-indigo/25',
    bgHover: 'hover:bg-indigo/[0.03]',
    topLine: 'from-transparent via-indigo/40 to-transparent',
  },
}

function BentoCard({ card }: { card: Card }) {
  const a = accentStyles[card.accent]
  const Icon = card.icon

  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -2 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={cn(
        colSpan[card.size],
        'shimmer-card glass border border-border/50 rounded-2xl p-5 lg:p-6 relative overflow-hidden group cursor-pointer',
        'transition-all duration-300',
        a.borderHover,
        a.bgHover,
      )}
    >
      {/* Accent top line */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${a.topLine} opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />

      {card.tag && <div className={`${a.chip} mb-4`}>{card.tag}</div>}

      {Icon && card.metric && (
        <div className="mb-3">
          <Icon className={`w-4 h-4 mb-3 ${a.iconColor}`} />
          <div className="flex items-end gap-1.5">
            <span className={`metric text-[2.6rem] font-black leading-none ${a.metricColor}`}>
              {card.metric.value}
            </span>
            <span className="text-xs text-tertiary font-mono mb-1.5 pb-0.5">{card.metric.unit}</span>
          </div>
        </div>
      )}

      <h3 className={cn(
        'font-bold text-primary leading-snug',
        card.size === 'hero' || card.size === 'wide' ? 'text-xl lg:text-2xl' :
        card.size === 'tall' ? 'text-lg' : 'text-sm'
      )}>
        {card.title}
      </h3>

      {card.desc && (
        <p className="mt-2 text-sm text-secondary leading-relaxed">{card.desc}</p>
      )}

      {card.desc && (
        <div className="mt-5 flex items-center gap-1.5 text-xs text-tertiary group-hover:text-gold transition-colors duration-200">
          <span>Learn more</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}

      {/* Accent dot top-right */}
      <div className={cn(
        'absolute top-4 right-4 w-1.5 h-1.5 rounded-full animate-pulse-soft',
        card.accent === 'gold' ? 'bg-gold' : card.accent === 'rose' ? 'bg-rose' : 'bg-indigo'
      )} />
    </motion.div>
  )
}

export function ProductsSection() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.from('.prod-header', {
        opacity: 0, y: 50, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.prod-header', start: 'top 85%', once: true },
      })
      gsap.from('.bcard', {
        opacity: 0, y: 36, scale: 0.96, stagger: 0.07, duration: 0.65, ease: 'power2.out',
        scrollTrigger: { trigger: '.bento', start: 'top 78%', once: true },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="products" className="py-24 lg:py-36 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-gold/3 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-rose/3 blur-[100px] rounded-full pointer-events-none" />

      <div className="section-container">
        {/* Header */}
        <div className="prod-header flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div className="space-y-5">
            <span className="chip chip-gold">Our Fleet</span>
            <h2 className="text-4xl lg:text-[3.25rem] font-black tracking-tight leading-tight text-primary">
              End-to-End Programs
              <br />
              <span className="text-gold">Built for Public Safety</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-secondary leading-relaxed lg:text-right">
            Hardware, software, and services — fully supported by one partner, manufactured right here in the USA.
          </p>
        </div>

        {/* Bento */}
        <div className="bento">
          {cards.map(c => (
            <div key={c.id} className={cn('bcard', colSpan[c.size])}>
              <BentoCard card={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
