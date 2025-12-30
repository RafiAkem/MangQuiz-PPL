import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameResults } from "./GameResults";
import { useTriviaGame } from "../../lib/stores/useTriviaGame";
import { useAudio } from "../../lib/stores/useAudio";
import {
  CheckCircle,
  XCircle,
  Trophy,
  Zap,
  AlertCircle,
  Swords,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function LocalTriviaGame() {
  const {
    phase,
    questions,
    currentQuestionIndex,
    players,
    selectedAnswers,
    showAnswer,
    submitAnswer,
    showQuestionAnswer,
    nextQuestion,
    timeRemaining,
    questionTimeRemaining,
    updateTimer,
    updateQuestionTimer,
    settings
  } = useTriviaGame();

  const { playSuccess } = useAudio();

  // Handle phase transitions for sound effects
  useEffect(() => {
    if (phase === "final") {
      setTimeout(() => playSuccess(), 500);
    }
  }, [phase, playSuccess]);

  // Update timers
  useEffect(() => {
    if (phase !== "playing") return;

    const questionTimerInterval = setInterval(() => {
      updateQuestionTimer();
    }, 1000);

    const gameTimerInterval = setInterval(() => {
      updateTimer();
    }, 100);

    return () => {
      clearInterval(questionTimerInterval);
      clearInterval(gameTimerInterval);
    };
  }, [phase, updateQuestionTimer, updateTimer]);

  if (phase === "final") {
    return <GameResults />;
  }

  const currentQ = questions[currentQuestionIndex];
  if (!currentQ) return null;

  const allPlayersAnswered = players.every(
    (player) => selectedAnswers[player.id] !== undefined
  );

  const handleAnswerSelect = (playerId: string, answerIndex: number) => {
    if (showAnswer) return;
    submitAnswer(playerId, answerIndex);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
      case "medium": return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
      case "hard": return "text-red-400 border-red-400/30 bg-red-400/10";
      default: return "text-slate-400 border-slate-400/30 bg-slate-400/10";
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-gold-500/30 relative overflow-hidden flex flex-col">
      {/* Dither Noise & Grid */}
      <div className="fixed inset-0 dither-noise z-50 pointer-events-none mix-blend-overlay opacity-20" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <header className="relative z-40 border-b border-white/10 bg-navy-900/50 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gold-500 text-navy-950 flex items-center justify-center font-bold">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-none">Local Arena</h1>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                <span>ROUND {currentQuestionIndex + 1}/{questions.length}</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full" />
                <span className={`px-1.5 py-0.5 border ${getDifficultyColor(currentQ.difficulty || 'medium')} text-[10px] uppercase tracking-wider`}>
                  {currentQ.difficulty || 'MEDIUM'}
                </span>
              </div>
            </div>
          </div>

          {/* Timer Bar */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-blue-400">QUESTION TIME</span>
              <span className="text-white font-bold">{questionTimeRemaining}s</span>
            </div>
            <div className="h-2 bg-navy-800 w-full overflow-hidden border border-white/5">
              <motion.div
                key={currentQuestionIndex}
                initial={{ width: "100%" }}
                animate={{ width: `${(questionTimeRemaining / settings.questionTime) * 100}%` }}
                transition={{ duration: 0.3, ease: "linear" }}
                className={`h-full ${questionTimeRemaining <= 5 ? "bg-red-500" : "bg-blue-500"
                  }`}
              />
            </div>
          </div>

          {/* Top Player Stat (Mobile/Compact) */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">TOP SCORE</div>
              <div className="font-mono font-bold text-gold-400 text-lg">
                {Math.max(...players.map(p => p.score), 0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 grid lg:grid-cols-12 gap-8 relative z-10">

        {/* Left Column: Question & Answers */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          {/* Question Card */}
          <div className="sharp-card bg-navy-900/50 p-8 md:p-10 border border-white/10 relative overflow-hidden min-h-[240px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Zap className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-2 py-1 mb-4 text-xs font-mono text-gold-400 border border-gold-500/30 bg-gold-500/5">
                {currentQ.category}
              </span>
              <h2 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight">
                {currentQ.question}
              </h2>
            </div>
          </div>

          {/* Answer Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              {currentQ.options.map((option, idx) => {
                const isCorrect = idx === currentQ.correctAnswer;
                // Check if any player selected this
                const playersWhoSelected = players.filter(p => selectedAnswers[p.id] === idx);

                let stateStyles = "border-white/10 hover:border-white/30 hover:bg-white/5";
                let indicator = <span className="font-mono text-slate-500 opacity-50">{String.fromCharCode(65 + idx)}</span>;

                if (showAnswer) {
                  if (isCorrect) {
                    stateStyles = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
                    indicator = <CheckCircle className="w-5 h-5" />;
                  } else if (playersWhoSelected.length > 0) {
                    stateStyles = "border-red-500 bg-red-500/10 text-red-400";
                    indicator = <XCircle className="w-5 h-5" />;
                  } else {
                    stateStyles = "border-white/5 opacity-40";
                  }
                } else if (playersWhoSelected.length > 0) {
                  // In local mode, we might want to show who selected what even before reveal?
                  // Or keep it hidden? The original code showed selection.
                  // Let's show a neutral selection state.
                  stateStyles = "border-blue-500 bg-blue-500/10 text-blue-400";
                  indicator = <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
                }

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    <button
                      disabled={showAnswer}
                      onClick={() => {
                        // For local game, we need to know WHICH player is clicking.
                        // Since we can't easily detect that with a single click in a shared UI,
                        // we usually rely on the player buttons inside the card in the original design.
                        // BUT, to modernize, we can make the card clickable for the "current" player if turn-based,
                        // or keep the player buttons.
                        // The original design had buttons for EACH player inside the card.
                        // To keep the clean look, let's overlay player buttons when hovering or always visible?
                        // Or, better: Split the card interaction.
                        // Actually, the original design had a row of buttons for each player.
                        // Let's replicate that but cleaner.
                      }}
                      className={`
                        w-full relative p-6 text-left border transition-all duration-200 group h-full flex flex-col justify-between
                        ${stateStyles}
                        ${!showAnswer ? "hover:-translate-y-1 hover:shadow-lg" : ""}
                      `}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <span className="text-lg font-medium leading-snug">{option}</span>
                        <div className="shrink-0 mt-1">{indicator}</div>
                      </div>

                      {/* Player Selection Buttons (Only visible if not showAnswer) */}
                      {!showAnswer && (
                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
                          {players.map(player => {
                            const hasAnswered = selectedAnswers[player.id] !== undefined;
                            const selectedThis = selectedAnswers[player.id] === idx;

                            return (
                              <button
                                key={player.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnswerSelect(player.id, idx);
                                }}
                                disabled={hasAnswered}
                                className={`
                                  px-3 py-1 text-xs font-bold uppercase tracking-wider border transition-all
                                  ${selectedThis
                                    ? "bg-gold-500 text-navy-950 border-gold-500"
                                    : "border-white/20 text-slate-400 hover:border-white/40 hover:text-white"
                                  }
                                  ${hasAnswered && !selectedThis ? "opacity-20 cursor-not-allowed" : ""}
                                `}
                              >
                                {player.name}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Player Avatars (Visible if showAnswer) */}
                      {showAnswer && playersWhoSelected.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
                          {playersWhoSelected.map(p => (
                            <span key={p.id} className="text-xs font-bold text-white bg-white/10 px-2 py-1">
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Corner Accent */}
                      <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors ${playersWhoSelected.length > 0 || (showAnswer && isCorrect) ? "border-current" : "border-transparent group-hover:border-white/30"
                        }`} />
                      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors ${playersWhoSelected.length > 0 || (showAnswer && isCorrect) ? "border-current" : "border-transparent group-hover:border-white/30"
                        }`} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex justify-center mt-8">
            {!showAnswer && (allPlayersAnswered || players.length === 0) && (
              <Button
                onClick={showQuestionAnswer}
                className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-8 py-6 text-lg rounded-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] transition-all"
              >
                REVEAL ANSWER
              </Button>
            )}

            {showAnswer && (
              <Button
                onClick={nextQuestion}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-6 text-lg rounded-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] transition-all flex items-center gap-2"
              >
                {currentQuestionIndex < questions.length - 1 ? "NEXT QUESTION" : "VIEW RESULTS"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>

          {showAnswer && currentQ.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-navy-900/50 border border-white/10 p-6"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gold-400 mb-1 text-sm uppercase tracking-wider">Did you know?</h4>
                  <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          {/* Leaderboard */}
          <div className="bg-navy-900/30 border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
              <Trophy className="w-4 h-4 text-gold-400" />
              <h3 className="font-bold text-sm tracking-wider">LEADERBOARD</h3>
            </div>
            <div className="space-y-3">
              {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 border border-white/5 bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs text-slate-500 w-4">#{i + 1}</div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">
                        {p.name}
                      </span>
                      {/* Progress bar for this player */}
                      <div className="w-20 h-1 bg-navy-950 mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-slate-600"
                          style={{ width: `${Math.min((p.score / (questions.length * 100)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-sm">
                    {p.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-navy-900/30 border border-white/10 p-6">
            <h3 className="font-bold text-sm tracking-wider mb-4 text-slate-400">MATCH STATS</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 border border-white/5 text-center">
                <div className="text-xs text-slate-500 mb-1">PLAYERS</div>
                <div className="font-mono font-bold text-lg">{players.length}</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 text-center">
                <div className="text-xs text-slate-500 mb-1">QUESTIONS</div>
                <div className="font-mono font-bold text-lg">{questions.length}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
