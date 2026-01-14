import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const categories = [
  "HISTORY", "SCIENCE", "POP CULTURE", "SPORTS", 
  "GEOGRAPHY", "ARTS", "TECHNOLOGY", "LITERATURE"
];

const nodes = [
  { x: 20, y: 30 }, { x: 50, y: 20 }, { x: 80, y: 30 },
  { x: 30, y: 50 }, { x: 70, y: 50 },
  { x: 20, y: 70 }, { x: 50, y: 80 }, { x: 80, y: 70 }
];

const connections = [
  [0, 1], [1, 2], [0, 3], [1, 3], [1, 4], [2, 4],
  [3, 5], [3, 6], [4, 6], [4, 7], [5, 6], [6, 7]
];

const BinaryText = ({ text, progress }: { text: string; progress: number }) => {
  const [display, setDisplay] = useState("");
  const chars = "01";
  
  useEffect(() => {
    const totalLength = text.length;
    // Scramble effect:
    // As progress increases, more characters at the start become fixed (the real char).
    // The rest are random 0s and 1s.
    const scrambled = text.split("").map((char, index) => {
      if (progress * 1.5 > index / totalLength) {
        return char;
      }
      return chars[Math.floor(Math.random() * chars.length)];
    }).join("");
    
    setDisplay(scrambled);
  }, [text, progress]);

  return <span className="font-mono">{display}</span>;
};

const SolutionSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: pinnedRef.current,
          scrub: 1, 
          onUpdate: (self) => setScrollProgress(self.progress)
        }
      });

      // 1. Draw connections
      const lines = gsap.utils.toArray(".neural-line");
      tl.fromTo(lines, 
        { strokeDasharray: 200, strokeDashoffset: 200 },
        { strokeDashoffset: 0, duration: 2, stagger: 0.1, ease: "none" }
      );

      // 2. Pop nodes
      const circles = gsap.utils.toArray(".neural-node");
      tl.fromTo(circles,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, stagger: 0.1 },
        "<" // start at same time as lines
      );
      
      // 3. Reveal Headline
      tl.fromTo(".headline-text",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        "-=1"
      );

      // 4. Stagger pills
      tl.fromTo(".category-pill",
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 1 },
        "-=0.5"
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-[200vh] bg-ink">
      <div 
        ref={pinnedRef} 
        className="h-screen w-full flex flex-col items-center justify-center overflow-hidden relative"
      >
        {/* Background Neural Network */}
        <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full preserve-3d"
            preserveAspectRatio="xMidYMid slice"
          >
            {connections.map(([start, end], i) => (
              <line
                key={`line-${i}`}
                x1={nodes[start].x}
                y1={nodes[start].y}
                x2={nodes[end].x}
                y2={nodes[end].y}
                className="neural-line stroke-lime"
                strokeWidth="0.3"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {nodes.map((node, i) => (
              <circle
                key={`node-${i}`}
                cx={node.x}
                cy={node.y}
                r="1.5"
                className="neural-node fill-klein"
              />
            ))}
          </svg>
        </div>

        {/* Content Layer */}
        <div className="z-10 flex flex-col items-center justify-center space-y-8 text-center px-4 w-full max-w-6xl">
          
          {/* Headline */}
          <h2 className="headline-text text-paper font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl tracking-tighter uppercase">
            ENTER: GEMINI AI
          </h2>

          {/* Decoding Subtitle */}
          <div className="text-lime font-mono text-lg sm:text-xl md:text-3xl lg:text-4xl h-12 flex items-center justify-center">
            <BinaryText text="INFINITE QUESTIONS. ZERO REPEATS." progress={scrollProgress} />
          </div>

          {/* Categories Grid */}
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-8 w-full max-w-4xl"
          >
            {categories.map((cat, i) => (
              <div 
                key={cat} 
                className="category-pill bg-paper border-2 border-klein p-2 md:p-3 flex items-center justify-center shadow-brutal-klein hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#0022FF] transition-all"
              >
                <span className="font-mono text-ink font-bold text-xs md:text-base tracking-wider">
                  {cat}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements - Brutalist corners */}
        <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-lime" />
        <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-lime" />
        <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-lime" />
        <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-lime" />
        
        {/* Floating Code Snippet / Decorative */}
        <div className="absolute top-1/4 right-10 hidden lg:block opacity-50 font-mono text-xs text-lime text-right">
          <p>01001010101</p>
          <p>INITIALIZING...</p>
          <p>NODE_SYNC: OK</p>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
