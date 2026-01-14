"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchOnHover?: boolean;
  duration?: number;
}

const glitchChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?0123456789";

export function GlitchText({
  text,
  className = "",
  glitchOnHover = false,
  duration = 1500,
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(!glitchOnHover);

  useEffect(() => {
    if (!isGlitching) return;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration || char === " ") {
              return text[index];
            }
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setDisplayText(text);
        if (!glitchOnHover) {
          setIsGlitching(false);
        }
      }

      iteration += 1 / 3;
    }, duration / (text.length * 3));

    return () => clearInterval(interval);
  }, [text, isGlitching, duration, glitchOnHover]);

  const handleMouseEnter = () => {
    if (glitchOnHover) {
      setIsGlitching(true);
    }
  };

  const handleMouseLeave = () => {
    if (glitchOnHover) {
      setIsGlitching(false);
      setDisplayText(text);
    }
  };

  return (
    <motion.span
      className={`${className} inline-block`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-text={text}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={displayText}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className="relative"
        >
          {displayText}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
