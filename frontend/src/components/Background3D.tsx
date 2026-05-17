import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField({ count = 5000, color = '#00E5FF', size = 0.1, mode = 'landing' }: { count?: number; color?: string; size?: number; mode?: string }) {
  const ref = useRef<THREE.Points>(null)
  const mouse = useRef({ x: 0, y: 0 })

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60
    }
    return pos
  }, [count])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 25
      ref.current.rotation.y -= delta / 30
      ref.current.position.x += (mouse.current.x * 2 - ref.current.position.x) * 0.02
      ref.current.position.y += (-mouse.current.y * 2 - ref.current.position.y) * 0.02
      const time = state.clock.getElapsedTime()
      ref.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.05)
      if (ref.current.material instanceof THREE.PointsMaterial) {
        const pulse = 1 + Math.sin(time * 3) * 0.2
        ref.current.material.size = size * pulse
      }
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={mode === 'detail' ? 0.6 : 0.5}
      />
    </Points>
  )
}

function DangerAura() {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z += 0.002
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.15
      ref.current.scale.setScalar(pulse)
    }
  })

  return (
    <group ref={ref}>
      <Sparkles count={80} scale={25} size={15} speed={0.3} opacity={0.25} color="#FF2020" />
      <Sparkles count={60} scale={30} size={25} speed={0.15} opacity={0.15} color="#FF0040" />
      <Sparkles count={40} scale={20} size={20} speed={0.5} opacity={0.2} color="#00E5FF" />
    </group>
  )
}

interface Background3DProps {
  mode?: 'landing' | 'detail'
}

export default function Background3D({ mode = 'landing' }: Background3DProps) {
  const count = mode === 'detail' ? 7000 : 5000
  const particleColor = mode === 'detail' ? '#FF4060' : '#00E5FF'

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: mode === 'detail' ? 0.7 : 0.6 }}>
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <ParticleField count={count} color={particleColor} mode={mode} />
        {mode === 'detail' && <DangerAura />}
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  )
}