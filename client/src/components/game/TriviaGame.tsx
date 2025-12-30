import { useEffect } from "react";
import { Question } from "./Question";
import { ScoreBoard } from "./ScoreBoard";
import { GameResults } from "./GameResults";
import { useTriviaGame } from "../../lib/stores/useTriviaGame";
import { useAudio } from "../../lib/stores/useAudio";

// Legacy component - now redirects to LocalTriviaGame
// This component is kept for backward compatibility
export function TriviaGame() {
  const { phase } = useTriviaGame();
  const { playSuccess } = useAudio();

  // Handle phase transitions for sound effects
  useEffect(() => {
    if (phase === "final") {
      setTimeout(() => playSuccess(), 500);
    }
  }, [phase, playSuccess]);

  // Local game
  if (phase === "final") {
    return <GameResults />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>
      <div className="relative z-10 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            <Question />
          </div>
          {/* Sidebar with Scoreboard */}
          <div className="space-y-6">
            <ScoreBoard />
            {/* Add round stats or other sidebar cards here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
