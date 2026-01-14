import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Trophy, Crown, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { getQueryFn } from "../lib/queryClient";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  mmr: number;
  tier: string;
  wins: number;
  losses: number;
  winStreak: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

const TIER_COLORS: Record<string, string> = {
  PLASTIC: "bg-gray-500",
  CONCRETE: "bg-stone-500",
  ALUMINUM: "bg-slate-400",
  CHROME: "bg-[#CCFF00]",
  NEON: "bg-[#FF4D4D]",
  ETHER: "bg-[#0022FF]",
};

const TIER_TEXT_COLORS: Record<string, string> = {
  PLASTIC: "text-white",
  CONCRETE: "text-white",
  ALUMINUM: "text-black",
  CHROME: "text-black",
  NEON: "text-white",
  ETHER: "text-white",
};

export default function LeaderboardPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<LeaderboardResponse>({
    queryKey: ["/api/leaderboard"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-12 h-12 bg-[#CCFF00] border-4 border-[#0D0D0D] flex items-center justify-center shadow-[4px_4px_0px_0px_#0D0D0D]">
          <Crown className="w-6 h-6 text-[#0D0D0D] fill-current" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-12 h-12 bg-[#0022FF] border-4 border-[#0D0D0D] flex items-center justify-center shadow-[4px_4px_0px_0px_#0D0D0D]">
          <Medal className="w-6 h-6 text-white fill-current" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-12 h-12 bg-[#FF4D4D] border-4 border-[#0D0D0D] flex items-center justify-center shadow-[4px_4px_0px_0px_#0D0D0D]">
          <Medal className="w-6 h-6 text-white fill-current" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 bg-[#F2F0E9] border-4 border-[#0D0D0D] flex items-center justify-center font-black text-xl text-[#0D0D0D]">
        #{rank}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9] p-4 md:p-8 font-mono overflow-x-hidden">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(90deg,#0D0D0D_1px,transparent_1px),linear-gradient(#0D0D0D_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <button
            onClick={() => navigate("/mode/ranked")}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-6 hover:text-[#0022FF] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b-8 border-[#0D0D0D] pb-6">
            <div>
              <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic leading-[0.9] text-[#0D0D0D] drop-shadow-[4px_4px_0px_rgba(204,255,0,1)]">
                Global
                <br />
                Leaderboard
              </h1>
            </div>
            <div className="bg-[#0D0D0D] text-[#CCFF00] px-6 py-3 transform rotate-2 shadow-[8px_8px_0px_0px_#0022FF] border-4 border-transparent">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8" />
                <span className="text-xl font-black uppercase tracking-widest">Top 50 Elite</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-16 h-16 animate-spin text-[#0022FF] mb-4" />
            <p className="font-black uppercase tracking-widest text-xl animate-pulse">Loading Rankings...</p>
          </div>
        ) : !data?.leaderboard?.length ? (
          <div className="bg-[#FFFFFF] border-4 border-[#0D0D0D] p-12 text-center shadow-[8px_8px_0px_0px_#0D0D0D]">
            <h3 className="text-3xl font-black uppercase italic mb-4">No Warriors Found</h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest">Be the first to claim your spot.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table Header - Desktop Only */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-black uppercase tracking-widest text-gray-500 border-b-4 border-[#0D0D0D] mb-4">
              <div className="col-span-2">Rank</div>
              <div className="col-span-3">Player</div>
              <div className="col-span-2">Tier</div>
              <div className="col-span-2 text-right">MMR</div>
              <div className="col-span-2 text-center">W/L</div>
              <div className="col-span-1 text-right">Streak</div>
            </div>

            {/* List Items */}
            <div className="space-y-4">
              {data.leaderboard.map((player, index) => (
                <motion.div
                  key={player.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white border-4 border-[#0D0D0D] p-4 md:px-6 md:py-4 shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-[8px_8px_0px_0px_#CCFF00] hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex flex-col md:grid md:grid-cols-12 items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-between w-full md:col-span-2 md:justify-start">
                      <span className="md:hidden font-black uppercase text-xs text-gray-400">Rank</span>
                      {getRankBadge(player.rank)}
                    </div>

                    {/* Username */}
                    <div className="w-full md:col-span-3">
                      <div className="font-black text-xl md:text-2xl uppercase tracking-tight truncate">
                        {player.username}
                      </div>
                    </div>

                    {/* Tier */}
                    <div className="flex items-center justify-between w-full md:col-span-2">
                      <span className="md:hidden font-black uppercase text-xs text-gray-400">Tier</span>
                      <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-[#0D0D0D] ${TIER_COLORS[player.tier] || "bg-gray-200"} ${TIER_TEXT_COLORS[player.tier] || "text-black"}`}>
                        {player.tier}
                      </span>
                    </div>

                    {/* MMR */}
                    <div className="flex items-center justify-between w-full md:col-span-2 md:justify-end">
                      <span className="md:hidden font-black uppercase text-xs text-gray-400">Rating</span>
                      <span className="font-black text-xl tabular-nums">{player.mmr}</span>
                    </div>

                    {/* W/L Record */}
                    <div className="flex items-center justify-between w-full md:col-span-2 md:justify-center">
                      <span className="md:hidden font-black uppercase text-xs text-gray-400">Record</span>
                      <div className="flex items-center gap-1 font-bold text-sm">
                        <span className="text-[#0022FF]">{player.wins}W</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-[#FF4D4D]">{player.losses}L</span>
                      </div>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center justify-between w-full md:col-span-1 md:justify-end">
                      <span className="md:hidden font-black uppercase text-xs text-gray-400">Streak</span>
                      <div className="font-black flex items-center gap-1">
                        {player.winStreak > 0 ? (
                          <>
                            <span className="text-xl tabular-nums">{player.winStreak}</span>
                            <span className="text-xl">🔥</span>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
