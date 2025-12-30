import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  RotateCcw,
  Home,
  Crown,
  Sparkles,
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
      case 0: return <Crown className="w-6 h-6 text-gold-400" />;
      case 1: return <Medal className="w-6 h-6 text-slate-400" />;
      case 2: return <Medal className="w-6 h-6 text-orange-400" />;
      default: return <div className="w-6 h-6 flex items-center justify-center font-mono text-xs text-slate-400">#{index + 1}</div>;
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
    const correctAnswers = player.score; // Assuming score = correct answers for now
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    return { correctAnswers, accuracy };
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-gold-500/30 relative overflow-hidden flex flex-col items-center justify-center py-12">
      {/* Dither Noise & Grid */}
      <div className="fixed inset-0 dither-noise z-50 pointer-events-none mix-blend-overlay opacity-20" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-gold-400" />
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              GAME <span className="text-gold-400">COMPLETE</span>
            </h1>
            <Trophy className="w-8 h-8 text-gold-400" />
          </div>
          <p className="text-slate-400 font-mono uppercase tracking-widest text-sm">
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
                className="bg-navy-900/50 border border-gold-500/30 p-8 relative overflow-hidden h-full flex flex-col justify-center items-center text-center"
              >
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold-400" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gold-400" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gold-400" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold-400" />

                <div className="absolute inset-0 bg-gold-500/5" />

                <div className="relative z-10">
                  <div className="w-24 h-24 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold-500/30">
                    <Crown className="w-12 h-12 text-gold-400" />
                  </div>

                  <div className="inline-block px-3 py-1 mb-4 text-xs font-mono uppercase tracking-wider text-gold-400 border border-gold-500/30 bg-gold-500/10">
                    Champion
                  </div>

                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                    {winner.name}
                  </h2>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="p-4 bg-navy-950/50 border border-gold-500/20">
                      <div className="text-2xl font-bold text-gold-400 font-mono mb-1">
                        {winner.score}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                        Points
                      </div>
                    </div>
                    <div className="p-4 bg-navy-950/50 border border-gold-500/20">
                      <div className="text-2xl font-bold text-gold-400 font-mono mb-1">
                        {getPlayerStats(winner).accuracy}%
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
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
              className="bg-navy-900/30 border border-white/10 p-6"
            >
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Award className="w-4 h-4 text-gold-400" />
                Leaderboard
              </h3>
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => {
                  const isWinner = index === 0;
                  return (
                    <div
                      key={player.id}
                      className={`p-4 border transition-all flex items-center justify-between ${isWinner
                          ? "bg-gold-500/10 border-gold-500/30"
                          : "bg-white/5 border-transparent"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 flex justify-center">{getRankIcon(index)}</div>
                        <div>
                          <div className={`font-bold ${isWinner ? "text-gold-400" : "text-white"}`}>
                            {player.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                            {getRankLabel(index)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-lg">{player.score}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Points</div>
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
              <div className="p-4 bg-navy-900/30 border border-white/10 text-center">
                <div className="text-2xl font-bold text-white mb-1 font-mono">{totalQuestions}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Questions</div>
              </div>
              <div className="p-4 bg-navy-900/30 border border-white/10 text-center">
                <div className="text-2xl font-bold text-white mb-1 font-mono">{totalPlayers}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Players</div>
              </div>
              <div className="p-4 bg-navy-900/30 border border-white/10 text-center">
                <div className="text-2xl font-bold text-white mb-1 font-mono">{averageScore}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Avg Score</div>
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
                className="flex-1 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold py-6 rounded-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] transition-all"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                PLAY AGAIN
              </Button>
              <Button
                onClick={() => navigate("/mode")}
                className="flex-1 bg-navy-800 hover:bg-navy-700 text-white font-bold py-6 rounded-none border border-white/10 hover:border-white/30 transition-all"
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
