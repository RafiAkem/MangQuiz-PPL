import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ParallaxLayer } from "../animations/ParallaxLayer";
import { Zap, Trophy, Crown, Skull } from "lucide-react";

export const ArenaSection = () => {
  const { scrollYProgress } = useScroll();
  
  // Parallax values for background elements
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  return (
    <section className="relative w-full h-screen bg-[#F2F0E9] overflow-hidden border-t-2 border-black flex flex-col items-center justify-center">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{ 
             backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", 
             backgroundSize: "40px 40px" 
           }} 
      />

      {/* Parallax Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <ParallaxLayer speed={-0.2} className="absolute top-[10%] left-[5%]">
          <div className="w-12 h-12 border-2 border-black bg-[#CCFF00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-12" />
        </ParallaxLayer>
        <ParallaxLayer speed={0.3} className="absolute bottom-[20%] right-[10%]">
          <div className="w-16 h-16 border-2 border-black bg-[#0022FF] rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-80" />
        </ParallaxLayer>
        <ParallaxLayer speed={-0.15} className="absolute top-[40%] right-[25%]">
           <Zap className="w-12 h-12 text-black fill-[#CCFF00] -rotate-12" />
        </ParallaxLayer>
      </div>

      {/* VS Battle Container */}
      <div className="relative w-full max-w-7xl mx-auto px-4 flex items-center justify-center h-full">
        
        {/* PLAYER 1 (Left) */}
        <motion.div 
          initial={{ x: "-100%", opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ type: "spring", bounce: 0.2, duration: 1 }}
          className="absolute left-0 md:left-10 top-1/2 -translate-y-1/2 w-[40vw] md:w-[30vw] z-10 hidden md:block"
        >
          <div className="relative bg-[#0022FF] border-2 border-black p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-2">
            <div className="bg-white border-2 border-black h-[400px] flex flex-col items-center justify-center relative overflow-hidden group">
               {/* Character Placeholder - inline SVG noise for CSP compliance */}
               <div 
                 className="absolute inset-0 opacity-20 mix-blend-overlay"
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                 }}
               />
               <div className="w-32 h-32 bg-[#0022FF] rounded-full border-4 border-black mb-6 flex items-center justify-center relative">
                 <Crown className="w-16 h-16 text-white" />
                 <div className="absolute -bottom-2 -right-2 bg-[#CCFF00] border-2 border-black px-2 font-black text-xs">LVL 99</div>
               </div>
               <h3 className="text-4xl font-black uppercase italic tracking-tighter">BLUE TEAM</h3>
               <div className="w-full px-8 mt-4">
                 <div className="flex justify-between text-xs font-bold mb-1">
                   <span>WIN RATE</span>
                   <span>88%</span>
                 </div>
                 <div className="h-4 w-full border-2 border-black bg-white">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: "88%" }}
                     transition={{ delay: 0.5, duration: 1 }}
                     className="h-full bg-[#0022FF]" 
                   />
                 </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* VS CENTER ELEMENT */}
        <div className="relative z-20 flex flex-col items-center justify-center">
          <motion.div
             initial={{ scale: 0, rotate: -180 }}
             whileInView={{ scale: 1, rotate: 0 }}
             transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
             className="relative"
          >
            {/* Spark Effect Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className="w-full h-full"
               >
                 <Zap className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 text-[#CCFF00] fill-[#CCFF00]" />
                 <Zap className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 text-[#CCFF00] fill-[#CCFF00]" />
                 <Zap className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-[#CCFF00] fill-[#CCFF00]" />
                 <Zap className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 text-[#CCFF00] fill-[#CCFF00]" />
               </motion.div>
            </div>

            <div className="text-[8rem] sm:text-[10rem] md:text-[15rem] font-black leading-none text-black tracking-tighter italic relative" style={{ textShadow: "4px 4px 0px #CCFF00, 10px 10px 0px #CCFF00" }}>
              VS
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 md:mt-8 bg-black text-[#CCFF00] px-6 py-3 md:px-8 md:py-2 text-lg md:text-xl font-bold uppercase tracking-widest border-2 border-transparent shadow-[4px_4px_0px_0px_#CCFF00] hover:shadow-[6px_6px_0px_0px_#CCFF00] hover:-translate-y-1 transition-all cursor-pointer"
          >
            Enter The Arena
          </motion.div>
        </div>

        {/* PLAYER 2 (Right) */}
        <motion.div 
          initial={{ x: "100%", opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ type: "spring", bounce: 0.2, duration: 1 }}
          className="absolute right-0 md:right-10 top-1/2 -translate-y-1/2 w-[40vw] md:w-[30vw] z-10 hidden md:block"
        >
          <div className="relative bg-[#FF4D4D] border-2 border-black p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-2">
            <div className="bg-white border-2 border-black h-[400px] flex flex-col items-center justify-center relative overflow-hidden group">
               {/* Character Placeholder - inline SVG noise for CSP compliance */}
               <div 
                 className="absolute inset-0 opacity-20 mix-blend-overlay"
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                 }}
               />
               <div className="w-32 h-32 bg-[#FF4D4D] rounded-full border-4 border-black mb-6 flex items-center justify-center relative">
                 <Skull className="w-16 h-16 text-white" />
                 <div className="absolute -bottom-2 -left-2 bg-black text-white border-2 border-[#FF4D4D] px-2 font-black text-xs">LVL 85</div>
               </div>
               <h3 className="text-4xl font-black uppercase italic tracking-tighter">RED TEAM</h3>
               <div className="w-full px-8 mt-4">
                 <div className="flex justify-between text-xs font-bold mb-1">
                   <span>WIN RATE</span>
                   <span>92%</span>
                 </div>
                 <div className="h-4 w-full border-2 border-black bg-white">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: "92%" }}
                     transition={{ delay: 0.5, duration: 1 }}
                     className="h-full bg-[#FF4D4D]" 
                   />
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
        
        {/* Mobile View Placeholder */}
        <div className="md:hidden absolute top-[15%] left-1/2 -translate-x-1/2 w-64 opacity-50">
           <div className="text-center font-bold text-xl mb-4 bg-white border-2 border-black p-2 shadow-[4px_4px_0px_0px_#000]">BLUE TEAM</div>
        </div>
        <div className="md:hidden absolute bottom-[15%] left-1/2 -translate-x-1/2 w-64 opacity-50">
           <div className="text-center font-bold text-xl mb-4 bg-white border-2 border-black p-2 shadow-[4px_4px_0px_0px_#000]">RED TEAM</div>
        </div>

      </div>
    </section>
  );
};
