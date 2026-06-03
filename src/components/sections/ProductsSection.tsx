import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Battery, Camera, Radio, Wind, Shield, Wifi, Thermometer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TextReveal } from '../ui/TextReveal'
import { cn } from '../../lib/utils'

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
  link?: string
}

const cards: Card[] = [
  {
    id: 'guardian',
    size: 'hero',
    tag: 'Outdoor Operations · New',
    title: 'Guardian — Long-Range First Responder',
    desc: 'Autonomous deployment, thermal imaging, 2-way communication, and emergency lighting — on scene in under 70 seconds.',
    accent: 'gold',
    link: '/guardian'
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
    link: '/lemur'
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
    id: 'catalog',
    size: 'wide',
    tag: 'Full aircraft catalog',
    title: 'Explore Every Platform in Interactive 3D',
    desc: 'Orbit Guardian and Lemur 2, inspect hotspots, and compare specifications side by side.',
    accent: 'indigo',
    link: '/drones'
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

function BentoCard({ card, index }: { card: Card; index: number }) {
  const a = accentStyles[card.accent]
  const Icon = card.icon

  const innerContent = (
    <>
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${a.topLine} opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />

      {card.tag && <div className={`${a.chip} mb-4`}>{card.tag}</div>}

      {Icon && card.metric && (
        <div className="mb-3 group-hover:-translate-y-1 transition-transform duration-300">
          <Icon className={`w-4 h-4 mb-3 ${a.iconColor} group-hover:scale-110 transition-transform`} />
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

      {card.link && (
        <div className="mt-5 flex items-center gap-1.5 text-xs text-tertiary group-hover:text-primary transition-colors duration-200">
          <span>Explore Product</span>
          <ArrowRight className={`w-3 h-3 group-hover:translate-x-0.5 transition-transform ${a.metricColor}`} />
        </div>
      )}

      <div className={cn(
        'absolute top-4 right-4 w-1.5 h-1.5 rounded-full animate-pulse-soft',
        card.accent === 'gold' ? 'bg-gold' : card.accent === 'rose' ? 'bg-rose' : 'bg-indigo'
      )} />
    </>
  )

  const cardClasses = cn(
    'block shimmer-card glass border border-border/50 rounded-2xl p-5 lg:p-6 relative overflow-hidden group cursor-interactive transition-all duration-300 h-full',
    a.borderHover,
    a.bgHover
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.015, y: -2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: (index % 6) * 0.06 }}
      className={cn(colSpan[card.size], 'h-full')}
    >
      {card.link ? (
        <Link to={card.link} className={cardClasses} data-cursor="View">
          {innerContent}
        </Link>
      ) : (
        <div className={cardClasses}>
          {innerContent}
        </div>
      )}
    </motion.div>
  )
}

export function ProductsSection() {
  return (
    <section id="products" className="py-16 lg:py-24 relative overflow-hidden">
      <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16 ">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10 lg:mb-12">
          <div className="space-y-5">
            <span className="chip chip-gold opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>Our Fleet</span>
            <h2 className="text-4xl lg:text-[3.25rem] font-black tracking-tight leading-[1.08] text-primary">
              <TextReveal text="End-to-End Programs" type="words" delay={0.1} />
              <br />
              <span className="grad-gold">
                <TextReveal text="Built for Public Safety" type="words" delay={0.4} />
              </span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-secondary leading-relaxed lg:text-right opacity-0 animate-fade-up" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
            Hardware, software, and services — fully supported by one partner, manufactured right here in the USA.
          </p>
        </div>

        {/* Bento */}
        <div className="bento grid grid-cols-12 gap-4 lg:gap-6 auto-rows-fr">
          {cards.map((c, i) => (
            <div key={c.id} className={cn(colSpan[c.size])}>
              <BentoCard card={c} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
