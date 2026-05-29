import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, MeshDistortMaterial } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ArrowRight, Shield, Zap, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TextReveal } from '../ui/TextReveal'
import { stats } from '../../lib/site'
import * as THREE from 'three'

/* ── 3D Drone Body ── */
function DroneGeometry() {
  const group = useRef<THREE.Group>(null)
  useFrame((s) => {
    if (!group.current) return
    group.current.rotation.y = s.clock.getElapsedTime() * 0.18
    group.current.position.y = Math.sin(s.clock.getElapsedTime() * 0.7) * 0.08
  })
  return (
    <group ref={group}>
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.12, 0.7]} />
        <meshStandardMaterial color="#1a2332" metalness={0.92} roughness={0.08} envMapIntensity={2.5} />
      </mesh>
      {[45, 135, 225, 315].map((deg, i) => {
        const r = (deg * Math.PI) / 180
        const px = Math.cos(r) * 0.65
        const pz = Math.sin(r) * 0.65
        return (
          <group key={i} position={[px, 0, pz]}>
            <mesh rotation={[0, -r + Math.PI / 4, 0]}>
              <boxGeometry args={[0.55, 0.035, 0.05]} />
              <meshStandardMaterial color="#111827" metalness={0.95} roughness={0.05} />
            </mesh>
            <mesh position={[0, 0.035, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.07, 16]} />
              <meshStandardMaterial color="#1e2d3d" metalness={0.85} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0.09, 0]}>
              <boxGeometry args={[0.65, 0.008, 0.05]} />
              <MeshDistortMaterial
                color={i % 2 === 0 ? '#f59e0b' : '#fb7185'}
                metalness={0.3} roughness={0.3}
                distort={0.08} speed={6}
                transparent opacity={0.75}
              />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, -0.1, 0.22]}>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
      </mesh>
      {[[-0.3, 0, -0.3], [0.3, 0, -0.3]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial
            color={i === 0 ? '#fb7185' : '#34d399'}
            emissive={i === 0 ? '#fb7185' : '#34d399'}
            emissiveIntensity={3}
          />
        </mesh>
      ))}
    </group>
  )
}

function AmbientRings() {
  const r1 = useRef<THREE.Mesh>(null)
  const r2 = useRef<THREE.Mesh>(null)
  useFrame((s) => {
    const t = s.clock.getElapsedTime()
    if (r1.current) r1.current.rotation.z = t * 0.25
    if (r2.current) r2.current.rotation.z = -t * 0.15
  })
  return (
    <>
      <mesh ref={r1} position={[0, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.005, 12, 160]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={4} transparent opacity={0.5} />
      </mesh>
      <mesh ref={r2} position={[0, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.45, 0.003, 8, 128]} />
        <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={3} transparent opacity={0.35} />
      </mesh>
    </>
  )
}

const WORDS = ['Autonomous.', 'Lifesaving.', 'Responsive.', 'Intelligent.']

function RotatingWord() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI(n => (n + 1) % WORDS.length), 2600)
    return () => clearInterval(t)
  }, [])
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)', rotateX: -30 }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', rotateX: 0 }}
        exit={{ opacity: 0, y: -20, filter: 'blur(8px)', rotateX: 30 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-gold inline-block origin-bottom"
      >
        {WORDS[i]}
      </motion.span>
    </AnimatePresence>
  )
}

const heroMetrics = [
  { value: stats.arrivalTime, label: 'Avg. scene arrival', icon: Zap, color: 'text-gold' },
  { value: stats.callsCleared, label: 'Calls cleared solo', icon: Shield, color: 'text-rose-grad' },
  { value: stats.fasterResponse, label: 'Faster response', icon: Users, color: 'text-indigo-grad' },
]

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.from('.h-chip',  { opacity: 0, y: 20, duration: 0.6, delay: 0.1 })
      gsap.from('.h-ctas',  { opacity: 0, y: 20, duration: 0.6, delay: 0.9 })
      gsap.from('.h-stat',  { opacity: 0, y: 20, stagger: 0.1, duration: 0.6, delay: 1.1 })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col pt-32 pb-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
      
      <div className="section-container relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 flex-1 py-6 lg:py-8">
        <div className="flex-1 flex flex-col gap-6 max-w-xl relative z-20">
          <div className="h-chip w-fit">
            <span className="chip chip-sage">
              <span className="live-dot" />
              Live Deployments — Guardian Fleet
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-black tracking-tight leading-[1.02] text-primary" style={{ perspective: '1000px' }}>
            <TextReveal text="Drones That Are" type="words" delay={0.2} />
            <RotatingWord />
          </h1>

          <TextReveal 
            text="AeroHorse delivers a connected ecosystem of autonomous drones, AI software, and intelligent docking stations — built exclusively for public safety in the USA."
            type="words"
            delay={0.6}
            className="text-base lg:text-lg text-secondary leading-relaxed"
          />

          <div className="h-ctas flex flex-wrap gap-4">
            <Link to="/contact" className="btn-primary group cursor-interactive" data-cursor="Book">
              Request a Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/guardian" className="btn-outline cursor-interactive" data-cursor="Guardian">
              Explore Fleet
            </Link>
          </div>

          <div className="h-stat grid grid-cols-3 gap-4 pt-6 border-t border-border/40">
            {heroMetrics.map(({ value, label, icon: Icon, color }) => (
              <div key={label} className="flex flex-col gap-1.5 group">
                <Icon className={`w-4 h-4 ${color === 'text-gold' ? 'text-gold' : color === 'text-rose-grad' ? 'text-rose' : 'text-indigo'} opacity-70 group-hover:scale-110 transition-transform`} />
                <span className={`metric font-black text-2xl text-primary`}>{value}</span>
                <p className="text-xs text-tertiary leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 h-[380px] lg:h-[500px] w-full relative group">
          {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'].map((cls, i) => (
            <div key={i} className={`absolute w-6 h-6 ${cls} border-gold/30 z-10 opacity-50 group-hover:opacity-100 transition-opacity`} />
          ))}

          <div className="absolute top-4 right-5 z-10 font-mono text-xs text-secondary/60 text-right space-y-0.5 pointer-events-none">
            <div>UNIT · GRD-007</div>
            <div>ALT · 120m AGL</div>
            <div>BATT · 94%</div>
            <div className="text-sage animate-pulse">ONLINE</div>
          </div>
          <div className="absolute bottom-4 left-5 z-10 font-mono text-xs text-secondary/60 pointer-events-none">
            <span className="text-gold">LIVE</span> · 4K / 60fps · ENC
          </div>

          <Canvas
            camera={{ position: [0, 0.6, 3.8], fov: 42 }}
            dpr={[1, 1.35]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            style={{ background: 'transparent' }}
            className="pointer-events-none"
          >
            <ambientLight intensity={0.4} />
            <pointLight position={[3, 3, 3]} color="#f59e0b" intensity={2.5} />
            <pointLight position={[-3, -1, -2]} color="#fb7185" intensity={1.5} />
            <spotLight position={[0, 5, 0]} angle={0.35} penumbra={1} intensity={4} color="#fbbf24" />
            <Environment preset="sunset" />
            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
              <DroneGeometry />
            </Float>
            <AmbientRings />
          </Canvas>
        </div>
      </div>

      <div className="relative z-10 flex justify-center pb-6 mt-auto">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
          <span className="text-xs font-mono tracking-widest text-tertiary uppercase">scroll</span>
        </motion.div>
      </div>
    </section>
  )
}
