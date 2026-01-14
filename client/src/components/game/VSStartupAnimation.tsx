import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Player {
    id: string;
    name: string;
    isHost: boolean;
}

interface VSStartupAnimationProps {
    player1: Player | null;
    player2: Player | null;
    countdown: number;
    onComplete?: () => void;
}

export function VSStartupAnimation({ player1, player2, countdown, onComplete }: VSStartupAnimationProps) {
    const [showVS, setShowVS] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);

    useEffect(() => {
        // Show VS animation first
        const vsTimer = setTimeout(() => setShowVS(true), 300);
        // Then show countdown
        const countdownTimer = setTimeout(() => setShowCountdown(true), 1500);

        return () => {
            clearTimeout(vsTimer);
            clearTimeout(countdownTimer);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#F2F0E9] flex items-center justify-center overflow-hidden font-mono"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,#0D0D0D_1px,transparent_1px),linear-gradient(#0D0D0D_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.05]" />
            </div>

            {/* Diagonal Slash Background */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute inset-0 overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-[60%] h-full bg-[#0022FF]/10 transform -skew-x-12 origin-top-left" />
                <div className="absolute top-0 right-0 w-[60%] h-full bg-[#FF4D4D]/10 transform skew-x-12 origin-top-right" />
            </motion.div>

            {/* Player 1 - Left Side */}
            <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.3 }}
                className="absolute left-[10%] md:left-[15%] flex flex-col items-center"
            >
                <div className="relative">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#0022FF] border-4 border-[#0D0D0D] flex items-center justify-center text-5xl md:text-6xl font-black text-[#F2F0E9] shadow-[8px_8px_0px_0px_#0D0D0D] relative z-10">
                        {player1?.name?.charAt(0).toUpperCase() || "P1"}
                    </div>
                </div>
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 text-2xl md:text-3xl font-black text-[#0D0D0D] tracking-tight uppercase"
                >
                    {player1?.name || "Player 1"}
                </motion.h3>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-2 px-4 py-2 bg-[#0022FF] border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D]"
                >
                    <span className="text-sm font-bold text-[#F2F0E9] uppercase tracking-wider">
                        {player1?.isHost ? "Host" : "Challenger"}
                    </span>
                </motion.div>
            </motion.div>

            {/* VS Text - Center */}
            <AnimatePresence>
                {showVS && (
                    <motion.div
                        initial={{ scale: 3, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 10, stiffness: 100 }}
                        className="relative z-20"
                    >
                        {/* VS Text */}
                        <span className="relative text-8xl md:text-9xl font-black text-[#CCFF00] select-none drop-shadow-[8px_8px_0px_#0D0D0D] [-webkit-text-stroke:4px_#0D0D0D]">
                            VS
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Player 2 - Right Side */}
            <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.3 }}
                className="absolute right-[10%] md:right-[15%] flex flex-col items-center"
            >
                <div className="relative">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#FF4D4D] border-4 border-[#0D0D0D] flex items-center justify-center text-5xl md:text-6xl font-black text-[#0D0D0D] shadow-[8px_8px_0px_0px_#0D0D0D] relative z-10">
                        {player2?.name?.charAt(0).toUpperCase() || "P2"}
                    </div>
                </div>
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 text-2xl md:text-3xl font-black text-[#0D0D0D] tracking-tight uppercase"
                >
                    {player2?.name || "Player 2"}
                </motion.h3>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-2 px-4 py-2 bg-[#FF4D4D] border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D]"
                >
                    <span className="text-sm font-bold text-[#0D0D0D] uppercase tracking-wider">
                        {player2?.isHost ? "Host" : "Challenger"}
                    </span>
                </motion.div>
            </motion.div>

            {/* Countdown - Bottom Center */}
            <AnimatePresence>
                {showCountdown && countdown > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 2 }}
                        className="absolute bottom-[15%] flex flex-col items-center"
                    >
                        <span className="text-sm font-black text-[#0D0D0D] uppercase tracking-[0.3em] mb-4 bg-[#CCFF00] px-2 border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D]">
                            Battle Starts In
                        </span>
                        <motion.div
                            key={countdown}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="relative"
                        >
                            <span className="relative text-8xl md:text-9xl font-black text-[#0D0D0D] drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                                {countdown}
                            </span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* GO! Text when countdown reaches 0 */}
            <AnimatePresence>
                {showCountdown && countdown === 0 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        exit={{ scale: 2, opacity: 0 }}
                        transition={{ type: "spring", damping: 10 }}
                        className="absolute bottom-[15%] flex flex-col items-center"
                    >
                        <span className="text-8xl md:text-9xl font-black text-[#0D0D0D] drop-shadow-[8px_8px_0px_#CCFF00] [-webkit-text-stroke:2px_#0D0D0D]">
                            GO!
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spark Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: "50%",
                            y: "50%",
                            scale: 0,
                            opacity: 1,
                        }}
                        animate={{
                            x: `${Math.random() * 100}%`,
                            y: `${Math.random() * 100}%`,
                            scale: [0, 1, 0],
                            opacity: [1, 1, 0],
                        }}
                        transition={{
                            duration: 2,
                            delay: 0.5 + i * 0.1,
                            repeat: Infinity,
                            repeatDelay: 3,
                        }}
                        className="absolute w-2 h-2 bg-[#0D0D0D] border border-[#F2F0E9]"
                    />
                ))}
            </div>
        </motion.div>
    );
}
