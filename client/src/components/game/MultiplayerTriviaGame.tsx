import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MultiplayerGameResults } from "./MultiplayerGameResults";
import { OneVsOneResults } from "./OneVsOneResults";
import { useWebSocket } from "../../lib/contexts/WebSocketContext";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Trophy,
  Zap,
  Eye,
  AlertCircle,
  Swords
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MultiplayerTriviaGameProps {
  playerId?: string;
  players?: any[];
}

export function MultiplayerTriviaGame({
  playerId,
  players,
}: MultiplayerTriviaGameProps) {
  const location = useLocation();
  const { wsRef } = useWebSocket();
  const [mpState, setMpState] = useState<any>(null);
  const [resolvedPlayerId, setResolvedPlayerId] = useState<string | undefined>(
    playerId
  );
  const [pressureAlert, setPressureAlert] = useState<string | null>(null);
  
  // Get 1v1 mode flag and roomId from location state
  const is1v1 = location.state?.is1v1 || false;
  const roomId = location.state?.roomId;

  // Always use playerId from localStorage for robust identification
  useEffect(() => {
    const storedPlayerId = localStorage.getItem("quizRushPlayerId");

    if (storedPlayerId) {
      setResolvedPlayerId(storedPlayerId);
    } else if (playerId) {
      setResolvedPlayerId(playerId);
    }
  }, [playerId]);

  // Listen for multiplayer game state updates
  useEffect(() => {
    if (!wsRef?.current) return;
    const ws = wsRef.current;
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "game_state") {
        setMpState(data.state);
        // Clear pressure alert when moving to new question
        if (data.state?.phase === "playing" && !data.state?.answers?.[resolvedPlayerId || ""]) {
          setPressureAlert(null);
        }
      }
      if (data.type === "game_end") {
        setMpState((prev: any) => ({ ...prev, phase: "final" }));
      }
      if (data.type === "player_answered") {
        setPressureAlert(`${data.playerName} answered! Hurry up!`);
        setTimeout(() => setPressureAlert(null), 3000);
      }
    };
    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [wsRef, resolvedPlayerId]);

  // Send answer to server in multiplayer
  const handleAnswer = (answer: string) => {
    if (!wsRef?.current || !mpState || !resolvedPlayerId || mpState.phase !== "playing") {
      return;
    }

    if (mpState.answers?.[resolvedPlayerId]) {
      return;
    }

    const message = {
      type: "answer",
      answer,
      playerId: resolvedPlayerId,
    };

    try {
      wsRef.current.send(JSON.stringify(message));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
      case "medium": return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
      case "hard": return "text-red-400 border-red-400/30 bg-red-400/10";
      default: return "text-slate-400 border-slate-400/30 bg-slate-400/10";
    }
  };

  if (!mpState) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 dither-noise opacity-20 pointer-events-none" />
        <div className="relative z-10 text-center space-y-6 p-12 border border-white/10 bg-navy-900/80 backdrop-blur-md max-w-md w-full mx-4">
          <div className="w-16 h-16 mx-auto border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Waiting for Host</h2>
            <p className="text-slate-400 font-mono text-sm">The battle will begin shortly...</p>
          </div>
        </div>
      </div>
    );
  }

  if (mpState.phase === "final") {
    // Use 1v1 specific result screen for 1v1 mode
    if (is1v1) {
      return (
        <OneVsOneResults
          gameState={mpState}
          players={players || []}
          playerId={resolvedPlayerId}
          roomId={roomId}
        />
      );
    }
    return (
      <MultiplayerGameResults
        gameState={mpState}
        players={players || []}
        playerId={resolvedPlayerId}
      />
    );
  }

  const currentQ = mpState.questions[mpState.questionIndex];
  const hasAnswered = resolvedPlayerId ? !!mpState.answers?.[resolvedPlayerId] : false;
  const totalAnswered = Object.keys(mpState.answers || {}).length;
  const isRevealPhase = mpState.phase === "reveal";
  const isPlayingPhase = mpState.phase === "playing";
  const correctAnswer = currentQ.answer;

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
              <h1 className="font-bold text-lg tracking-tight leading-none">Multiplayer Arena</h1>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                <span>ROUND {mpState.questionIndex + 1}/{mpState.questions.length}</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full" />
                <span className={`px-1.5 py-0.5 border ${getDifficultyColor(currentQ.difficulty)} text-[10px] uppercase tracking-wider`}>
                  {currentQ.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Timer Bar */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className={isPlayingPhase ? "text-blue-400" : "text-purple-400"}>
                {isPlayingPhase ? "TIME REMAINING" : "NEXT ROUND"}
              </span>
              <span className="text-white font-bold">
                {isPlayingPhase ? mpState.questionTimeRemaining : mpState.revealTimeRemaining}s
              </span>
            </div>
            <div className="h-2 bg-navy-800 w-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: "100%" }}
                animate={{
                  width: isPlayingPhase
                    ? `${((mpState.questionTimeRemaining ?? 0) / 20) * 100}%`
                    : `${((mpState.revealTimeRemaining ?? 0) / 5) * 100}%`
                }}
                transition={{ duration: 0.5, ease: "linear" }}
                className={`h-full ${isPlayingPhase
                    ? (mpState.questionTimeRemaining ?? 0) < 5 ? "bg-red-500" : "bg-blue-500"
                    : "bg-purple-500"
                  }`}
              />
            </div>
          </div>

          {/* Player Stat (Mobile/Compact) */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">YOUR SCORE</div>
              <div className="font-mono font-bold text-gold-400 text-lg">
                {resolvedPlayerId && mpState.scores?.[resolvedPlayerId] ? mpState.scores[resolvedPlayerId] : 0}
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
              {currentQ.options.map((option: string, idx: number) => {
                const isSelected = resolvedPlayerId && mpState.answers?.[resolvedPlayerId] === option;
                const isCorrect = option === correctAnswer;

                let stateStyles = "border-white/10 hover:border-white/30 hover:bg-white/5";
                let indicator = <span className="font-mono text-slate-500 opacity-50">{String.fromCharCode(65 + idx)}</span>;

                if (isRevealPhase) {
                  if (isCorrect) {
                    stateStyles = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
                    indicator = <CheckCircle className="w-5 h-5" />;
                  } else if (isSelected) {
                    stateStyles = "border-red-500 bg-red-500/10 text-red-400";
                    indicator = <XCircle className="w-5 h-5" />;
                  } else {
                    stateStyles = "border-white/5 opacity-40";
                  }
                } else if (hasAnswered) {
                  if (isSelected) {
                    stateStyles = "border-blue-500 bg-blue-500/10 text-blue-400";
                    indicator = <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
                  } else {
                    stateStyles = "border-white/5 opacity-40";
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    disabled={hasAnswered || isRevealPhase}
                    onClick={() => handleAnswer(option)}
                    className={`
                      relative p-6 text-left border transition-all duration-200 group
                      ${stateStyles}
                      ${!hasAnswered && !isRevealPhase ? "hover:-translate-y-1 hover:shadow-lg active:translate-y-0" : ""}
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-lg font-medium leading-snug">{option}</span>
                      <div className="shrink-0 mt-1">{indicator}</div>
                    </div>

                    {/* Corner Accent */}
                    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors ${isSelected || (isRevealPhase && isCorrect) ? "border-current" : "border-transparent group-hover:border-white/30"
                      }`} />
                    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors ${isSelected || (isRevealPhase && isCorrect) ? "border-current" : "border-transparent group-hover:border-white/30"
                      }`} />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pressure Alert */}
          <AnimatePresence>
            {pressureAlert && !hasAnswered && isPlayingPhase && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="bg-red-500/20 border-2 border-red-500 p-4 flex items-center justify-center gap-3 text-red-400 animate-pulse"
              >
                <Zap className="w-5 h-5 animate-bounce" />
                <span className="font-bold text-lg uppercase tracking-wider">{pressureAlert}</span>
                <Zap className="w-5 h-5 animate-bounce" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Waiting / Result Message */}
          {isPlayingPhase && hasAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-blue-500/10 border border-blue-500/30 p-4 flex items-center justify-center gap-3 text-blue-300"
            >
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-sm">WAITING FOR OPPONENTS ({totalAnswered}/{players?.length})</span>
            </motion.div>
          )}

          {isRevealPhase && currentQ.explanation && (
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
              <h3 className="font-bold text-sm tracking-wider">LIVE RANKINGS</h3>
            </div>
            <div className="space-y-3">
              {players?.sort((a, b) => (mpState.scores?.[b.id] || 0) - (mpState.scores?.[a.id] || 0)).map((p: any, i) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 border transition-colors ${p.id === resolvedPlayerId
                      ? "bg-gold-500/10 border-gold-500/30"
                      : "bg-white/5 border-transparent"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs text-slate-500 w-4">#{i + 1}</div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${p.id === resolvedPlayerId ? "text-gold-400" : "text-white"}`}>
                        {p.name} {p.id === resolvedPlayerId && "(YOU)"}
                      </span>
                      {/* Progress bar for this player */}
                      <div className="w-20 h-1 bg-navy-950 mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-slate-600"
                          style={{ width: `${Math.min(((mpState.scores?.[p.id] || 0) / (mpState.questions.length * 100)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-sm">
                    {mpState.scores?.[p.id] || 0}
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
                <div className="font-mono font-bold text-lg">{players?.length}</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 text-center">
                <div className="text-xs text-slate-500 mb-1">ANSWERED</div>
                <div className="font-mono font-bold text-lg">{totalAnswered}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
