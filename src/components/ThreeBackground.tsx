import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../context/GameContext'

function Particles({ count = 1200, color }: { count?: number; color: string }) {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50
      vel[i * 3] = (Math.random() - 0.5) * 0.05
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.05
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.05
    }
    return [pos, vel]
  }, [count])

  useFrame((state) => {
    const points = pointsRef.current
    if (!points) return
    const currentPositions = points.geometry.attributes.position.array as Float32Array
    const time = state.clock.getElapsedTime()
    const mouseX = state.pointer.x * 2
    const mouseY = state.pointer.y * 2

    for (let i = 0; i < count; i++) {
      currentPositions[i * 3] += velocities[i * 3]
      currentPositions[i * 3 + 1] += velocities[i * 3 + 1]
      currentPositions[i * 3 + 2] += velocities[i * 3 + 2]

      if (Math.abs(currentPositions[i * 3]) > 25) velocities[i * 3] *= -1
      if (Math.abs(currentPositions[i * 3 + 1]) > 25) velocities[i * 3 + 1] *= -1
      if (Math.abs(currentPositions[i * 3 + 2]) > 25) velocities[i * 3 + 2] *= -1

      currentPositions[i * 3] += Math.sin(time + i) * 0.005 + mouseX * 0.002
      currentPositions[i * 3 + 1] += Math.cos(time + i) * 0.005 + mouseY * 0.002
    }

    points.geometry.attributes.position.needsUpdate = true
    points.rotation.y = time * 0.02
    points.rotation.x = time * 0.01
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.12}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function ThreeBackground() {
  const { colorPrimary, isValorant } = useGame()

  const radialBg = isValorant
    ? 'radial-gradient(circle at center, #0f1923 0%, #080c10 100%)'
    : 'radial-gradient(circle at center, #1b2228 0%, #0a0d10 100%)'

  return (
    <div 
      className="fixed inset-0 z-[-1] pointer-events-none transition-all duration-500" 
      style={{ background: radialBg }}
    >
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <Particles color={colorPrimary} />
      </Canvas>
    </div>
  )
}
