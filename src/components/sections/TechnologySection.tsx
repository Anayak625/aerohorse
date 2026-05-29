import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { TextReveal } from '../ui/TextReveal'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    num: '01',
    title: '911 Call Received',
    body: 'The moment a call is logged in your CAD system, the DFR trigger activates automatically — zero manual steps.',
    badge: 'T + 0s',
    color: 'border-gold/30 text-gold',
    hover: 'group-hover:border-gold/50 group-hover:shadow-gold/20',
    number: 'group-hover:text-gold',
  },
  {
    num: '02',
    title: 'Autonomous Launch',
    body: 'The nearest Guardian drone lifts off from its dock and navigates to the scene via pre-approved flight corridors.',
    badge: 'T + 5s',
    color: 'border-rose/30 text-rose',
    hover: 'group-hover:border-rose/50 group-hover:shadow-rose/20',
    number: 'group-hover:text-rose',
  },
  {
    num: '03',
    title: 'Live Intelligence',
    body: '4K thermal video, GPS location, and 2-way audio stream directly to dispatch and responding units in real time.',
    badge: 'T + 70s',
    color: 'border-indigo/30 text-indigo',
    hover: 'group-hover:border-indigo/50 group-hover:shadow-indigo/20',
    number: 'group-hover:text-indigo',
  },
  {
    num: '04',
    title: 'Officers Arrive Informed',
    body: '1 in 3 calls cleared by drone alone. For the rest, officers arrive with full situational awareness.',
    badge: 'T + 5min',
    color: 'border-sage/30 text-sage',
    hover: 'group-hover:border-sage/50 group-hover:shadow-sage/20',
    number: 'group-hover:text-sage',
  },
]

/* ── 3D Orb ── */
function OrbScene() {
  const ico = useRef<THREE.Mesh>(null)
  const wire = useRef<THREE.Mesh>(null)
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)

  useFrame((s) => {
    const t = s.clock.getElapsedTime()
    if (ico.current)  { ico.current.rotation.y = t * 0.12; ico.current.rotation.x = t * 0.04 }
    if (wire.current) { wire.current.rotation.y = -t * 0.08 }
    if (ring1.current) ring1.current.rotation.z = t * 0.35
    if (ring2.current) ring2.current.rotation.z = -t * 0.22
  })

  return (
    <group>
      <mesh ref={ico}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial color="#111827" metalness={0.97} roughness={0.03} envMapIntensity={3} />
      </mesh>
      <mesh ref={wire}>
        <icosahedronGeometry args={[1.01, 4]} />
        <meshStandardMaterial color="#f59e0b" wireframe transparent opacity={0.06} />
      </mesh>
      <mesh ref={ring1} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.6, 0.007, 8, 160]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={5} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 5, Math.PI / 3, 0]}>
        <torusGeometry args={[1.35, 0.005, 8, 128]} />
        <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={4} transparent opacity={0.75} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 1.6, Math.sin(a * 0.4) * 0.3, Math.sin(a) * 1.6]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#f59e0b' : '#fb7185'}
              emissive={i % 2 === 0 ? '#f59e0b' : '#fb7185'}
              emissiveIntensity={6}
            />
          </mesh>
        )
      })}
      <pointLight position={[3, 2, 3]} color="#f59e0b" intensity={2} />
      <pointLight position={[-3, -2, -2]} color="#fb7185" intensity={1.5} />
    </group>
  )
}

export function TechnologySection() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.from('.step', {
        opacity: 0, x: -36, stagger: 0.14, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: '.steps', start: 'top 85%', once: true },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="technology" className="py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(30,45,61,0.4),transparent_60%)] pointer-events-none" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[350px] h-[600px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="flex flex-col gap-4 mb-10 lg:mb-12 max-w-xl">
          <span className="chip chip-gold w-fit opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>How It Works</span>
          <h2 className="text-4xl lg:text-[3.25rem] font-black tracking-tight leading-tight">
            <TextReveal text="From 911 Call to" type="words" delay={0.2} />
            <br />
            <span className="text-gold">
              <TextReveal text="Scene in 70 Seconds" type="words" delay={0.5} />
            </span>
          </h2>
          <div className="mt-2 opacity-0 animate-fade-up" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
            <p className="text-secondary text-base leading-relaxed">
              A fully automated pipeline — from dispatch trigger to live video stream — with no pilot required.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="steps flex flex-col gap-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                whileHover={{ x: 12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="step flex gap-6 relative group cursor-interactive" data-cursor="View"
              >
                {i < steps.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-px bg-border/50 group-hover:bg-gold/20 transition-colors duration-400" />
                )}

                <div className={cn_simple(
                  'flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center z-10 transition-all duration-300',
                  'bg-deep group-hover:bg-panel shadow-sm',
                  step.hover,
                  'border-border/60'
                )}>
                  <span className={`font-mono text-sm font-bold transition-colors duration-300 text-tertiary ${step.number}`}>
                    {step.num}
                  </span>
                </div>

                <div className="flex flex-col gap-2 pb-10 pt-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-bold text-primary group-hover:text-gold transition-colors duration-200">
                      {step.title}
                    </h3>
                    <span className={`chip text-[10px] ${step.color} bg-deep border-current/30`}>
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed max-w-sm">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="h-[400px] lg:h-[500px] relative group cursor-interactive" data-cursor="View">
            {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'].map((cls, i) => (
              <div key={i} className={`absolute w-6 h-6 ${cls} border-gold/30 z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
            ))}
            <div className="absolute top-4 left-5 z-10 font-mono text-xs text-secondary/50 pointer-events-none">AI CORE · v3.2</div>
            <div className="absolute bottom-4 right-5 z-10 font-mono text-xs text-secondary/50 pointer-events-none">ENCRYPTED</div>

            <Canvas
              camera={{ position: [0, 0, 5], fov: 42 }}
              dpr={[1, 1.35]}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              className="pointer-events-none group-hover:scale-[1.02] transition-transform duration-700"
            >
              <Environment preset="sunset" />
              <OrbScene />
            </Canvas>
          </div>
        </div>
      </div>
    </section>
  )
}

function cn_simple(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
