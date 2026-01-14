import { motion } from "framer-motion";
import {
    Trophy,
    Crown,
    Skull,
    RotateCcw,
    Home,
    Swords,
    Target,
    Zap,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface OneVsOneResultsProps {
    gameState: any;
    players: any[];
    playerId?: string;
    roomId?: string;
    isRanked?: boolean;
}

export function OneVsOneResults({
    gameState,
    players,
    playerId,
    roomId,
    isRanked,
}: OneVsOneResultsProps) {
    const navigate = useNavigate();

    // Get ranked result if available
    const rankedResult = gameState?.rankedResult;

    const sortedPlayers = [...players].sort((a, b) => {
        const scoreA = gameState?.scores?.[a.id] || 0;
        const scoreB = gameState?.scores?.[b.id] || 0;
        return scoreB - scoreA;
    });

    const winner = sortedPlayers[0];
    const loser = sortedPlayers[1];
    const totalQuestions = gameState?.questions?.length || 0;
    const isCurrentPlayerWinner = winner?.id === playerId;
    const isTie = (gameState?.scores?.[winner?.id] || 0) === (gameState?.scores?.[loser?.id] || 0);

    const getPlayerStats = (player: any) => {
        const correctAnswers = gameState?.scores?.[player?.id] || 0;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        return { correctAnswers, accuracy };
    };

    const winnerStats = getPlayerStats(winner);
    const loserStats = getPlayerStats(loser);

    const handlePlayAgain = () => {
        if (isRanked) {
            // For ranked, go back to ranked dashboard
            navigate("/ranked");
        } else {
            const playerName = localStorage.getItem("quizRushPlayerName") || "";
            if (playerName) {
                navigate("/mode/1v1", { state: { quickMatch: true } });
            } else {
                navigate("/mode/1v1");
            }
        }
    };

    const handleGoHome = () => {
        navigate("/mode");
    };

    return (
        <div className="min-h-screen bg-[#F2F0E9] text-[#0D0D0D] font-body relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,#0D0D0D_1px,transparent_1px),linear-gradient(#0D0D0D_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.03]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 max-w-5xl py-8">
                {/* Result Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-12"
                >
                    {isTie ? (
                        <>
                            <div className="inline-flex items-center justify-center gap-4 mb-4">
                                <Swords className="w-12 h-12 text-[#0D0D0D]" />
                            </div>
                            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight text-[#0D0D0D] mb-2">
                                DRAW!
                            </h1>
                            <p className="text-[#0D0D0D] text-lg font-mono">Both players tied!</p>
                        </>
                    ) : isCurrentPlayerWinner ? (
                        <>
                            <motion.div
                                initial={{ rotate: -10, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="inline-flex items-center justify-center gap-4 mb-4"
                            >
                                <Trophy className="w-16 h-16 text-[#0D0D0D] fill-[#CCFF00]" />
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight text-[#0D0D0D] mb-2">
                                VICTORY!
                            </h1>
                            <p className="text-[#0D0D0D] text-lg font-mono">You crushed it!</p>
                        </>
                    ) : (
                        <>
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="inline-flex items-center justify-center gap-4 mb-4"
                            >
                                <Skull className="w-12 h-12 text-[#0D0D0D] fill-[#FF4D4D]" />
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight text-[#0D0D0D] mb-2">
                                DEFEAT
                            </h1>
                            <p className="text-[#0D0D0D] text-lg font-mono">Better luck next time!</p>
                        </>
                    )}
                </motion.div>

                {/* VS Battle Display */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                >
                    <div className="flex items-center justify-center gap-6 md:gap-12">
                        {/* Winner Card */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex-1 max-w-xs"
                        >
                            <div className={`relative p-6 md:p-8 border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] ${winner?.id === playerId ? 'bg-[#CCFF00]' : 'bg-white'}`}>
                                {/* Crown for winner */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="bg-[#0D0D0D] p-2 rounded-full border-2 border-[#0D0D0D]">
                                        <Crown className="w-6 h-6 text-[#CCFF00]" />
                                    </div>
                                </div>

                                <div className="text-center pt-4">
                                    <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full border-2 border-[#0D0D0D] ${winner?.id === playerId ? 'bg-white text-[#0D0D0D]' : 'bg-[#CCFF00] text-[#0D0D0D]'} flex items-center justify-center text-3xl md:text-4xl font-black mb-4`}>
                                        {winner?.name?.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-xl md:text-2xl font-bold font-display text-[#0D0D0D] mb-1">
                                            {winner?.name}
                                        </h3>
                                        {winner?.id === playerId && (
                                            <span className="text-xs bg-[#0D0D0D] text-white px-2 py-0.5 border border-[#0D0D0D] font-mono">YOU</span>
                                        )}
                                    </div>

                                    <div className="text-5xl md:text-6xl font-black font-display text-[#0D0D0D] mb-2">
                                        {winnerStats.correctAnswers}
                                    </div>
                                    <div className="text-xs text-[#0D0D0D] uppercase tracking-wider font-mono mb-4">Points</div>

                                    <div className="flex justify-center gap-4">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-[#0D0D0D]">{winnerStats.accuracy}%</div>
                                            <div className="text-[10px] text-[#0D0D0D] uppercase font-mono">Accuracy</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* VS Divider */}
                        <div className="flex-shrink-0 relative">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#0D0D0D] border-2 border-[#0D0D0D] flex items-center justify-center">
                                <span className="text-2xl md:text-3xl font-black text-white font-display">VS</span>
                            </div>
                        </div>

                        {/* Loser Card */}
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex-1 max-w-xs"
                        >
                            <div className={`relative p-6 md:p-8 border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] ${loser?.id === playerId ? 'bg-[#FF4D4D]' : 'bg-white'}`}>
                                <div className="text-center">
                                    <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full border-2 border-[#0D0D0D] ${loser?.id === playerId ? 'bg-white text-[#0D0D0D]' : 'bg-[#FF4D4D] text-[#0D0D0D]'} flex items-center justify-center text-3xl md:text-4xl font-black mb-4`}>
                                        {loser?.name?.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-xl md:text-2xl font-bold font-display text-[#0D0D0D] mb-1">
                                            {loser?.name}
                                        </h3>
                                        {loser?.id === playerId && (
                                            <span className="text-xs bg-[#0D0D0D] text-white px-2 py-0.5 border border-[#0D0D0D] font-mono">YOU</span>
                                        )}
                                    </div>

                                    <div className="text-5xl md:text-6xl font-black font-display text-[#0D0D0D] mb-2 opacity-75">
                                        {loserStats.correctAnswers}
                                    </div>
                                    <div className="text-xs text-[#0D0D0D] uppercase tracking-wider font-mono mb-4">Points</div>

                                    <div className="flex justify-center gap-4">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-[#0D0D0D]">{loserStats.accuracy}%</div>
                                            <div className="text-[10px] text-[#0D0D0D] uppercase font-mono">Accuracy</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Match Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8"
                >
                    <div className="p-4 bg-white border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] text-center">
                        <Target className="w-5 h-5 text-[#0D0D0D] mx-auto mb-2" />
                        <div className="text-2xl font-bold text-[#0D0D0D] font-mono">{totalQuestions}</div>
                        <div className="text-[10px] text-[#0D0D0D] uppercase font-mono">Questions</div>
                    </div>
                    <div className="p-4 bg-white border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] text-center">
                        <Zap className="w-5 h-5 text-[#CCFF00] fill-[#CCFF00] stroke-[#0D0D0D] mx-auto mb-2" />
                        <div className="text-2xl font-bold text-[#0D0D0D] font-mono">
                            +{Math.abs((winnerStats.correctAnswers || 0) - (loserStats.correctAnswers || 0))}
                        </div>
                        <div className="text-[10px] text-[#0D0D0D] uppercase font-mono">Margin</div>
                    </div>
                    <div className="p-4 bg-white border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] text-center">
                        <Swords className="w-5 h-5 text-[#FF4D4D] fill-[#FF4D4D] stroke-[#0D0D0D] mx-auto mb-2" />
                        <div className="text-2xl font-bold text-[#0D0D0D] font-mono">1v1</div>
                        <div className="text-[10px] text-[#0D0D0D] uppercase font-mono">Mode</div>
                    </div>
                </motion.div>

                {/* Ranked MMR Change */}
                {isRanked && rankedResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.55 }}
                        className="max-w-md mx-auto mb-8"
                    >
                        <div className={`p-6 border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] ${
                            rankedResult.isWinner ? 'bg-[#CCFF00]' : 'bg-[#FF4D4D]'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-mono uppercase tracking-wider text-[#0D0D0D]/70 mb-1">
                                        LP {rankedResult.mmrChange >= 0 ? 'GAINED' : 'LOST'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {rankedResult.mmrChange >= 0 ? (
                                            <TrendingUp className="w-6 h-6 text-[#0D0D0D]" />
                                        ) : (
                                            <TrendingDown className="w-6 h-6 text-[#0D0D0D]" />
                                        )}
                                        <span className="text-3xl font-black text-[#0D0D0D]">
                                            {rankedResult.mmrChange >= 0 ? '+' : ''}{rankedResult.mmrChange}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-mono uppercase tracking-wider text-[#0D0D0D]/70 mb-1">
                                        NEW RATING
                                    </p>
                                    <p className="text-2xl font-black text-[#0D0D0D]">{rankedResult.newMmr}</p>
                                    <p className="text-xs font-black uppercase bg-[#0D0D0D] text-white px-2 py-0.5 inline-block mt-1">
                                        {rankedResult.newTier}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-4 max-w-md mx-auto"
                >
                    <Button
                        onClick={handlePlayAgain}
                        className={`flex-1 font-bold py-6 rounded-none border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-[#0D0D0D] ${
                            isCurrentPlayerWinner && !isTie
                                ? 'bg-[#CCFF00] hover:bg-[#CCFF00]'
                                : 'bg-[#FF4D4D] hover:bg-[#FF4D4D]'
                        }`}
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        {isRanked ? 'FIND ANOTHER' : (isCurrentPlayerWinner && !isTie ? 'DEFEND TITLE' : 'REMATCH')}
                    </Button>
                    <Button
                        onClick={handleGoHome}
                        className="flex-1 bg-white hover:bg-gray-50 text-[#0D0D0D] font-bold py-6 rounded-none border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        MENU
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
