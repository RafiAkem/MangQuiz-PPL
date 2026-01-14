import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameResults } from "./GameResults";
import { useTriviaGame } from "../../lib/stores/useTriviaGame";
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
      case "easy": return "text-[#CCFF00] border-[#CCFF00] bg-[#CCFF00]/10";
      case "medium": return "text-[#0022FF] border-[#0022FF] bg-[#0022FF]/10";
      case "hard": return "text-[#FF4D4D] border-[#FF4D4D] bg-[#FF4D4D]/10";
      default: return "text-[#0D0D0D]/50 border-[#0D0D0D]/50 bg-[#0D0D0D]/5";
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#0D0D0D] font-sans relative overflow-hidden flex flex-col">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Header */}
      <header className="relative z-40 border-b-2 border-[#0D0D0D] bg-white">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0022FF] text-white border-2 border-[#0D0D0D] flex items-center justify-center font-bold">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight leading-none uppercase font-display">Local Arena</h1>
              <div className="flex items-center gap-2 text-xs font-mono text-[#0D0D0D]/60 mt-1">
                <span>ROUND {currentQuestionIndex + 1}/{questions.length}</span>
                <span className="w-1 h-1 bg-[#0D0D0D]/30 rounded-full" />
                <span className={`px-1.5 py-0.5 border-2 ${getDifficultyColor(currentQ.difficulty || 'medium')} text-[10px] uppercase tracking-wider font-bold`}>
                  {currentQ.difficulty || 'MEDIUM'}
                </span>
              </div>
            </div>
          </div>

          {/* Timer Bar */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-[#0022FF] font-bold uppercase">Question Time</span>
              <span className="text-[#0D0D0D] font-bold">{questionTimeRemaining}s</span>
            </div>
            <div className="h-3 bg-[#F2F0E9] w-full overflow-hidden border-2 border-[#0D0D0D]">
              <motion.div
                key={currentQuestionIndex}
                initial={{ width: "100%" }}
                animate={{ width: `${(questionTimeRemaining / settings.questionTime) * 100}%` }}
                transition={{ duration: 0.3, ease: "linear" }}
                className={`h-full ${questionTimeRemaining <= 5 ? "bg-[#FF4D4D]" : "bg-[#0022FF]"
                  }`}
              />
            </div>
          </div>

          {/* Top Player Stat */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-[#0D0D0D]/60 font-mono uppercase">Top Score</div>
              <div className="font-mono font-bold text-[#CCFF00] text-lg bg-[#0D0D0D] px-2 py-0.5 border-2 border-[#0D0D0D]">
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
          <div className="bg-white p-8 md:p-10 border-2 border-[#0D0D0D] shadow-[6px_6px_0px_0px_#0D0D0D] relative overflow-hidden min-h-[240px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Zap className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-mono uppercase tracking-wider text-[#0022FF] border-2 border-[#0022FF] bg-[#0022FF]/5 font-bold">
                {currentQ.category}
              </span>
              <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight font-display uppercase">
                {currentQ.question}
              </h2>
            </div>
          </div>

          {/* Answer Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              {currentQ.options.map((option, idx) => {
                const isCorrect = idx === currentQ.correctAnswer;
                const playersWhoSelected = players.filter(p => selectedAnswers[p.id] === idx);

                let stateStyles = "border-[#0D0D0D] bg-white hover:bg-[#F2F0E9] hover:shadow-[4px_4px_0px_0px_#0D0D0D]";
                let indicator = <span className="font-mono text-[#0D0D0D]/40 font-bold">{String.fromCharCode(65 + idx)}</span>;

                if (showAnswer) {
                  if (isCorrect) {
                    stateStyles = "border-[#0D0D0D] bg-[#CCFF00] text-[#0D0D0D]";
                    indicator = <CheckCircle className="w-5 h-5 text-[#0D0D0D]" />;
                  } else if (playersWhoSelected.length > 0) {
                    stateStyles = "border-[#0D0D0D] bg-[#FF4D4D] text-white";
                    indicator = <XCircle className="w-5 h-5" />;
                  } else {
                    stateStyles = "border-[#0D0D0D]/30 bg-white/50 opacity-40";
                  }
                } else if (playersWhoSelected.length > 0) {
                  stateStyles = "border-[#0022FF] bg-[#0022FF]/10 text-[#0022FF]";
                  indicator = <div className="w-2 h-2 bg-[#0022FF] rounded-full animate-pulse" />;
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
                      className={`
                        w-full relative p-6 text-left border-2 transition-all duration-200 group h-full flex flex-col justify-between
                        ${stateStyles}
                        ${!showAnswer ? "hover:-translate-y-1" : ""}
                      `}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <span className="text-lg font-bold leading-snug font-body">{option}</span>
                        <div className="shrink-0 mt-1">{indicator}</div>
                      </div>

                      {/* Player Selection Buttons */}
                      {!showAnswer && (
                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t-2 border-[#0D0D0D]/10">
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
                                  px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 transition-all
                                  ${selectedThis
                                    ? "bg-[#CCFF00] text-[#0D0D0D] border-[#0D0D0D]"
                                    : "border-[#0D0D0D]/30 text-[#0D0D0D]/60 hover:border-[#0D0D0D] hover:text-[#0D0D0D]"
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

                      {/* Player Avatars (when answer is shown) */}
                      {showAnswer && playersWhoSelected.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t-2 border-current/20">
                          {playersWhoSelected.map(p => (
                            <span key={p.id} className="text-xs font-bold bg-[#0D0D0D] text-white px-2 py-1">
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}
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
                className="bg-[#CCFF00] hover:bg-[#CCFF00]/90 text-[#0D0D0D] font-black uppercase tracking-wide px-8 py-6 text-lg border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                REVEAL ANSWER
              </Button>
            )}

            {showAnswer && (
              <Button
                onClick={nextQuestion}
                className="bg-[#0022FF] hover:bg-[#0022FF]/90 text-white font-black uppercase tracking-wide px-8 py-6 text-lg border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center gap-2"
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
              className="bg-white border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] p-6"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#0022FF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-[#0022FF] mb-1 text-sm uppercase tracking-wider font-display">Did you know?</h4>
                  <p className="text-[#0D0D0D]/80 leading-relaxed font-body">{currentQ.explanation}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          {/* Leaderboard */}
          <div className="bg-white border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-[#0D0D0D]/10">
              <Trophy className="w-4 h-4 text-[#CCFF00]" />
              <h3 className="font-black text-sm tracking-wider uppercase font-display">Leaderboard</h3>
            </div>
            <div className="space-y-3">
              {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 border-2 border-[#0D0D0D]/10 bg-[#F2F0E9] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs text-[#0D0D0D]/50 w-4 font-bold">#{i + 1}</div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#0D0D0D] font-display uppercase">
                        {p.name}
                      </span>
                      {/* Progress bar */}
                      <div className="w-20 h-1.5 bg-[#0D0D0D]/10 mt-1.5 overflow-hidden border border-[#0D0D0D]/10">
                        <div
                          className="h-full bg-[#0022FF]"
                          style={{ width: `${Math.min((p.score / (questions.length * 100)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-sm bg-[#0D0D0D] text-white px-2 py-1">
                    {p.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] p-6">
            <h3 className="font-black text-sm tracking-wider mb-4 text-[#0D0D0D]/60 uppercase font-display">Match Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#F2F0E9] border-2 border-[#0D0D0D]/10 text-center">
                <div className="text-xs text-[#0D0D0D]/50 mb-1 font-mono uppercase">Players</div>
                <div className="font-mono font-bold text-lg">{players.length}</div>
              </div>
              <div className="p-3 bg-[#F2F0E9] border-2 border-[#0D0D0D]/10 text-center">
                <div className="text-xs text-[#0D0D0D]/50 mb-1 font-mono uppercase">Questions</div>
                <div className="font-mono font-bold text-lg">{questions.length}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
