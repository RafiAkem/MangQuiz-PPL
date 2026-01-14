"use client";

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SmoothScrollProvider } from "./SmoothScrollProvider";
import { ScrollProgress } from "./ScrollProgress";

// Section imports
import HeroSection from "./sections/HeroSection";
import { ProblemSection } from "./sections/ProblemSection";
import SolutionSection from "./sections/SolutionSection";
import { ModesSection } from "./sections/ModesSection";
import { ArenaSection } from "./sections/ArenaSection";
import CTASection from "./sections/CTASection";

export function LandingPage() {
  const navigate = useNavigate();

  const handleStart = useCallback(() => {
    navigate("/mode");
  }, [navigate]);

  return (
    <SmoothScrollProvider>
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Main Content */}
      <main className="relative bg-paper">
        {/* Hero - Full viewport with 3D orb */}
        <HeroSection onStart={handleStart} />

        {/* Problem - Why traditional quizzes suck */}
        <ProblemSection />

        {/* Solution - AI-powered infinite questions */}
        <SolutionSection />

        {/* Modes - Bento grid of game modes */}
        <ModesSection />

        {/* Arena - VS battle visualization */}
        <ArenaSection />

        {/* CTA - Final call to action with vortex */}
        <CTASection onStart={handleStart} />
      </main>
    </SmoothScrollProvider>
  );
}

export default LandingPage;
