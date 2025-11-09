/* eslint-disable react/no-unknown-property */


import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface AetherisHeartUltraProps {
  frequence?: number; // fréquence cardiaque (bpm)
  alertes?: string[];
}

const AetherisHeartUltra: React.FC<AetherisHeartUltraProps> = ({
  frequence = 72,
  alertes = [],
}) => {
  const heartRef = useRef<THREE.Group>(null!);
  const bloodParticles = useRef<THREE.Points>(null!);
  const hasAlert = alertes.length > 0;

  const bpm = frequence / 60; // battements par seconde
  const baseColor = hasAlert
    ? new THREE.Color("#ff0000")
    : frequence > 100
    ? new THREE.Color("#ff9900")
    : frequence < 55
    ? new THREE.Color("#00aaff")
    : new THREE.Color("#ff3355");

  // 🩸 Création du flux sanguin (particules)
  const particles = useMemo(() => {
    const count = 600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 3;
    }
    return positions;
  }, []);

  // 💓 Animation en temps réel
/*
useFrame(({ clock }) => {
  const t = clock.getElapsedTime();
  const heart = heartRef.current;
  const bp = bloodParticles.current;

  if (!heart || !bp) return;

  const beat = 1 + 0.08 * Math.sin(t * bpm * Math.PI * 2);
  heart.scale.set(beat, beat, beat);

  bp.rotation.y += 0.0015;

  const geometry = bp.geometry as THREE.BufferGeometry | undefined;
  const positionAttr = geometry?.attributes?.position as THREE.BufferAttribute | undefined;

  if (!positionAttr || !positionAttr.array) return;

  const arr = positionAttr.array as Float32Array;
  for (let i = 0; i < arr.length / 3; i++) {
    arr[i * 3 + 1] += Math.sin(t + i) * 0.0005;
  }

  positionAttr.needsUpdate = true;
});
*/


 
  // ✅ Rendu principal
  return (
    <div className="relative h-[550px] w-full rounded-3xl bg-gradient-to-br from-black/80 to-gray-900/80 shadow-[0_0_30px_rgba(255,0,50,0.25)] border border-white/10 backdrop-blur-3xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        {/* 🌟 Lumières dynamiques */}
        <ambientLight intensity={0.3} />
        <spotLight position={[3, 3, 3]} intensity={2.2} color={baseColor} castShadow />
        <pointLight position={[-2, -2, -2]} intensity={1.3} color={"#ff88aa"} />

        {/* 🫀 Corps du cœur */}
        <group ref={heartRef} position={[0, 0, 0]}>
          {/* Myocarde */}
          <mesh>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial
              color={baseColor}
              emissive={baseColor}
              emissiveIntensity={0.25}
              roughness={0.35}
              metalness={0.45}
            />
          </mesh>

          {/* Veines et artères principales */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 0.9;
            const y = Math.sin(angle) * 0.9;
            return (
              <mesh key={i} position={[x, y, Math.random() * 0.4 - 0.2]}>
                <cylinderGeometry args={[0.05, 0.03, 1, 16]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? "#ff3333" : "#3366ff"}
                  emissive={i % 2 === 0 ? "#ff5555" : "#5599ff"}
                  emissiveIntensity={0.8}
                />
              </mesh>
            );
          })}
        </group>

        {/* 🩸 Flux sanguin flottant */}
        <points ref={bloodParticles}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particles, 3]} // ✅ Type correct
            />
          </bufferGeometry>
          <pointsMaterial color="#ff3355" size={0.03} transparent opacity={0.5} />
        </points>

        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>

      {/* ❤️ Légende IA */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-300">
        <span className="text-red-400 font-semibold">AETHERIS HEART ULTRA V2</span> — Simulation
        biométrique & flux sanguin IA
      </div>

      {/* ECG Animé */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-12 overflow-hidden opacity-60">
        <svg viewBox="0 0 400 50" className="w-full h-full">
          <polyline
            points="0,25 50,25 60,5 70,45 80,25 120,25 130,10 140,40 150,25 400,25"
            fill="none"
            stroke={hasAlert ? "#ff0000" : "#00ffcc"}
            strokeWidth="2"
          >
            <animate
              attributeName="points"
              dur={`${60 / frequence}s`}
              repeatCount="indefinite"
              values="0,25 50,25 60,5 70,45 80,25 120,25 130,10 140,40 150,25 400,25;
                      0,25 40,25 50,5 60,45 70,25 110,25 120,10 130,40 140,25 390,25;
                      0,25 50,25 60,5 70,45 80,25 120,25 130,10 140,40 150,25 400,25"
            />
          </polyline>
        </svg>
      </div>

      {/* Halo IA */}
      <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-pink-500/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default AetherisHeartUltra;
