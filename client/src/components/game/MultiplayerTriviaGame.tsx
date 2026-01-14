import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MultiplayerGameResults } from "./MultiplayerGameResults";
import { OneVsOneResults } from "./OneVsOneResults";
import { useWebSocket } from "../../lib/contexts/WebSocketContext";
import {
  CheckCircle,
  XCircle,
  Trophy,
  Zap,
  AlertCircle,
  Swords
} from "lucide-react";

interface MultiplayerTriviaGameProps {
  playerId?: string;
  players?: any[];
}

export function MultiplayerTriviaGame({
  playerId,
  players: initialPlayers,
}: MultiplayerTriviaGameProps) {
  const location = useLocation();
  const { wsRef } = useWebSocket();
  const [mpState, setMpState] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>(initialPlayers || []);
  const [resolvedPlayerId, setResolvedPlayerId] = useState<string | undefined>(
    playerId
  );
  const [pressureAlert, setPressureAlert] = useState<string | null>(null);

  // Get 1v1 mode flag and roomId from location state
  const is1v1 = location.state?.is1v1 || false;
  const isRanked = location.state?.isRanked || false;
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
      // Handle ranked/server-initiated game flow
      if (data.type === "countdown_started" || data.type === "game_started") {
        if (data.players && data.players.length > 0) {
          setPlayers(data.players);
        }
      }
      // Handle ranked result
      if (data.type === "ranked_result") {
        // Store the ranked result for display
        setMpState((prev: any) => ({
          ...prev,
          rankedResult: {
            matchId: data.matchId,
            winnerId: data.winnerId,
            mmrChange: data.mmrChange,
            newMmr: data.newMmr,
            newTier: data.newTier,
            isWinner: data.isWinner
          }
        }));
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
      case "easy": return "text-[#CCFF00] border-[#CCFF00] bg-[#CCFF00]/10";
      case "medium": return "text-[#0022FF] border-[#0022FF] bg-[#0022FF]/10";
      case "hard": return "text-[#FF4D4D] border-[#FF4D4D] bg-[#FF4D4D]/10";
      default: return "text-[#0D0D0D]/50 border-[#0D0D0D]/50 bg-[#0D0D0D]/5";
    }
  };

  if (!mpState) {
    return (
      <div className="min-h-screen bg-[#F2F0E9] flex items-center justify-center relative overflow-hidden">
        <div className="relative z-10 text-center space-y-6 p-12 border-2 border-[#0D0D0D] bg-white shadow-[8px_8px_0px_0px_#0D0D0D] max-w-md w-full mx-4">
          <div className="w-16 h-16 mx-auto border-4 border-[#0022FF] border-t-transparent animate-spin" />
          <div>
            <h2 className="text-2xl font-black uppercase text-[#0D0D0D] mb-2 tracking-tight font-display">Waiting for Host</h2>
            <p className="text-[#0D0D0D]/60 font-mono text-sm">The battle will begin shortly...</p>
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
          isRanked={isRanked}
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
    <div className="min-h-screen bg-[#F2F0E9] text-[#0D0D0D] font-sans selection:bg-[#CCFF00] relative overflow-hidden flex flex-col">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(90deg,#0D0D0D_1px,transparent_1px),linear-gradient(#0D0D0D_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      {/* Header */}
      <header className="relative z-40 border-b-2 border-[#0D0D0D] bg-white">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0022FF] text-white border-2 border-[#0D0D0D] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_#0D0D0D]">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight leading-none uppercase font-display">Multiplayer Arena</h1>
              <div className="flex items-center gap-2 text-xs font-mono text-[#0D0D0D]/60 mt-1">
                <span>ROUND {mpState.questionIndex + 1}/{mpState.questions.length}</span>
                <span className="w-1 h-1 bg-[#0D0D0D]/30" />
                <span className={`px-1.5 py-0.5 border-2 ${getDifficultyColor(currentQ.difficulty)} text-[10px] uppercase tracking-wider font-bold`}>
                  {currentQ.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Timer Bar */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className={`font-bold uppercase ${isPlayingPhase ? "text-[#0022FF]" : "text-[#CCFF00]"}`}>
                {isPlayingPhase ? "TIME REMAINING" : "NEXT ROUND"}
              </span>
              <span className="text-[#0D0D0D] font-bold">
                {isPlayingPhase ? mpState.questionTimeRemaining : mpState.revealTimeRemaining}s
              </span>
            </div>
            <div className="h-3 bg-[#F2F0E9] w-full overflow-hidden border-2 border-[#0D0D0D]">
              <motion.div
                initial={{ width: "100%" }}
                animate={{
                  width: isPlayingPhase
                    ? `${((mpState.questionTimeRemaining ?? 0) / 20) * 100}%`
                    : `${((mpState.revealTimeRemaining ?? 0) / 5) * 100}%`
                }}
                transition={{ duration: 0.5, ease: "linear" }}
                className={`h-full ${isPlayingPhase
                  ? (mpState.questionTimeRemaining ?? 0) < 5 ? "bg-[#FF4D4D]" : "bg-[#0022FF]"
                  : "bg-[#CCFF00]"
                  }`}
              />
            </div>
          </div>

          {/* Player Stat */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-[#0D0D0D]/60 font-mono uppercase">YOUR SCORE</div>
              <div className="font-mono font-bold text-[#CCFF00] text-lg bg-[#0D0D0D] px-2 py-0.5 border-2 border-[#0D0D0D] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
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
          <div className="bg-white p-8 md:p-10 border-2 border-[#0D0D0D] shadow-[6px_6px_0px_0px_#0D0D0D] relative overflow-hidden min-h-[240px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Zap className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-mono font-bold uppercase tracking-wider text-[#0022FF] border-2 border-[#0022FF] bg-[#0022FF]/5">
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
              {currentQ.options.map((option: string, idx: number) => {
                const isSelected = resolvedPlayerId && mpState.answers?.[resolvedPlayerId] === option;
                const isCorrect = option === correctAnswer;

                let stateStyles = "border-[#0D0D0D] bg-white hover:bg-[#F2F0E9] hover:shadow-[4px_4px_0px_0px_#0D0D0D] hover:-translate-y-1 hover:-translate-x-1";
                let indicator = <span className="font-mono text-[#0D0D0D]/40 font-bold">{String.fromCharCode(65 + idx)}</span>;

                if (isRevealPhase) {
                  if (isCorrect) {
                    stateStyles = "border-[#0D0D0D] bg-[#CCFF00] text-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D]";
                    indicator = <CheckCircle className="w-5 h-5" />;
                  } else if (isSelected) {
                    stateStyles = "border-[#0D0D0D] bg-[#FF4D4D] text-white shadow-[4px_4px_0px_0px_#0D0D0D]";
                    indicator = <XCircle className="w-5 h-5" />;
                  } else {
                    stateStyles = "border-[#0D0D0D]/20 opacity-40 bg-[#F2F0E9]";
                  }
                } else if (hasAnswered) {
                  if (isSelected) {
                    stateStyles = "border-[#0D0D0D] bg-[#0022FF] text-white shadow-[4px_4px_0px_0px_#0D0D0D]";
                    indicator = <div className="w-3 h-3 bg-white border border-[#0D0D0D] animate-pulse" />;
                  } else {
                    stateStyles = "border-[#0D0D0D]/20 opacity-40 bg-[#F2F0E9]";
                  }
                }

                // Interaction classes
                const isInteractive = !hasAnswered && !isRevealPhase;
                const interactionClasses = isInteractive
                  ? "cursor-pointer group"
                  : "cursor-default";

                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    disabled={hasAnswered || isRevealPhase}
                    onClick={() => handleAnswer(option)}
                    className={`
                      relative p-6 text-left border-2 transition-all duration-200
                      ${isRevealPhase || hasAnswered ? stateStyles : "border-[#0D0D0D] bg-white hover:bg-[#F2F0E9] hover:shadow-[4px_4px_0px_0px_#0D0D0D] hover:-translate-y-[2px] hover:-translate-x-[2px]"}
                      ${interactionClasses}
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-lg font-bold leading-snug font-body">{option}</span>
                      <div className="shrink-0 mt-1">{indicator}</div>
                    </div>
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
                className="bg-[#FF4D4D] border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] p-4 flex items-center justify-center gap-3 text-white"
              >
                <Zap className="w-5 h-5 animate-bounce" />
                <span className="font-black text-lg uppercase tracking-wider font-display">{pressureAlert}</span>
                <Zap className="w-5 h-5 animate-bounce" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Waiting / Result Message */}
          {isPlayingPhase && hasAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-[#0022FF]/10 border-2 border-[#0022FF] p-4 flex items-center justify-center gap-3 text-[#0022FF]"
            >
              <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin" />
              <span className="font-mono font-bold text-sm uppercase">WAITING FOR OPPONENTS ({totalAnswered}/{players?.length})</span>
            </motion.div>
          )}

          {isRevealPhase && currentQ.explanation && (
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
              <Trophy className="w-4 h-4 text-[#CCFF00] fill-current stroke-[#0D0D0D]" />
              <h3 className="font-black text-sm tracking-wider uppercase font-display">LIVE RANKINGS</h3>
            </div>
            <div className="space-y-3">
              {players?.sort((a, b) => (mpState.scores?.[b.id] || 0) - (mpState.scores?.[a.id] || 0)).map((p: any, i) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 border-2 transition-colors ${p.id === resolvedPlayerId
                    ? "bg-[#CCFF00] border-[#0D0D0D]"
                    : "bg-[#F2F0E9] border-[#0D0D0D]/10"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs text-[#0D0D0D]/50 w-4 font-bold">#{i + 1}</div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold font-display uppercase ${p.id === resolvedPlayerId ? "text-[#0D0D0D]" : "text-[#0D0D0D]"}`}>
                        {p.name} {p.id === resolvedPlayerId && "(YOU)"}
                      </span>
                      {/* Progress bar for this player */}
                      <div className="w-20 h-1.5 bg-white border border-[#0D0D0D]/20 mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-[#0022FF]"
                          style={{ width: `${Math.min(((mpState.scores?.[p.id] || 0) / (mpState.questions.length * 100)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={`font-mono font-bold text-sm ${p.id === resolvedPlayerId ? "text-[#0D0D0D]" : "bg-[#0D0D0D] text-white px-2 py-1"}`}>
                    {mpState.scores?.[p.id] || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] p-6">
            <h3 className="font-black text-sm tracking-wider mb-4 text-[#0D0D0D]/60 uppercase font-display">MATCH STATS</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#F2F0E9] border-2 border-[#0D0D0D]/10 text-center">
                <div className="text-xs text-[#0D0D0D]/50 mb-1 font-mono uppercase">PLAYERS</div>
                <div className="font-mono font-bold text-lg text-[#0D0D0D]">{players?.length}</div>
              </div>
              <div className="p-3 bg-[#F2F0E9] border-2 border-[#0D0D0D]/10 text-center">
                <div className="text-xs text-[#0D0D0D]/50 mb-1 font-mono uppercase">ANSWERED</div>
                <div className="font-mono font-bold text-lg text-[#0D0D0D]">{totalAnswered}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
