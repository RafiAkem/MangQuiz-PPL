import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, History, Play, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";
import { useWebSocket } from "../lib/contexts/WebSocketContext";
import { toast } from "sonner";

type UserStats = {
  mmr: number;
  rankTier: string;
  wins: number;
  losses: number;
  winStreak: number;
};

export default function RankedDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wsRef } = useWebSocket();
  const [isQueuing, setIsQueuing] = useState(false);
  const [queueTime, setQueueTime] = useState(0);

  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isQueuing) {
      interval = setInterval(() => setQueueTime((t) => t + 1), 1000);
    } else {
      setQueueTime(0);
    }
    return () => clearInterval(interval);
  }, [isQueuing]);

  // Listen for match found
  useEffect(() => {
    const socket = wsRef.current;
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "match_found") {
        setIsQueuing(false);
        // Store playerId in localStorage for MultiplayerTriviaGame
        localStorage.setItem("quizRushPlayerId", data.playerId);
        navigate("/multiplayer-game", { 
          state: { 
            roomId: data.roomId,
            playerId: data.playerId,
            opponent: data.opponent,
            isRanked: true,
            is1v1: true // Ranked is always 1v1
          } 
        });
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [wsRef, navigate]);

  const toggleQueue = () => {
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || !user) {
      if (socket?.readyState !== WebSocket.OPEN) {
        toast.error("Connecting to server... please try again in a moment.");
      }
      return;
    }

    if (isQueuing) {
      socket.send(JSON.stringify({ type: "leave_ranked_queue", userId: user.id }));
      setIsQueuing(false);
    } else {
      socket.send(JSON.stringify({ 
        type: "join_ranked_queue", 
        userId: user.id,
        username: user.username 
      }));
      setIsQueuing(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F2F0E9] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#0022FF]" />
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    PLASTIC: "bg-gray-400",
    CONCRETE: "bg-stone-600",
    ALUMINUM: "bg-slate-200",
    CHROME: "bg-[#CCFF00]",
    NEON: "bg-[#FF4D4D]",
    ETHER: "bg-[#0022FF]",
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9] p-6 md:p-12 font-mono overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#0D0D0D_1px,transparent_1px),linear-gradient(#0D0D0D_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <button
          onClick={() => navigate("/mode")}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-8 hover:text-[#0022FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit to Modes
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Player Profile Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#0D0D0D] p-1 border-4 border-[#0D0D0D] shadow-[8px_8px_0px_0px_#FF4D4D]">
              <div className="bg-[#F2F0E9] border-2 border-[#0D0D0D] p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className={`w-32 h-32 md:w-48 md:h-48 border-4 border-[#0D0D0D] shadow-[8px_8px_0px_0px_#0D0D0D] flex items-center justify-center text-6xl md:text-8xl font-black ${tierColors[stats?.rankTier || "PLASTIC"]}`}>
                    {stats?.rankTier?.[0] || "P"}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-2">
                      {user?.username}
                    </h2>
                    <div className="inline-block bg-[#0D0D0D] text-[#CCFF00] px-4 py-1 text-xl font-black uppercase italic mb-4">
                      {stats?.rankTier} TIER
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-500">Current MMR</p>
                        <p className="text-2xl font-black tracking-tighter">{stats?.mmr}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-500">Win Rate</p>
                        <p className="text-2xl font-black tracking-tighter">
                          {stats?.wins ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) : 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-500">Win Streak</p>
                        <p className="text-2xl font-black tracking-tighter text-[#FF4D4D]">{stats?.winStreak} 🔥</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate("/leaderboard")}
                className="bg-[#0022FF] text-[#F2F0E9] border-4 border-[#0D0D0D] p-6 shadow-[6px_6px_0px_0px_#0D0D0D] flex items-center justify-between group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <div className="text-left">
                  <h4 className="text-xl font-black uppercase italic">Leaderboard</h4>
                  <p className="text-xs font-bold opacity-70">View top 50 global</p>
                </div>
                <Trophy className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              </button>
              <button className="bg-[#CCFF00] text-[#0D0D0D] border-4 border-[#0D0D0D] p-6 shadow-[6px_6px_0px_0px_#0D0D0D] flex items-center justify-between group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <div className="text-left">
                  <h4 className="text-xl font-black uppercase italic">History</h4>
                  <p className="text-xs font-bold opacity-70">Review past battles</p>
                </div>
                <History className="w-8 h-8 group-hover:-rotate-12 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right: Queue Area */}
          <div className="space-y-8">
            <div className="bg-[#F2F0E9] border-4 border-[#0D0D0D] p-8 shadow-[8px_8px_0px_0px_#0D0D0D] flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
              <AnimatePresence mode="wait">
                {isQueuing ? (
                  <motion.div
                    key="queuing"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="flex flex-col items-center text-center relative z-10"
                  >
                    <div className="w-24 h-24 border-8 border-t-[#0022FF] border-[#0D0D0D] animate-spin mb-8" />
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-2">Searching...</h3>
                    <p className="text-6xl font-black mb-8 tabular-nums">
                      {Math.floor(queueTime / 60)}:{String(queueTime % 60).padStart(2, "0")}
                    </p>
                    <button
                      onClick={toggleQueue}
                      className="bg-[#FF4D4D] text-[#F2F0E9] px-8 py-3 border-4 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] font-black uppercase italic hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      Cancel Search
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-center relative z-10"
                  >
                    <div className="w-32 h-32 bg-[#FF4D4D] border-4 border-[#0D0D0D] shadow-[8px_8px_0px_0px_#0D0D0D] flex items-center justify-center mb-8">
                      <Play className="w-16 h-16 text-[#F2F0E9] fill-current" />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-4">Ready for War?</h3>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8 max-w-[200px]">
                      Win matches to gain LP and climb the tiers.
                    </p>
                    <button
                      onClick={toggleQueue}
                      className="bg-[#CCFF00] text-[#0D0D0D] px-12 py-4 border-4 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] font-black text-xl uppercase italic hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      Find Match
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Background Scanline Effect */}
              {isQueuing && (
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_0%,rgba(0,34,255,0.05)_50%,transparent_100%)] bg-[length:100%_4px] animate-scanline" />
              )}
            </div>

            <div className="bg-[#0D0D0D] text-[#F2F0E9] p-4 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
              NOTICE: Ranked matches follow strict rules. Disconnecting counts as a loss. Play fair or be banned.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
