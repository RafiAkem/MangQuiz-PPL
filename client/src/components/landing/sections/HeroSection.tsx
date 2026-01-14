"use client";

import React, { useRef, useLayoutEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Play } from "lucide-react";
import { GlitchText } from "../animations/GlitchText";
import * as THREE from "three";

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// 3D Scene Component
function AnimatedOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Mouse tracking parallax
    // state.pointer.x goes from -1 to 1
    const targetX = state.pointer.x * 1;
    const targetY = state.pointer.y * 1;
    
    // Smooth lerp for organic movement
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetY * 0.4, 0.05);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetX * 0.4, 0.05);
    // Slight position shift
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX * 0.2, 0.05);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY * 0.2, 0.05);
  });

  return (
    <Sphere args={[1, 64, 64]} scale={2.4} ref={meshRef}>
      <MeshDistortMaterial
        color="#0022FF" // Klein Blue
        attach="material"
        distort={0.5} // Strength of distortion
        speed={2} // Speed of distortion
        roughness={0.2}
        metalness={0.8}
        bumpScale={0.005}
      />
    </Sphere>
  );
}

interface HeroSectionProps {
  onStart?: () => void;
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Scroll-triggered shrink animation for the orb container
      gsap.to(orbContainerRef.current, {
        scale: 0.5,
        y: 100,
        opacity: 0,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1, // Smooth scrubbing
        },
      });

      // Parallax effect for text moving slightly faster
      gsap.to(textRef.current, {
        y: -100,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative h-screen w-full overflow-hidden bg-paper flex items-center justify-center selection:bg-lime selection:text-ink"
    >
      {/* 3D Background Layer */}
      <div 
        ref={orbContainerRef}
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
      >
        <Canvas className="w-full h-full" camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <directionalLight position={[-10, -10, -5]} intensity={1} color="#CCFF00" />
          <AnimatedOrb />
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
      </div>

      {/* Grid Pattern Overlay (Technical/Blueprint feel) */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Content Layer */}
      <div ref={textRef} className="relative z-10 flex flex-col items-center justify-center text-center p-4 w-full max-w-5xl mx-auto">
        
        {/* Floating Label */}
        <motion.div 
          initial={{ opacity: 0, y: -20, rotate: -5 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
          className="mb-8 bg-lime border-2 border-ink px-6 py-2 shadow-brutal transform hover:rotate-0 transition-transform duration-300"
        >
          <span className="font-mono text-sm md:text-base font-bold uppercase tracking-widest text-ink">
            /// Multiplayer Quiz Arena ///
          </span>
        </motion.div>

        {/* Glitch Title */}
        <div className="relative mb-8 group">
          <div className="relative z-10">
            <GlitchText 
              text="MANGQUIZ" 
              className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] leading-none text-ink tracking-tighter"
              glitchOnHover={true}
            />
          </div>
          
          {/* Decorative Elements (Corners) */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute -top-6 -left-6 md:-left-12 w-12 h-12 border-t-4 border-l-4 border-klein hidden sm:block" 
          />
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute -bottom-6 -right-6 md:-right-12 w-12 h-12 border-b-4 border-r-4 border-klein hidden sm:block" 
          />
        </div>

        {/* Subtitle */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="max-w-2xl mx-auto mb-12 relative"
        >
          <div className="bg-paper/90 backdrop-blur-sm border-2 border-ink p-4 md:p-6 shadow-brutal-sm relative z-10">
            <p className="font-body text-base md:text-xl font-medium text-ink leading-relaxed">
              Compete in real-time battles. Generate infinite questions with AI. 
              Dominate the global leaderboard in this <span className="bg-lime px-2 font-bold inline-block transform -skew-x-6">Neo-Brutalist</span> trivia experience.
            </p>
          </div>
          <div className="absolute top-2 left-2 w-full h-full bg-klein border-2 border-ink -z-10"></div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
        >
          <button
            onClick={onStart}
            className="brutal-btn group relative inline-flex items-center justify-center bg-klein text-white border-2 border-ink px-6 py-4 md:px-10 md:py-5 text-lg md:text-xl font-display uppercase tracking-wide shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
              Start Challenge
            </span>
            <div className="absolute inset-0 bg-ink z-0 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-ink bg-white/80 backdrop-blur border border-ink px-3 py-1">
          Scroll to Discover
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="bg-lime border border-ink p-1 rounded-full"
        >
          <ArrowDown className="w-5 h-5 text-ink" />
        </motion.div>
      </motion.div>
      
      {/* Decorative Side Elements (Barcode/Texture style) */}
      <div className="absolute left-6 bottom-32 hidden lg:flex flex-col gap-1 opacity-40">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-1 bg-ink" style={{ width: Math.random() * 40 + 10 }}></div>
        ))}
      </div>
      <div className="absolute right-6 top-32 hidden lg:block opacity-40 font-mono text-xs writing-vertical text-ink font-bold tracking-widest rotate-180">
        EST. 2025 // SYSTEM.V2.0
      </div>
    </section>
  );
}
