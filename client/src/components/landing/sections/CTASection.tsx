import { motion } from "framer-motion";
import { MagneticButton } from "../animations/MagneticButton";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface CTASectionProps {
  onStart?: () => void;
}

interface Particle {
  id: number;
  initialX: string;
  initialY: string;
  duration: number;
  delay: number;
}

export default function CTASection({ onStart }: CTASectionProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles on client side only to avoid hydration mismatch
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      // Start from a random position well outside the center
      initialX: `${(Math.random() - 0.5) * 150}vw`,
      initialY: `${(Math.random() - 0.5) * 150}vh`,
      duration: 1.5 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <section className="relative w-full h-screen bg-ink overflow-hidden flex flex-col items-center justify-center isolate">
      {/* Background Vortex */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        {/* Ring 1 - Klein Blue Base */}
        <motion.div
          className="absolute w-[120vmax] h-[120vmax] rounded-full mix-blend-screen"
          style={{
            background: "conic-gradient(from 0deg, transparent 0%, #0022FF 20%, transparent 40%, #0022FF 60%, transparent 100%)",
            filter: "blur(80px)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Ring 2 - Lime Reverse */}
        <motion.div
          className="absolute w-[90vmax] h-[90vmax] rounded-full mix-blend-screen"
          style={{
            background: "conic-gradient(from 180deg, transparent 0%, #CCFF00 10%, transparent 50%, #0022FF 80%, transparent 100%)",
            filter: "blur(60px)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Ring 3 - Inner Core */}
        <motion.div
          className="absolute w-[40vmax] h-[40vmax] rounded-full mix-blend-overlay"
          style={{
            background: "radial-gradient(circle, #CCFF00 0%, transparent 70%)",
            filter: "blur(40px)",
            opacity: 0.2
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Converging Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute left-1/2 top-1/2 w-1 h-1 md:w-2 md:h-2 bg-paper rounded-full"
            initial={{ 
              x: p.initialX, 
              y: p.initialY, 
              opacity: 0, 
              scale: 0 
            }}
            animate={{ 
              x: 0, 
              y: 0, 
              opacity: [0, 1, 0], 
              scale: [0.2, 1, 0] 
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeIn"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-7xl mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 md:mb-24"
        >
            <h2 className="font-display font-black text-4xl sm:text-6xl md:text-8xl lg:text-9xl text-paper uppercase tracking-tighter leading-[0.85] flex flex-col items-center">
                <span className="relative inline-block hover:scale-105 transition-transform duration-300">
                    Ready To
                </span>
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-b from-lime to-[#a3cc00] filter drop-shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:scale-110 transition-transform duration-300">
                    Prove
                </span>
                <span className="relative inline-block hover:skew-x-6 transition-transform duration-300 origin-bottom">
                    Yourself?
                </span>
            </h2>
        </motion.div>

        <div className="relative">
            <MagneticButton strength={0.4} className="group">
                <button 
                    onClick={onStart}
                    className="
                        relative 
                        bg-lime text-ink 
                        font-display font-black 
                        text-2xl md:text-5xl 
                        px-8 py-4 md:px-24 md:py-12 
                        border-4 md:border-[6px] border-ink 
                        shadow-[8px_8px_0px_0px_#0022FF] 
                        hover:shadow-[16px_16px_0px_0px_#0022FF] 
                        hover:-translate-y-2 hover:-translate-x-2
                        active:translate-y-0 active:translate-x-0 active:shadow-none 
                        transition-all duration-200 
                        uppercase 
                        flex items-center gap-4 md:gap-6
                        overflow-hidden
                    "
                >
                    <span className="relative z-10">Play Now</span>
                    <ArrowRight className="relative z-10 w-8 h-8 md:w-12 md:h-12 transition-transform duration-300 group-hover:translate-x-4" strokeWidth={3} />
                    
                    {/* Hover Effect Glare */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-200" />
                </button>
            </MagneticButton>
            
            {/* Background decorative glow behind button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-lime/20 blur-2xl -z-10 group-hover:bg-lime/40 transition-colors duration-300" />
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 w-full text-center z-10">
        <div className="flex flex-col items-center gap-2">
            <p className="text-paper/60 font-mono text-xs uppercase tracking-[0.2em]">
                MangQuiz Challenge © {new Date().getFullYear()}
            </p>
            <div className="w-1 h-1 bg-lime rounded-full animate-pulse" />
        </div>
      </footer>
    </section>
  );
}
