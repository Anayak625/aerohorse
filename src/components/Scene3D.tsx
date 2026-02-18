/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useRef, useMemo, useState, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles, useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const GRID_SIZE = 25

export type HoverTarget = 'drone' | 'pod' | null

interface SceneProps {
  mouse?: { normalizedX: number; normalizedY: number }
  scrollProgress?: number
  onHoverChange?: (target: HoverTarget) => void
  onDroneClick?: (clockSeconds: number) => void
  focusDroneUntil?: number
}

export default function Scene3D({
  mouse = { normalizedX: 0, normalizedY: 0 },
  scrollProgress = 0,
  onHoverChange,
  onDroneClick,
  focusDroneUntil = 0,
}: SceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const targetCamPos = useRef(new THREE.Vector3(0, 5, 12))
  const focusTarget = useRef(new THREE.Vector3(0, 4.8, 1))

  useFrame((state) => {
    const cam = state.camera
    const t = state.clock.elapsedTime
    const focusActive = t < focusDroneUntil
    const mouseStrength = focusActive ? 0.08 : 0.4 * (1 - scrollProgress * 0.7)

    // Smooth camera pull-back as user scrolls - creates zoom out effect
    const baseZ = 12 + scrollProgress * 8
    const baseY = 5 + scrollProgress * 4

    if (focusActive) {
      // Camera follows drone from a fixed offset (behind and above)
      const followOffset = new THREE.Vector3(0, 3, 6)
      const desiredCamPos = focusTarget.current.clone().add(followOffset)
      targetCamPos.current.lerp(desiredCamPos, 0.05)
      cam.position.lerp(targetCamPos.current, 0.08)
      cam.lookAt(focusTarget.current.x, focusTarget.current.y - 0.3, focusTarget.current.z)
    } else {
      targetCamPos.current.set(
        mouse.normalizedX * 3.5 * mouseStrength,
        baseY + mouse.normalizedY * 2 * mouseStrength,
        baseZ + mouse.normalizedX * 0.5 * mouseStrength
      )
      cam.position.lerp(targetCamPos.current, 0.08)
      const lookY = 2 - scrollProgress * 2
      const lookZ = scrollProgress * 5
      cam.lookAt(mouse.normalizedX * 0.8, lookY, lookZ)
    }

    if (groupRef.current) {
      const scale = 1 - scrollProgress * 0.15
      groupRef.current.scale.setScalar(scale)
    }
  })

  return (
    <>
      <color attach="background" args={['#fafaf9']} />
      <fog attach="fog" args={['#fafaf9', 15, 50]} />

      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 15, 8]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 8, 4]} color="#0d9488" intensity={2} distance={25} />
      <pointLight position={[-8, 5, -4]} color="#64748b" intensity={1} distance={20} />
      <pointLight position={[8, 4, 2]} color="#78716c" intensity={0.8} distance={18} />

      <group ref={groupRef}>
        <Sparkles count={100} scale={35} size={2} speed={0.3} opacity={0.3} color="#0d9488" />
        <Sparkles count={50} scale={30} size={2.5} speed={0.2} opacity={0.2} color="#a8a29e" />

        <GroundPlane />
        <CityGrid />
        <CityBlocks />
        <DroneAnimated
          scrollProgress={scrollProgress}
          onHoverChange={onHoverChange}
          onDroneClick={onDroneClick}
          focusTargetRef={focusTarget}
        />
        <Pods onHoverChange={onHoverChange} />
        <Suspense fallback={<TruckPlaceholder />}>
          <DeliveryCar />
        </Suspense>
        <DroppingParcel scrollProgress={scrollProgress} />
      </group>

      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={0.6} />
      </EffectComposer>
    </>
  )
}

// Motor physics configuration
interface MotorState {
  currentRPM: number
  targetRPM: number
  rotation: number
  thrust: number
  temperature: number
}

// Realistic motor physics constants
const MOTOR_CONFIG = {
  maxRPM: 12000,
  idleRPM: 1200,
  hoverRPM: 6500,
  accelerationRate: 8000, // RPM per second
  decelerationRate: 4000, // RPM per second (slower due to inertia)
  thrustCoefficient: 0.00001, // Thrust = coefficient * RPM^2
  torqueCoefficient: 0.000001,
  momentOfInertia: 0.00005, // kg*m^2
  thermalCoefficient: 0.0001,
  coolingRate: 0.05,
}

function DroneAnimated({
  scrollProgress = 0,
  onHoverChange,
  onDroneClick,
  focusTargetRef,
}: {
  scrollProgress?: number
  onHoverChange?: (t: HoverTarget) => void
  onDroneClick?: (clockSeconds: number) => void
  focusTargetRef?: React.MutableRefObject<THREE.Vector3>
}) {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const { clock } = useThree()
  const trailRef = useRef<THREE.Points>(null)
  const rotorRefs = useRef<THREE.Mesh[]>([])
  const blurRefs = useRef<THREE.Mesh[]>([])
  const motorHeatRefs = useRef<THREE.Mesh[]>([])
  const downwashRefs = useRef<THREE.Points[]>([])

  // Motor state for each of the 4 motors
  // Motor layout: 0=Front-Left (CCW), 1=Front-Right (CW), 2=Back-Left (CW), 3=Back-Right (CCW)
  const motorStates = useRef<MotorState[]>([
    { currentRPM: 0, targetRPM: 0, rotation: 0, thrust: 0, temperature: 20 },
    { currentRPM: 0, targetRPM: 0, rotation: 0, thrust: 0, temperature: 20 },
    { currentRPM: 0, targetRPM: 0, rotation: 0, thrust: 0, temperature: 20 },
    { currentRPM: 0, targetRPM: 0, rotation: 0, thrust: 0, temperature: 20 },
  ])
  
  // Gyroscopic precession accumulator
  const gyroEffect = useRef({ pitch: 0, roll: 0, yaw: 0 })
  
  // Previous frame time for delta calculation
  const lastTime = useRef(0)
  const isStarted = useRef(false)
  const startupProgress = useRef(0)

  const trailGeom = useMemo(() => {
    const positions = new Float32Array(50 * 3)
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geom
  }, [])

  // Downwash particle geometry for each motor
  const downwashGeoms = useMemo(() => {
    return [0, 1, 2, 3].map(() => {
      const count = 20
      const positions = new Float32Array(count * 3)
      const geom = new THREE.BufferGeometry()
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      return geom
    })
  }, [])

  const trailPositions = useRef<THREE.Vector3[]>([])
  
  // Downwash particle positions
  const downwashParticles = useRef<{ pos: THREE.Vector3; vel: THREE.Vector3; life: number }[][]>([
    [], [], [], []
  ])

  // Detailed propeller blade geometry with realistic airfoil profile
  const bladeGeom = useMemo(() => {
    const shape = new THREE.Shape()

    // More realistic airfoil-shaped blades
    const hubRadius = 0.018

    shape.moveTo(hubRadius, 0.008)

    // Blade 1 - with twist and taper like real props
    shape.bezierCurveTo(0.06, 0.025, 0.15, 0.022, 0.24, 0.006)
    shape.bezierCurveTo(0.25, 0.003, 0.252, -0.003, 0.24, -0.006)
    shape.bezierCurveTo(0.15, -0.015, 0.06, -0.018, hubRadius, -0.008)

    shape.lineTo(-hubRadius, -0.008)

    // Blade 2 - mirrored
    shape.bezierCurveTo(-0.06, -0.018, -0.15, -0.015, -0.24, -0.006)
    shape.bezierCurveTo(-0.252, -0.003, -0.25, 0.003, -0.24, 0.006)
    shape.bezierCurveTo(-0.15, 0.022, -0.06, 0.025, -hubRadius, 0.008)

    shape.lineTo(hubRadius, 0.008)

    const extrudeSettings = { 
      depth: 0.004, 
      bevelEnabled: true, 
      bevelThickness: 0.0015, 
      bevelSize: 0.0015, 
      bevelSegments: 3 
    }
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [])

  // Calculate motor RPM based on flight state (pitch, roll, yaw demands)
  const calculateMotorRPMs = (
    baseThrottle: number,
    pitchDemand: number,
    rollDemand: number,
    yawDemand: number
  ): number[] => {
    const base = MOTOR_CONFIG.idleRPM + baseThrottle * (MOTOR_CONFIG.hoverRPM - MOTOR_CONFIG.idleRPM)
    
    // Motor mixing for quadcopter X configuration
    // FL(0), FR(1), BL(2), BR(3)
    // Pitch: Front motors decrease, rear increase for forward pitch
    // Roll: Left motors decrease, right increase for right roll
    // Yaw: CW motors (1,2) increase, CCW motors (0,3) decrease for CW yaw
    
    const pitchMix = pitchDemand * 1500
    const rollMix = rollDemand * 1500
    const yawMix = yawDemand * 800
    
    return [
      Math.max(0, Math.min(MOTOR_CONFIG.maxRPM, base - pitchMix - rollMix + yawMix)), // FL CCW
      Math.max(0, Math.min(MOTOR_CONFIG.maxRPM, base - pitchMix + rollMix - yawMix)), // FR CW
      Math.max(0, Math.min(MOTOR_CONFIG.maxRPM, base + pitchMix - rollMix - yawMix)), // BL CW
      Math.max(0, Math.min(MOTOR_CONFIG.maxRPM, base + pitchMix + rollMix + yawMix)), // BR CCW
    ]
  }

  useFrame((state) => {
    if (!ref.current) return
    
    const currentTime = state.clock.elapsedTime
    const deltaTime = Math.min(currentTime - lastTime.current, 0.1) // Cap delta for stability
    lastTime.current = currentTime
    
    // Startup sequence - motors spool up gradually
    if (!isStarted.current && currentTime > 0.5) {
      isStarted.current = true
    }
    
    if (isStarted.current && startupProgress.current < 1) {
      startupProgress.current = Math.min(1, startupProgress.current + deltaTime * 0.3)
    }

    // Drone in front of camera so it's visible; Y just below camera (5) so it appears at top of view above "The future of delivery"
    const pos = new THREE.Vector3(0, 5.3, 1)
    const pitchDemand = 0.12
    const rollDemand = Math.sin(currentTime * 0.3) * 0.05
    const yawDemand = Math.sin(currentTime * 0.5) * 0.08
    
    // Calculate target RPMs for each motor
    const throttle = startupProgress.current * (0.7 + Math.sin(currentTime * 2) * 0.05)
    const targetRPMs = calculateMotorRPMs(throttle, pitchDemand, rollDemand, yawDemand)
    
    // Update motor physics
    let totalGyroTorque = 0
    motorStates.current.forEach((motor, i) => {
      motor.targetRPM = targetRPMs[i]
      
      // Motor acceleration/deceleration with realistic inertia
      const rpmDiff = motor.targetRPM - motor.currentRPM
      const accelRate = rpmDiff > 0 ? MOTOR_CONFIG.accelerationRate : MOTOR_CONFIG.decelerationRate
      const maxChange = accelRate * deltaTime
      
      if (Math.abs(rpmDiff) < maxChange) {
        motor.currentRPM = motor.targetRPM
      } else {
        motor.currentRPM += Math.sign(rpmDiff) * maxChange
      }
      
      // Calculate thrust (proportional to RPM squared)
      motor.thrust = MOTOR_CONFIG.thrustCoefficient * motor.currentRPM * motor.currentRPM
      
      // Motor temperature simulation
      const heatGeneration = MOTOR_CONFIG.thermalCoefficient * motor.currentRPM * deltaTime
      const cooling = MOTOR_CONFIG.coolingRate * (motor.temperature - 20) * deltaTime
      motor.temperature = Math.max(20, Math.min(120, motor.temperature + heatGeneration - cooling))
      
      // Update rotor rotation based on RPM
      // Convert RPM to radians per frame: RPM * 2π / 60 * deltaTime
      const angularVelocity = (motor.currentRPM * Math.PI * 2) / 60
      const direction = (i === 0 || i === 3) ? 1 : -1 // CCW for 0,3, CW for 1,2
      motor.rotation += direction * angularVelocity * deltaTime
      
      // Accumulate gyroscopic torque (counter-rotating pairs cancel, but imbalance creates precession)
      totalGyroTorque += direction * motor.currentRPM * MOTOR_CONFIG.torqueCoefficient
    })
    
    // Apply gyroscopic precession effect
    gyroEffect.current.yaw += totalGyroTorque * deltaTime * 0.1
    
    // Smooth movement with vibration from motor imbalance
    const vibrationAmplitude = 0.002 * (motorStates.current.reduce((sum, m) => sum + m.currentRPM, 0) / 4 / MOTOR_CONFIG.maxRPM)
    const vibration = new THREE.Vector3(
      Math.sin(currentTime * 120) * vibrationAmplitude,
      Math.sin(currentTime * 150 + 1) * vibrationAmplitude,
      Math.sin(currentTime * 130 + 2) * vibrationAmplitude
    )
    
    ref.current.position.copy(pos)
    ref.current.position.add(vibration)
    ref.current.position.y += Math.sin(currentTime * 3) * 0.03 // Subtle hover bob

    if (focusTargetRef) focusTargetRef.current.copy(ref.current.position)

    // Base scale to make drone bigger; hover adds a slight pop
    const baseScale = 3
    const targetScale = baseScale * (hovered ? 1.12 : 1)
    const s = ref.current.scale.x + (targetScale - ref.current.scale.x) * 0.12
    ref.current.scale.setScalar(s)

    // Orientation: face forward (toward +Z) with gentle tilt
    ref.current.lookAt(0, 4, 5)
    ref.current.rotation.z = rollDemand * 0.8 + gyroEffect.current.yaw * 0.01
    ref.current.rotation.x = pitchDemand * 0.5

    // Update rotor visuals
    rotorRefs.current.forEach((rotor, i) => {
      if (rotor) {
        const motor = motorStates.current[i]
        rotor.rotation.y = motor.rotation
        
        // Blade pitch variation based on thrust (collective pitch simulation)
        const bladePitch = 0.1 + (motor.currentRPM / MOTOR_CONFIG.maxRPM) * 0.15
        rotor.rotation.x = bladePitch
      }
    })

    // Update blur discs based on RPM
    blurRefs.current.forEach((blur, i) => {
      if (blur) {
        const motor = motorStates.current[i]
        const rpmRatio = motor.currentRPM / MOTOR_CONFIG.maxRPM
        
        // Blur opacity increases with RPM
        blur.material.opacity = 0.02 + rpmRatio * 0.12
        
        // Scale blur disc slightly based on RPM (tip flex simulation)
        const flexScale = 1 + rpmRatio * 0.02
        blur.scale.set(flexScale, flexScale, 1)
        
        // Subtle color shift based on motor temperature
        const tempRatio = (motor.temperature - 20) / 100
        blur.material.color.setRGB(1, 1 - tempRatio * 0.3, 1 - tempRatio * 0.5)
      }
    })
    
    // Update motor heat glow
    motorHeatRefs.current.forEach((heat, i) => {
      if (heat) {
        const motor = motorStates.current[i]
        const tempRatio = (motor.temperature - 20) / 100
        heat.material.opacity = tempRatio * 0.3
        heat.material.emissiveIntensity = tempRatio * 2
      }
    })
    
    // Update downwash particles
    motorStates.current.forEach((motor, i) => {
      const particles = downwashParticles.current[i]
      const rpmRatio = motor.currentRPM / MOTOR_CONFIG.maxRPM
      
      // Spawn new particles based on thrust
      if (rpmRatio > 0.1 && Math.random() < rpmRatio * 0.5) {
        const armConfig = [
          { x: 0.15, z: 0.2 },
          { x: -0.15, z: 0.2 },
          { x: 0.15, z: -0.2 },
          { x: -0.15, z: -0.2 },
        ][i]
        
        particles.push({
          pos: new THREE.Vector3(
            pos.x + armConfig.x + (Math.random() - 0.5) * 0.1,
            pos.y - 0.1,
            pos.z + armConfig.z + (Math.random() - 0.5) * 0.1
          ),
          vel: new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            -2 - rpmRatio * 3,
            (Math.random() - 0.5) * 0.5
          ),
          life: 1
        })
      }
      
      // Update existing particles
      for (let j = particles.length - 1; j >= 0; j--) {
        const p = particles[j]
        p.pos.add(p.vel.clone().multiplyScalar(deltaTime))
        p.vel.y += 2 * deltaTime // Air resistance
        p.vel.multiplyScalar(0.98) // Drag
        p.life -= deltaTime * 2
        
        if (p.life <= 0) {
          particles.splice(j, 1)
        }
      }
      
      // Update geometry
      if (downwashRefs.current[i] && downwashGeoms[i]) {
        const positions = downwashGeoms[i].attributes.position.array as Float32Array
        for (let j = 0; j < 20; j++) {
          const p = particles[j]
          if (p) {
            positions[j * 3] = p.pos.x
            positions[j * 3 + 1] = p.pos.y
            positions[j * 3 + 2] = p.pos.z
          } else {
            positions[j * 3] = 0
            positions[j * 3 + 1] = -1000
            positions[j * 3 + 2] = 0
          }
        }
        downwashGeoms[i].attributes.position.needsUpdate = true
      }
    })

    // Trail
    if (trailPositions.current) {
      trailPositions.current.unshift(ref.current.position.clone())
      if (trailPositions.current.length > 50) trailPositions.current.pop()

      if (trailRef.current && trailGeom) {
        const positions = trailGeom.attributes.position.array as Float32Array
        for (let i = 0; i < 50; i++) {
          const p = trailPositions.current[i] || ref.current.position
          positions[i * 3] = p.x
          positions[i * 3 + 1] = p.y
          positions[i * 3 + 2] = p.z
        }
        trailGeom.attributes.position.needsUpdate = true
      }
    }
  })

  // Foldable Drone Config (Mavic-like) - Sleeker Dimensions
  const bodyWidth = 0.12 // Slimmer body
  // Arm positions - FL(0), FR(1), BL(2), BR(3)
  const armConfigs = [
    { pos: [bodyWidth / 2 + 0.14, 0.01, 0.26], rot: -Math.PI / 6, isFront: true, isRight: false, motorDir: 1 }, // Front Left CCW
    { pos: [-(bodyWidth / 2 + 0.14), 0.01, 0.26], rot: Math.PI / 6, isFront: true, isRight: true, motorDir: -1 },  // Front Right CW
    { pos: [bodyWidth / 2 + 0.14, 0.02, -0.26], rot: Math.PI / 6, isFront: false, isRight: false, motorDir: -1 },  // Back Left CW
    { pos: [-(bodyWidth / 2 + 0.14), 0.02, -0.26], rot: -Math.PI / 6, isFront: false, isRight: true, motorDir: 1 }, // Back Right CCW
  ]

  // Drone Material
  const bodyMaterial = <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.2} />
  const darkMaterial = <meshStandardMaterial color="#1e293b" roughness={0.8} metalness={0.1} />

  return (
    <>
      <Float speed={2} rotationIntensity={0.15} floatIntensity={0.15}>
        <group
          ref={ref}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            onHoverChange?.('drone')
          }}
          onPointerOut={() => {
            setHovered(false)
            onHoverChange?.(null)
          }}
          onClick={(e) => {
            e.stopPropagation()
            onDroneClick?.(clock.getElapsedTime())
          }}
        >
          {/* Invisible hit area for raycasting (groups don't receive pointer in R3F) */}
          <mesh position={[0, 0, 0]} visible={false}>
            <boxGeometry args={[2.5, 1.5, 2.5]} />
          </mesh>

          {/* --- FUSELAGE --- */}
          <group scale={[1, 0.8, 1]} rotation={[0, Math.PI, 0]}>

            {/* Main Central Block */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.12, 0.06, 0.35]} />
              {bodyMaterial}
            </mesh>

            {/* Top Shell / Battery */}
            <mesh position={[0, 0.04, -0.04]} castShadow>
              <boxGeometry args={[0.10, 0.03, 0.25]} />
              <meshStandardMaterial color="#334155" roughness={0.6} />
            </mesh>
            
            {/* Battery indicator LEDs */}
            {[-0.03, -0.01, 0.01, 0.03].map((x, idx) => (
              <mesh key={idx} position={[x, 0.056, -0.04]}>
                <boxGeometry args={[0.012, 0.002, 0.008]} />
                <meshBasicMaterial color={idx < 3 ? "#22c55e" : "#78716c"} />
              </mesh>
            ))}

            {/* Tapered Nose (Front) */}
            <mesh position={[0, -0.01, 0.19]} rotation={[Math.PI / 6, 0, 0]}>
              <boxGeometry args={[0.10, 0.05, 0.08]} />
              {bodyMaterial}
            </mesh>

            {/* Rear Vent/Taper */}
            <mesh position={[0, 0.01, -0.19]} rotation={[-0.15, 0, 0]}>
              <boxGeometry args={[0.10, 0.05, 0.08]} />
              {bodyMaterial}
            </mesh>
            
            {/* ESC Vents - showing heat dissipation */}
            {[-0.04, 0.04].map((x, idx) => (
              <group key={idx} position={[x, 0.03, -0.15]}>
                {[0, 0.015, 0.03].map((z, i) => (
                  <mesh key={i} position={[0, 0, z]}>
                    <boxGeometry args={[0.02, 0.005, 0.008]} />
                    <meshStandardMaterial color="#0f172a" />
                  </mesh>
                ))}
              </group>
            ))}

            {/* Side intakes */}
            <mesh position={[0.065, 0, 0]}>
              <boxGeometry args={[0.015, 0.03, 0.15]} />
              {darkMaterial}
            </mesh>
            <mesh position={[-0.065, 0, 0]}>
              <boxGeometry args={[0.015, 0.03, 0.15]} />
              {darkMaterial}
            </mesh>
          </group>

          {/* --- ARMS & MOTORS --- */}
          {armConfigs.map((config, i) => (
            <group key={i} position={[config.pos[0] > 0 ? 0.06 : -0.06, 0, config.pos[2] > 0 ? 0.08 : -0.08]}>
              {/* Arm Bar with internal wiring detail */}
              <mesh
                position={[config.pos[0] * 0.45, config.isFront ? 0 : 0.01, config.pos[2] * 0.45]}
                rotation={[0, config.isFront ? (config.isRight ? -0.5 : 0.5) : (config.isRight ? 0.5 : -0.5), 0]}
              >
                <boxGeometry args={[0.22, 0.02, 0.03]} />
                {bodyMaterial}
              </mesh>
              
              {/* Wire routing on arm */}
              <mesh
                position={[config.pos[0] * 0.45, (config.isFront ? 0 : 0.01) + 0.012, config.pos[2] * 0.45]}
                rotation={[0, config.isFront ? (config.isRight ? -0.5 : 0.5) : (config.isRight ? 0.5 : -0.5), 0]}
              >
                <boxGeometry args={[0.18, 0.003, 0.008]} />
                <meshStandardMaterial color="#1a1a1a" />
              </mesh>

              {/* Motor Mount at end of arm */}
              <group position={[config.pos[0] * 0.9, config.isFront ? 0 : 0.01, config.pos[2] * 0.9]}>
                {/* Motor Bell Housing - Brushless motor detail */}
                <mesh position={[0, 0.015, 0]}>
                  <cylinderGeometry args={[0.028, 0.026, 0.035, 16]} />
                  <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
                </mesh>
                
                {/* Motor Stator (visible through gaps) */}
                <mesh position={[0, 0.015, 0]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.03, 12]} />
                  <meshStandardMaterial color="#c2410c" metalness={0.4} roughness={0.6} />
                </mesh>
                
                {/* Motor Shaft */}
                <mesh position={[0, 0.038, 0]}>
                  <cylinderGeometry args={[0.003, 0.003, 0.015, 8]} />
                  <meshStandardMaterial color="#a1a1aa" metalness={0.9} roughness={0.1} />
                </mesh>
                
                {/* Motor Heat Glow (temperature visualization) */}
                <mesh 
                  ref={el => { if (el) motorHeatRefs.current[i] = el }}
                  position={[0, 0.015, 0]}
                >
                  <cylinderGeometry args={[0.032, 0.032, 0.04, 16]} />
                  <meshBasicMaterial color="#f97316" transparent opacity={0} />
                </mesh>

                {/* Landing Gear Leg (Front Arms Only) */}
                {config.isFront && (
                  <group position={[0, -0.08, 0]}>
                    <mesh position={[0, 0, 0]}>
                      <cylinderGeometry args={[0.008, 0.006, 0.12, 8]} />
                      {bodyMaterial}
                    </mesh>
                    <mesh position={[0, -0.06, 0]}>
                      <sphereGeometry args={[0.01, 8, 8]} />
                      <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                    {/* Nav Light with proper aviation colors */}
                    <mesh position={[0, -0.02, 0.01]}>
                      <sphereGeometry args={[0.006, 8, 8]} />
                      <meshBasicMaterial color={config.isRight ? "#ef4444" : "#22c55e"} />
                      <pointLight color={config.isRight ? "#ef4444" : "#22c55e"} distance={0.4} intensity={0.5} />
                    </mesh>
                  </group>
                )}

                {/* Rear Anti-collision strobe */}
                {!config.isFront && (
                  <mesh position={[0, 0, 0.03]}>
                    <sphereGeometry args={[0.006, 8, 8]} />
                    <meshBasicMaterial color="white" />
                    <pointLight color="white" distance={0.25} intensity={0.5} />
                  </mesh>
                )}

                {/* Propeller Assembly */}
                <group position={[0, 0.045, 0]}>
                  {/* Propeller Blade with realistic spin */}
                  <mesh
                    ref={el => { if (el) rotorRefs.current[i] = el }}
                    geometry={bladeGeom}
                    castShadow
                  >
                    <meshStandardMaterial 
                      color={config.motorDir === 1 ? "#0f172a" : "#1e3a5f"} 
                      metalness={0.15} 
                      roughness={0.45} 
                    />
                  </mesh>
                  
                  {/* Prop Hub/Nut with direction indicator */}
                  <mesh position={[0, 0.006, 0]}>
                    <cylinderGeometry args={[0.008, 0.007, 0.01, 8]} />
                    <meshStandardMaterial 
                      color={config.motorDir === 1 ? "#dc2626" : "#1d4ed8"} 
                      metalness={0.8} 
                    />
                  </mesh>
                  
                  {/* Motion Blur Disc - opacity controlled by RPM */}
                  <mesh
                    ref={el => { if (el) blurRefs.current[i] = el }}
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 0.003, 0]}
                  >
                    <ringGeometry args={[0.02, 0.26, 48]} />
                    <meshBasicMaterial color="#ffffff" opacity={0.02} transparent side={THREE.DoubleSide} />
                  </mesh>
                  
                  {/* Secondary blur layer for more realistic effect */}
                  <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 0.004, 0]}
                  >
                    <ringGeometry args={[0.15, 0.25, 48]} />
                    <meshBasicMaterial color="#94a3b8" opacity={0.03} transparent side={THREE.DoubleSide} />
                  </mesh>
                </group>
              </group>
            </group>
          ))}

          {/* --- GIMBAL & CAMERA --- */}
          <group position={[0, -0.08, 0.24]}>
            {/* 3-Axis Gimbal */}
            <mesh position={[0, 0.03, 0]}>
              <boxGeometry args={[0.05, 0.008, 0.02]} />
              {darkMaterial}
            </mesh>
            <mesh position={[0.025, 0.015, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.03, 0.008, 0.02]} />
              {darkMaterial}
            </mesh>
            
            {/* Gimbal Motors (tiny servos) */}
            {[[-0.02, 0.025, 0], [0.02, 0.025, 0]].map((pos, idx) => (
              <mesh key={idx} position={pos as [number, number, number]}>
                <cylinderGeometry args={[0.004, 0.004, 0.008, 8]} />
                <meshStandardMaterial color="#374151" metalness={0.6} />
              </mesh>
            ))}

            {/* Camera Housing */}
            <group position={[0, 0, 0.01]}>
              <mesh>
                <boxGeometry args={[0.04, 0.035, 0.045]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Lens Assembly */}
              <mesh position={[0, 0, 0.024]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.016, 0.016, 0.006, 16]} />
                <meshStandardMaterial color="#000" metalness={0.9} roughness={0.1} />
              </mesh>
              <mesh position={[0, 0, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.013, 16]} />
                <meshBasicMaterial color="#1e40af" transparent opacity={0.4} />
              </mesh>
              {/* IR sensors */}
              {[[-0.015, 0.012, 0.023], [0.015, 0.012, 0.023]].map((pos, idx) => (
                <mesh key={idx} position={pos as [number, number, number]}>
                  <sphereGeometry args={[0.003, 8, 8]} />
                  <meshBasicMaterial color="#7c3aed" />
                </mesh>
              ))}
            </group>
          </group>

          {/* --- PAYLOAD --- */}
          <group position={[0, -0.12, -0.02]}>
            {/* Payload Release Mechanism */}
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[0.08, 0.015, 0.08]} />
              <meshStandardMaterial color="#333" metalness={0.5} />
            </mesh>
            {/* Servo for release */}
            <mesh position={[0.035, 0.04, 0]}>
              <boxGeometry args={[0.015, 0.012, 0.025]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            {/* Package — hidden once dropped (scroll >= 15%), same parcel animates in world space */}
            {scrollProgress < 0.15 && (
              <group position={[0, -0.05, 0]}>
                <mesh>
                  <boxGeometry args={[0.14, 0.1, 0.16]} />
                  <meshStandardMaterial color="#f97316" />
                </mesh>
                <mesh position={[0, 0, 0]} scale={[1.02, 1.02, 0.2]}>
                  <boxGeometry args={[0.08, 0.08, 0.08]} />
                  <meshBasicMaterial color="#d97706" />
                </mesh>
                {[[-0.03, 0], [0.03, 0], [0, -0.03], [0, 0.03]].map((offset, idx) => (
                  <mesh key={idx} position={[offset[0], 0.06, offset[1]]}>
                    <cylinderGeometry args={[0.001, 0.001, 0.06, 4]} />
                    <meshBasicMaterial color="#000" />
                  </mesh>
                ))}
              </group>
            )}
          </group>

          {/* --- GPS/Compass Module --- */}
          <mesh position={[0, 0.06, -0.12]}>
            <cylinderGeometry args={[0.025, 0.025, 0.008, 16]} />
            <meshStandardMaterial color="#1f2937" metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.065, -0.12]}>
            <cylinderGeometry args={[0.018, 0.018, 0.003, 16]} />
            <meshStandardMaterial color="#374151" metalness={0.5} />
          </mesh>

        </group>
      </Float>

      {/* Downwash Particles - visualize rotor wash */}
      {downwashGeoms.map((geom, i) => (
        <points key={i} ref={el => { if (el) downwashRefs.current[i] = el }} geometry={geom}>
          <pointsMaterial 
            color="#94a3b8" 
            size={0.015} 
            transparent 
            opacity={0.3} 
            sizeAttenuation 
          />
        </points>
      ))}

      {/* Trail */}
      <points ref={trailRef} geometry={trailGeom}>
        <pointsMaterial color="#0d9488" size={0.06} transparent opacity={0.5} sizeAttenuation />
      </points>
    </>
  )
}

// Same parcel as drone's payload: drops from drone position (20% scroll) to pod top (80% scroll)
const DRONE_SCALE = 3 // match DroneAnimated baseScale so parcel is same size
const DROP_START_SCROLL = 0.15
const DROP_END_SCROLL = 0.6
// Pod ring top y=0.18; parcel height 0.1*DRONE_SCALE → center at 0.18 + 0.1*DRONE_SCALE/2
const POD_TOP_Y = 0.18 + (0.1 * DRONE_SCALE) / 2
// Drone at (0, 5.3, 1), scale 3, package local (0, -0.17, -0.02) → world start
const DROP_START = { x: 0, y: 5.3 + DRONE_SCALE * (-0.17), z: 1 + DRONE_SCALE * (-0.02) }
const DROP_END = { x: 0, y: POD_TOP_Y, z: 0 }

function DroppingParcel({ scrollProgress }: { scrollProgress: number }) {
  const visible = scrollProgress >= DROP_START_SCROLL
  const t = visible
    ? Math.min(1, (scrollProgress - DROP_START_SCROLL) / (DROP_END_SCROLL - DROP_START_SCROLL))
    : 0
  const tEased = t * t
  const x = DROP_START.x + (DROP_END.x - DROP_START.x) * tEased
  const y = DROP_START.y + (DROP_END.y - DROP_START.y) * tEased
  const z = DROP_START.z + (DROP_END.z - DROP_START.z) * tEased

  if (!visible) return null
  return (
    <group position={[x, y, z]} scale={DRONE_SCALE}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.14, 0.1, 0.16]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      <mesh position={[0, 0, 0]} scale={[1.02, 1.02, 0.2]}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshBasicMaterial color="#d97706" />
      </mesh>
      {[[-0.03, 0], [0.03, 0], [0, -0.03], [0, 0.03]].map((offset, idx) => (
        <mesh key={idx} position={[offset[0], 0.06, offset[1]]}>
          <cylinderGeometry args={[0.001, 0.001, 0.06, 4]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      ))}
    </group>
  )
}

// Pod base radius ~0.8; truck to the left. Gap 0.25 world units.
const POD_LEFT_EDGE = -0.8
const TRUCK_GAP = 0.25
const TRUCK_TARGET_SIZE = 1.4 // max dimension in world units (match pod scale)
const TRUCK_POSITION_X = POD_LEFT_EDGE - TRUCK_GAP - TRUCK_TARGET_SIZE / 2

const TRUCK_GLTF_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/truck/scene.gltf'
useGLTF.preload(TRUCK_GLTF_URL)

function TruckPlaceholder() {
  return (
    <group position={[TRUCK_POSITION_X, 0.3, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.25, 0.2]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function DeliveryCar() {
  const { scene } = useGLTF(TRUCK_GLTF_URL)
  const { clonedScene, scale, position } = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true
        ;(child as THREE.Mesh).receiveShadow = true
      }
    })
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const s = TRUCK_TARGET_SIZE / maxDim
    // Place truck so its bottom sits at y=0 and its center X is at TRUCK_POSITION_X
    const pos = new THREE.Vector3(
      TRUCK_POSITION_X - center.x * s,
      -box.min.y * s,
      -center.z * s
    )
    return {
      clonedScene: clone,
      scale: s,
      position: pos,
    }
  }, [scene])

  return (
    <group position={[position.x, position.y, position.z]} scale={[scale, scale, scale]} rotation={[0, Math.PI / 2 + Math.PI, 0]}>
      <primitive object={clonedScene} />
    </group>
  )
}

function Pods({ onHoverChange }: { onHoverChange?: (t: HoverTarget) => void }) {
  return (
    <Pod position={[0, 0, 0]} delay={0} onHoverChange={onHoverChange} />
  )
}

function Pod({
  position,
  delay,
  onHoverChange,
}: {
  position: [number, number, number]
  delay: number
  onHoverChange?: (t: HoverTarget) => void
}) {
  const ref = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + delay) * 0.04
    }
    const pulse = hovered ? 0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.15 : 0.85
    if (ringRef.current?.material) {
      ;(ringRef.current.material as THREE.MeshBasicMaterial).opacity = pulse
    }
    if (glowRef.current?.material) {
      ;(glowRef.current.material as THREE.MeshBasicMaterial).opacity = hovered ? 1 : 0.9
    }
  })

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        onHoverChange?.('pod')
      }}
      onPointerOut={() => {
        setHovered(false)
        onHoverChange?.(null)
      }}
    >
      {/* Hit area */}
      <mesh position={[0, 0.4, 0]} visible={false}>
        <cylinderGeometry args={[1, 1, 1.2, 8]} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 0.15, 6]} />
        <meshStandardMaterial color="#57534e" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Dome */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0d9488" transparent opacity={hovered ? 0.4 : 0.25} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Ring */}
      <mesh ref={ringRef} position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.68, 32]} />
        <meshBasicMaterial color="#0d9488" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef} position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#14b8a6" transparent opacity={0.9} />
      </mesh>

      <pointLight position={[0, 0.4, 0]} color="#0d9488" intensity={hovered ? 2.2 : 1.5} distance={3} />
    </group>
  )
}

function CityBlocks() {
  const blocks = useMemo(() => {
    const out: { pos: [number, number, number]; size: [number, number, number]; glow: boolean }[] = []
    const seed = 42
    const random = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000
      return x - Math.floor(x)
    }
    let i = 0
    for (let x = -GRID_SIZE; x <= GRID_SIZE; x += 3.5) {
      for (let z = -GRID_SIZE; z <= GRID_SIZE; z += 3.5) {
        const dist = Math.sqrt(x * x + z * z)
        if (dist > 6 && dist < 22 && random(i) > 0.35) {
          const h = 0.4 + random(i + 1) * 2.8
          out.push({
            pos: [x + random(i + 2) * 1.2, h / 2, z + random(i + 3) * 1.2],
            size: [0.9 + random(i + 4) * 0.7, h, 0.9 + random(i + 5) * 0.7],
            glow: random(i + 6) > 0.88
          })
        }
        i++
      }
    }
    return out
  }, [])

  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial
            color={b.glow ? '#e7e5e4' : '#d6d3d1'}
            emissive={b.glow ? '#0d9488' : '#000000'}
            emissiveIntensity={b.glow ? 0.1 : 0}
            metalness={0.3}
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}

function CityGrid() {
  const [verts, indices] = useMemo(() => {
    const step = 2.5
    const points: number[] = []
    const idx: number[] = []
    let i = 0
    for (let x = -GRID_SIZE; x <= GRID_SIZE; x += step) {
      points.push(x, 0.02, -GRID_SIZE, x, 0.02, GRID_SIZE)
      idx.push(i, i + 1)
      i += 2
      points.push(-GRID_SIZE, 0.02, x, GRID_SIZE, 0.02, x)
      idx.push(i, i + 1)
      i += 2
    }
    return [new Float32Array(points), new Uint16Array(idx)]
  }, [])

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    g.setIndex(new THREE.BufferAttribute(indices, 1))
    return g
  }, [verts, indices])

  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial color="#0d9488" transparent opacity={0.15} />
    </lineSegments>
  )
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#f5f5f4" metalness={0.1} roughness={0.95} />
    </mesh>
  )
}
