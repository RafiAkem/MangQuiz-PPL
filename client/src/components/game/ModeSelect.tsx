import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, ArrowRight, Gamepad2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ModeSelect() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-slate-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-8 left-8 z-20"
            >
                <Button
                    variant="ghost"
                    onClick={() => navigate("/")}
                    className="text-slate-400 hover:text-white hover:bg-white/5 gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Intro
                </Button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16 relative z-10"
            >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    Choose Your <span className="text-gold-400">Path</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-lg mx-auto">
                    Select how you want to play. Challenge friends locally or compete globally.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full relative z-10">
                {/* Local Mode Card */}
                <ModeCard
                    title="Local Party"
                    description="Play with 2-4 friends on a single device. Perfect for parties and gatherings."
                    icon={<Gamepad2 className="w-10 h-10 text-emerald-400" />}
                    color="emerald"
                    onClick={() => navigate("/mode/local")}
                    delay={0.2}
                />

                {/* Multiplayer Mode Card */}
                <ModeCard
                    title="Online Multiplayer"
                    description="Join rooms, host games, and compete with players from around the world."
                    icon={<Globe className="w-10 h-10 text-blue-400" />}
                    color="blue"
                    onClick={() => navigate("/mode/multiplayer")}
                    delay={0.4}
                />
            </div>
        </div>
    );
}

interface ModeCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: "emerald" | "blue";
    onClick: () => void;
    delay: number;
}

function ModeCard({ title, description, icon, color, onClick, delay }: ModeCardProps) {
    const colorStyles = {
        emerald: "hover:border-emerald-500/50 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.1)]",
        blue: "hover:border-blue-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.1)]",
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={onClick}
            className={`
        group cursor-pointer relative overflow-hidden
        bg-white/5 backdrop-blur-md border border-white/5 rounded-3xl p-8
        transition-all duration-300
        ${colorStyles[color]}
      `}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {icon}
            </div>

            <div className="mb-6 p-4 bg-white/5 rounded-2xl inline-block group-hover:bg-white/10 transition-colors">
                {icon}
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-gold-400 transition-colors">
                {title}
            </h3>

            <p className="text-slate-400 mb-8 leading-relaxed group-hover:text-slate-300 transition-colors">
                {description}
            </p>

            <div className="flex items-center text-white/40 text-sm font-medium group-hover:text-white transition-colors">
                Select Mode <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
        </motion.div>
    );
}
