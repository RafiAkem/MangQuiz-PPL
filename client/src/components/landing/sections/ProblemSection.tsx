import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

// --- Components ---

interface ShardProps {
  children: React.ReactNode;
  clipPath: string;
  xMove: number;
  yMove: number;
  rotate: number;
  progress: MotionValue<number>;
  index: number;
}

const Shard = ({ children, clipPath, xMove, yMove, rotate, progress, index }: ShardProps) => {
  // We trigger the shatter between scroll progress 0.5 and 0.8 
  // (when section is in the middle of viewport to when it's leaving)
  const shatterStart = 0.5;
  const shatterEnd = 0.8;

  // Map progress to movement
  const x = useTransform(progress, [shatterStart, shatterEnd], [0, xMove]);
  const y = useTransform(progress, [shatterStart, shatterEnd], [0, yMove]);
  const r = useTransform(progress, [shatterStart, shatterEnd], [0, rotate]);
  const opacity = useTransform(progress, [shatterStart + 0.1, shatterEnd], [1, 0]); // Fade out slightly at the end

  return (
    <motion.div
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        clipPath,
        x,
        y,
        rotate: r,
        opacity,
      }}
    >
      {children}
    </motion.div>
  );
};

interface ShatterCardProps {
  text: string;
  delay?: number;
  progress: MotionValue<number>;
  className?: string;
  rotation?: number;
}

const ShatterCard = ({ text, delay = 0, progress, className = "", rotation = 0 }: ShatterCardProps) => {
  // Base card design
  const cardContent = (
    <div className={`w-full h-full bg-[#E0DED7] border-2 border-black flex items-center justify-center relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      {/* Noise Texture Overlay - CSS-based grain effect */}
      <div 
        className="absolute inset-0 opacity-[0.08] mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Distressed details */}
      <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-black/20" />
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-black/20" />
      <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-black/20" />
      <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-black/20" />
      
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/5 transform -rotate-45" />
      
      <h3 className="font-display font-black text-4xl tracking-tighter text-[#0D0D0D] uppercase transform -rotate-2 z-10">
        {text}
      </h3>
      
      {/* "Old" Sticker */}
      <div className="absolute bottom-6 right-6 bg-[#FF4D4D] text-white text-[10px] font-bold px-2 py-1 transform rotate-6 border border-black">
        EXPIRED
      </div>
    </div>
  );

  return (
    <div className="relative w-full max-w-[256px] h-80 mx-4 my-8">
      {/* Container for shards */}
      <div className="relative w-full h-full">
        {/* Shard 1: Top Left */}
        <Shard 
          clipPath="polygon(0% 0%, 60% 0%, 50% 55%, 0% 40%)" 
          xMove={-60} yMove={-60} rotate={-15} 
          progress={progress} index={0}
        >
          {cardContent}
        </Shard>
        
        {/* Shard 2: Top Right */}
        <Shard 
          clipPath="polygon(60% 0%, 100% 0%, 100% 60%, 50% 55%)" 
          xMove={60} yMove={-40} rotate={15} 
          progress={progress} index={1}
        >
          {cardContent}
        </Shard>
        
        {/* Shard 3: Bottom Right */}
        <Shard 
          clipPath="polygon(50% 55%, 100% 60%, 100% 100%, 40% 100%)" 
          xMove={50} yMove={80} rotate={20} 
          progress={progress} index={2}
        >
          {cardContent}
        </Shard>
        
        {/* Shard 4: Bottom Left */}
        <Shard 
          clipPath="polygon(0% 40%, 50% 55%, 40% 100%, 0% 100%)" 
          xMove={-40} yMove={60} rotate={-20} 
          progress={progress} index={3}
        >
          {cardContent}
        </Shard>
      </div>
    </div>
  );
};

const TypewriterText = ({ text, progress }: { text: string; progress: MotionValue<number> }) => {
  // Split text into words
  const words = text.split(" ");
  
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 max-w-4xl mx-auto text-center z-20 relative">
      {words.map((word, i) => {
        // Calculate when each word should appear based on scroll progress
        // Reveal happens between 0.15 and 0.4 (when section enters viewport)
        const start = 0.15 + (i * 0.02); 
        const end = start + 0.05;
        
        const opacity = useTransform(progress, [start, end], [0, 1]);
        const y = useTransform(progress, [start, end], [20, 0]);
        
        // Special styling for "COMPLETELY. UTTERLY."
        const isEmphasis = word.includes("COMPLETELY") || word.includes("UTTERLY");
        
        return (
          <motion.span
            key={i}
            style={{ opacity, y }}
            className={`font-display font-bold text-3xl md:text-5xl lg:text-6xl ${
              isEmphasis ? "text-[#FF4D4D] italic" : "text-[#0D0D0D]"
            }`}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
};

export const ProblemSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Start tracking when section enters viewport, end when it leaves
    offset: ["start end", "end start"]
  });

  // Parallax effects for the cards (before they shatter)
  // Unified to keep cards aligned horizontally
  const cardY = useTransform(scrollYProgress, [0.2, 0.5], [30, 0]);

  // Falling debris effect (simple squares)
  const debrisY = useTransform(scrollYProgress, [0.5, 0.8], [0, 300]);
  const debrisOpacity = useTransform(scrollYProgress, [0.5, 0.6, 0.8], [0, 1, 0]);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen bg-[#F2F0E9] overflow-hidden flex flex-col items-center py-16 md:py-24"
    >
      {/* Content container - not sticky anymore */}
      <div className="w-full flex flex-col items-center justify-center px-4">
        
        {/* Header Text */}
        <div className="w-full mb-8 md:mb-16">
           <TypewriterText 
             text="TRADITIONAL QUIZZES ARE... COMPLETELY. UTTERLY." 
             progress={scrollYProgress} 
           />
        </div>

        {/* Cards Container */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative z-10 w-full">
          
          <motion.div style={{ y: cardY }} className="transform -rotate-6 w-full max-w-[256px] flex justify-center">
            <ShatterCard 
              text="BORING" 
              progress={scrollYProgress} 
              className="bg-[#E5E5E5]"
            />
          </motion.div>

          <motion.div style={{ y: cardY }} className="transform rotate-3 z-10 mx-[-20px] w-full max-w-[256px] flex justify-center">
            <ShatterCard 
              text="FINITE" 
              progress={scrollYProgress} 
              className="bg-[#D4D4D4]"
            />
          </motion.div>

          <motion.div style={{ y: cardY }} className="transform rotate-12 w-full max-w-[256px] flex justify-center">
            <ShatterCard 
              text="STATIC" 
              progress={scrollYProgress} 
              className="bg-[#C4C4C4]"
            />
          </motion.div>

        </div>

        {/* Debris Layer */}
        <motion.div 
          style={{ y: debrisY, opacity: debrisOpacity }}
          className="absolute inset-0 pointer-events-none z-0"
        >
           {/* Random debris particles */}
           {[...Array(10)].map((_, i) => (
             <div 
               key={i}
               className="absolute w-4 h-4 bg-[#FF4D4D]"
               style={{
                 left: `${20 + Math.random() * 60}%`,
                 top: `${40 + Math.random() * 20}%`,
                 transform: `rotate(${Math.random() * 360}deg)`,
                 clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
               }}
             />
           ))}
           {[...Array(8)].map((_, i) => (
             <div 
               key={`sq-${i}`}
               className="absolute w-3 h-3 bg-black"
               style={{
                 left: `${20 + Math.random() * 60}%`,
                 top: `${40 + Math.random() * 20}%`,
                 transform: `rotate(${Math.random() * 360}deg)`,
               }}
             />
           ))}
        </motion.div>

        {/* Project Credits */}
        <div className="mt-16 flex flex-col items-center justify-center z-20">
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-[#0D0D0D]/60 mb-1">
            Hacktiv8 x IBM Capstone Project by Rafi Ikhsanul Hakim
          </p>
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-[#0D0D0D]/40">
            Re-engineered by B.YU Team
          </p>
        </div>

      </div>
      
    </section>
  );
};
