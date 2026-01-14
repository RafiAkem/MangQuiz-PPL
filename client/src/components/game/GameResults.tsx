import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  RotateCcw,
  Home,
  Crown,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTriviaGame } from "../../lib/stores/useTriviaGame";
import { useNavigate } from "react-router-dom";

export function GameResults() {
  const { players, questions, resetGame } = useTriviaGame();
  const navigate = useNavigate();

  const [animateIn, setAnimateIn] = useState(false);

  // Calculate stats from actual game data
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const totalQuestions = questions.length;
  const totalPlayers = players.length;
  const averageScore =
    totalPlayers > 0
      ? Math.round(
        (players.reduce((acc, p) => acc + p.score, 0) / totalPlayers) * 10
      ) / 10
      : 0;

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-[#CCFF00]" />;
      case 1: return <Medal className="w-6 h-6 text-[#0D0D0D]/60" />;
      case 2: return <Medal className="w-6 h-6 text-[#FF4D4D]" />;
      default: return <div className="w-6 h-6 flex items-center justify-center font-mono text-xs text-[#0D0D0D]/40 font-bold">#{index + 1}</div>;
    }
  };

  const getRankLabel = (index: number) => {
    switch (index) {
      case 0: return "CHAMPION";
      case 1: return "RUNNER-UP";
      case 2: return "3RD PLACE";
      default: return `${index + 1}TH PLACE`;
    }
  };

  // Calculate player stats
  const getPlayerStats = (player: any) => {
    const correctAnswers = player.score;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    return { correctAnswers, accuracy };
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#0D0D0D] font-sans relative overflow-hidden flex flex-col items-center justify-center py-12">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-[#CCFF00]" />
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#0D0D0D] uppercase font-display">
              GAME <span className="text-[#0022FF]">COMPLETE</span>
            </h1>
            <Trophy className="w-8 h-8 text-[#CCFF00]" />
          </div>
          <p className="text-[#0D0D0D]/60 font-mono uppercase tracking-widest text-sm">
            FINAL RESULTS
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Winner Spotlight (Left Column) */}
          <div className="lg:col-span-5 space-y-6">
            {winner && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#CCFF00] border-2 border-[#0D0D0D] shadow-[8px_8px_0px_0px_#0D0D0D] p-8 relative overflow-hidden h-full flex flex-col justify-center items-center text-center"
              >
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#0D0D0D]" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#0D0D0D]" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#0D0D0D]" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#0D0D0D]" />

                <div className="relative z-10">
                  <div className="w-24 h-24 bg-[#0D0D0D] flex items-center justify-center mx-auto mb-6 border-4 border-[#0D0D0D]">
                    <Crown className="w-12 h-12 text-[#CCFF00]" />
                  </div>

                  <div className="inline-block px-4 py-2 mb-4 text-xs font-mono uppercase tracking-wider text-[#0D0D0D] border-2 border-[#0D0D0D] bg-white font-bold">
                    Champion
                  </div>

                  <h2 className="text-3xl md:text-5xl font-black text-[#0D0D0D] mb-8 tracking-tight uppercase font-display">
                    {winner.name}
                  </h2>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="p-4 bg-white border-2 border-[#0D0D0D]">
                      <div className="text-2xl font-bold text-[#0D0D0D] font-mono mb-1">
                        {winner.score}
                      </div>
                      <div className="text-[10px] text-[#0D0D0D]/60 uppercase tracking-wider font-mono">
                        Points
                      </div>
                    </div>
                    <div className="p-4 bg-white border-2 border-[#0D0D0D]">
                      <div className="text-2xl font-bold text-[#0D0D0D] font-mono mb-1">
                        {getPlayerStats(winner).accuracy}%
                      </div>
                      <div className="text-[10px] text-[#0D0D0D]/60 uppercase tracking-wider font-mono">
                        Accuracy
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Rankings & Stats (Right Column) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Rankings List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-2 border-[#0D0D0D] shadow-[6px_6px_0px_0px_#0D0D0D] p-6"
            >
              <h3 className="text-sm font-black text-[#0D0D0D] mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
                <Award className="w-4 h-4 text-[#0022FF]" />
                Leaderboard
              </h3>
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => {
                  const isWinner = index === 0;
                  return (
                    <div
                      key={player.id}
                      className={`p-4 border-2 transition-all flex items-center justify-between ${isWinner
                          ? "bg-[#CCFF00] border-[#0D0D0D]"
                          : "bg-[#F2F0E9] border-[#0D0D0D]/20"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 flex justify-center">{getRankIcon(index)}</div>
                        <div>
                          <div className={`font-black uppercase font-display ${isWinner ? "text-[#0D0D0D]" : "text-[#0D0D0D]"}`}>
                            {player.name}
                          </div>
                          <div className="text-[10px] text-[#0D0D0D]/50 font-mono uppercase tracking-wider">
                            {getRankLabel(index)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-lg bg-[#0D0D0D] text-white px-2 py-1">{player.score}</div>
                        <div className="text-[10px] text-[#0D0D0D]/50 uppercase font-mono mt-1">Points</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Game Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-4"
            >
              <div className="p-4 bg-white border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] text-center">
                <div className="text-2xl font-bold text-[#0D0D0D] mb-1 font-mono">{totalQuestions}</div>
                <div className="text-[10px] text-[#0D0D0D]/60 uppercase tracking-wider font-mono">Questions</div>
              </div>
              <div className="p-4 bg-white border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] text-center">
                <div className="text-2xl font-bold text-[#0D0D0D] mb-1 font-mono">{totalPlayers}</div>
                <div className="text-[10px] text-[#0D0D0D]/60 uppercase tracking-wider font-mono">Players</div>
              </div>
              <div className="p-4 bg-white border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] text-center">
                <div className="text-2xl font-bold text-[#0D0D0D] mb-1 font-mono">{averageScore}</div>
                <div className="text-[10px] text-[#0D0D0D]/60 uppercase tracking-wider font-mono">Avg Score</div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4 pt-2"
            >
              <Button
                onClick={() => {
                  resetGame();
                  navigate("/mode/local");
                }}
                className="flex-1 bg-[#CCFF00] hover:bg-[#CCFF00]/90 text-[#0D0D0D] font-black uppercase tracking-wide py-6 border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                PLAY AGAIN
              </Button>
              <Button
                onClick={() => navigate("/mode")}
                className="flex-1 bg-white hover:bg-[#F2F0E9] text-[#0D0D0D] font-black uppercase tracking-wide py-6 border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                <Home className="w-4 h-4 mr-2" />
                MENU
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
