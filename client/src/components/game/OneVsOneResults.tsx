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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface OneVsOneResultsProps {
    gameState: any;
    players: any[];
    playerId?: string;
    roomId?: string;
}

export function OneVsOneResults({
    gameState,
    players,
    playerId,
    roomId,
}: OneVsOneResultsProps) {
    const navigate = useNavigate();

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
        const playerName = localStorage.getItem("quizRushPlayerName") || "";
        if (playerName) {
            navigate("/mode/1v1", { state: { quickMatch: true } });
        } else {
            navigate("/mode/1v1");
        }
    };

    const handleGoHome = () => {
        navigate("/mode");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-0 left-0 w-[600px] h-[600px] ${isCurrentPlayerWinner && !isTie ? 'bg-emerald-500/10' : 'bg-red-500/10'} rounded-full blur-[150px]`} />
                <div className={`absolute bottom-0 right-0 w-[600px] h-[600px] ${isCurrentPlayerWinner && !isTie ? 'bg-emerald-500/10' : 'bg-red-500/10'} rounded-full blur-[150px]`} />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
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
                                <Swords className="w-12 h-12 text-amber-400" />
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-amber-400 mb-2">
                                DRAW!
                            </h1>
                            <p className="text-slate-400 text-lg">Both players tied!</p>
                        </>
                    ) : isCurrentPlayerWinner ? (
                        <>
                            <motion.div
                                initial={{ rotate: -10, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="inline-flex items-center justify-center gap-4 mb-4"
                            >
                                <Trophy className="w-16 h-16 text-amber-400" />
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-emerald-400 mb-2">
                                VICTORY!
                            </h1>
                            <p className="text-slate-400 text-lg">You crushed it!</p>
                        </>
                    ) : (
                        <>
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="inline-flex items-center justify-center gap-4 mb-4"
                            >
                                <Skull className="w-12 h-12 text-red-400" />
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-red-400 mb-2">
                                DEFEAT
                            </h1>
                            <p className="text-slate-400 text-lg">Better luck next time!</p>
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
                            <div className={`relative p-6 md:p-8 border-2 ${winner?.id === playerId ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                                {/* Crown for winner */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="bg-amber-500 p-2 rounded-full">
                                        <Crown className="w-6 h-6 text-slate-900" />
                                    </div>
                                </div>

                                <div className="text-center pt-4">
                                    <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full ${winner?.id === playerId ? 'bg-emerald-500' : 'bg-slate-700'} flex items-center justify-center text-3xl md:text-4xl font-black text-white mb-4`}>
                                        {winner?.name?.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                                            {winner?.name}
                                        </h3>
                                        {winner?.id === playerId && (
                                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">YOU</span>
                                        )}
                                    </div>

                                    <div className="text-5xl md:text-6xl font-black text-amber-400 mb-2">
                                        {winnerStats.correctAnswers}
                                    </div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-4">Points</div>

                                    <div className="flex justify-center gap-4">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-white">{winnerStats.accuracy}%</div>
                                            <div className="text-[10px] text-slate-500 uppercase">Accuracy</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* VS Divider */}
                        <div className="flex-shrink-0 relative">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                                <span className="text-2xl md:text-3xl font-black text-slate-500">VS</span>
                            </div>
                        </div>

                        {/* Loser Card */}
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex-1 max-w-xs"
                        >
                            <div className={`relative p-6 md:p-8 border-2 ${loser?.id === playerId ? 'bg-red-500/10 border-red-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                                <div className="text-center">
                                    <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full ${loser?.id === playerId ? 'bg-red-500' : 'bg-slate-700'} flex items-center justify-center text-3xl md:text-4xl font-black text-white mb-4 opacity-75`}>
                                        {loser?.name?.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-xl md:text-2xl font-bold text-slate-400 mb-1">
                                            {loser?.name}
                                        </h3>
                                        {loser?.id === playerId && (
                                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">YOU</span>
                                        )}
                                    </div>

                                    <div className="text-5xl md:text-6xl font-black text-slate-500 mb-2">
                                        {loserStats.correctAnswers}
                                    </div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">Points</div>

                                    <div className="flex justify-center gap-4">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-slate-400">{loserStats.accuracy}%</div>
                                            <div className="text-[10px] text-slate-600 uppercase">Accuracy</div>
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
                    <div className="p-4 bg-slate-900/50 border border-slate-800 text-center">
                        <Target className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{totalQuestions}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Questions</div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border border-slate-800 text-center">
                        <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">
                            +{Math.abs((winnerStats.correctAnswers || 0) - (loserStats.correctAnswers || 0))}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">Margin</div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border border-slate-800 text-center">
                        <Swords className="w-5 h-5 text-red-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">1v1</div>
                        <div className="text-[10px] text-slate-500 uppercase">Mode</div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-4 max-w-md mx-auto"
                >
                    <Button
                        onClick={handlePlayAgain}
                        className={`flex-1 font-bold py-6 rounded-xl transition-all ${
                            isCurrentPlayerWinner && !isTie
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                                : 'bg-red-500 hover:bg-red-400 text-white'
                        }`}
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        {isCurrentPlayerWinner && !isTie ? 'DEFEND TITLE' : 'REMATCH'}
                    </Button>
                    <Button
                        onClick={handleGoHome}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-6 rounded-xl border border-slate-700"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        MENU
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
