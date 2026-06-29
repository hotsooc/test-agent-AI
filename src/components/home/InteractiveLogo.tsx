import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from '../../context/GameContext'

export default function InteractiveLogo() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { colorPrimary, isValorant } = useGame()

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.4
      meshRef.current.rotation.y = time * 0.6
      meshRef.current.rotation.z = time * 0.2
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[2.2, 0]} />
        <meshPhysicalMaterial
          color={colorPrimary}
          emissive={isValorant ? '#2a0005' : '#2a1700'}
          roughness={0.05}
          metalness={0.95}
          transmission={0.4}
          thickness={2.0}
        />
      </mesh>
    </Float>
  )
}
