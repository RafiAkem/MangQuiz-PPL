import React from "react";
import { motion } from "framer-motion";
import { RevealOnScroll } from "../animations/RevealOnScroll";
import { Swords, Users, Trophy, ArrowRight } from "lucide-react";

export const ModesSection = () => {
  const modes = [
    {
      id: "local",
      title: "LOCAL BATTLE",
      description: "1v1 on the same device. Pure chaos. No excuses.",
      icon: Swords,
      bgColor: "bg-[#CCFF00]", // Lime
      textColor: "text-black",
      iconColor: "text-black",
    },
    {
      id: "party",
      title: "PARTY MODE",
      description: "Join a room. Crush your friends. Ruin friendships.",
      icon: Users,
      bgColor: "bg-[#0022FF]", // Klein
      textColor: "text-white",
      iconColor: "text-[#CCFF00]", // Lime accent on Blue
    },
    {
      id: "ranked",
      title: "RANKED LADDER",
      description: "Global leaderboards. High stakes. Become the king.",
      icon: Trophy,
      bgColor: "bg-[#FF4D4D]", // Salmon
      textColor: "text-black",
      iconColor: "text-black",
    },
  ];

  return (
    <section className="relative w-full py-24 bg-[#F2F0E9] border-t-2 border-black overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-black opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0022FF] opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <RevealOnScroll className="w-full">
          <div className="mb-16 text-center">
            <div className="inline-block bg-black text-white px-4 py-1 text-sm font-bold uppercase tracking-widest mb-4 rotate-1 shadow-[4px_4px_0px_0px_#CCFF00]">
              Choose Your Weapon
            </div>
            <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-black">
              Ways to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0022FF] to-[#FF4D4D]">Dominate</span>
            </h2>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {modes.map((mode, index) => (
            <RevealOnScroll key={mode.id} delay={index * 0.1} className="w-full h-full">
              <motion.div
                whileHover={{ 
                  y: -8, 
                  boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)" 
                }}
                className={`group relative h-full p-6 md:p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${mode.bgColor} transition-all duration-300 cursor-pointer overflow-hidden`}
              >
                {/* Noise Texture Overlay - inline SVG for CSP compliance */}
                <div 
                  className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  }}
                />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className={`w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 flex items-center justify-center border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform duration-300`}>
                      <mode.icon className={`w-6 h-6 md:w-8 md:h-8 text-black`} />
                    </div>
                    
                    <h3 className={`text-2xl md:text-3xl font-black uppercase mb-3 md:mb-4 leading-none ${mode.textColor}`}>
                      {mode.title}
                    </h3>
                    
                    <p className={`text-base md:text-lg font-bold leading-tight ${mode.textColor} opacity-90`}>
                      {mode.description}
                    </p>
                  </div>

                  <div className={`mt-6 md:mt-8 flex items-center gap-2 font-black uppercase tracking-wider ${mode.textColor}`}>
                    <span>Play Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 border-4 border-black opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500" />
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};
